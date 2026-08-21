import * as extensionizer from 'extensionizer';
import NotificationManager from '@core/NotificationManager';
import WasmWallet from '@core/WasmWallet';
import { getWalletLocked, initLockState } from '@core/lockState';
import { Asset, ExternalAppMethod } from '@core/types';
import { RemoteRequest } from '@app/core/types';
import {
  AddressData,
  ChangeData,
  RPCMethod,
  RemoteResponse,
  WalletStatus,
  Environment,
  CreateWalletParams,
  CreateAddressParams,
  SendTransactionParams,
  TransactionDetail,
  ExternalAppConnection,
  BackgroundEvent,
  ConnectedData,
} from './types';

const wallet = WasmWallet.getInstance();
const notificationManager = NotificationManager.getInstance();

export function getEnvironment(href = window.location.href) {
  const url = new URL(href);
  switch (url.pathname) {
    case '/popup.html':
      return Environment.POPUP;
    case '/page.html':
      return Environment.FULLSCREEN;
    case '/offscreen.html':
      return Environment.OFFSCREEN;
    case '/notification.html':
      return Environment.NOTIFICATION;
    default:
      return Environment.BACKGROUND;
  }
}

const IS_ENGINE = getEnvironment() === Environment.OFFSCREEN;

let port;

let contentPort = null;
let notificationPort = null;
let connected = false;
let activeTab = null;

type BeamRpcRequestMessage = {
  type: 'BEAM_WALLET_RPC_REQUEST';
  version: 1;
  payload: {
    id: string;
    method: string;
    params?: any;
    appname?: string;
  };
};

type BeamRpcPushMessage = {
  type: 'BEAM_WALLET_RPC_PUSH';
  version: 1;
  payload: { json: string };
};

type BeamRpcErrorMessage = {
  type: 'BEAM_WALLET_RPC_ERROR';
  version: 1;
  payload: {
    id?: string;
    error: { code: number; message: string; data?: any };
  };
};

// Multiple tabs from the same origin should not overwrite each other (dnode did).
const externalRpcPortsByOrigin: Record<string, Set<chrome.runtime.Port>> = {};

// Track the dApp name per origin so we never use a global singleton that
// collapses under multi-tab scenarios.
const appnameByOrigin = new Map<string, string>();

function getSenderOrigin(sender: any): string | null {
  if (!sender) return null;
  if (typeof sender.origin === 'string' && sender.origin.length) return sender.origin;
  if (typeof sender.url === 'string' && sender.url.length) {
    try {
      return new URL(sender.url).origin;
    } catch {
      return null;
    }
  }
  return null;
}

function addExternalRpcPort(origin: string, p: chrome.runtime.Port) {
  if (!externalRpcPortsByOrigin[origin]) {
    externalRpcPortsByOrigin[origin] = new Set();
  }
  externalRpcPortsByOrigin[origin].add(p);
}

function removeExternalRpcPort(origin: string, p: chrome.runtime.Port) {
  externalRpcPortsByOrigin[origin]?.delete(p);
  if (externalRpcPortsByOrigin[origin]?.size === 0) {
    delete externalRpcPortsByOrigin[origin];
  }
}

function broadcastToOrigin(origin: string, msg: BeamRpcPushMessage | BeamRpcErrorMessage) {
  externalRpcPortsByOrigin[origin]?.forEach((p) => {
    try {
      p.postMessage(msg);
    } catch {
      // ignore dead port
    }
  });
}

// =====================================================================================
// Engine (offscreen) <-> UI bridge
// =====================================================================================

type UiRpcMessage = { kind: 'rpc'; uiReqId: number; op: string; args: any[] };
type UiResMessage = { kind: 'res'; uiReqId: number; result?: any; error?: any };
type UiEventMessage = { kind: 'event'; data: RemoteResponse };
type UiHelloMessage = { kind: 'hello'; connected: ConnectedData };
type UiActionMessage = { action: string; params?: any };
type UiInbound = UiResMessage | UiEventMessage | UiHelloMessage;

function serializeError(e: any) {
  if (e == null) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  try {
    return JSON.parse(JSON.stringify(e));
  } catch {
    return String(e);
  }
}

// -------------------------------------------------------------------------------------
// UI-side client (popup / notification)
// -------------------------------------------------------------------------------------

let enginePort: chrome.runtime.Port | null = null;
let enginePortReady: Promise<chrome.runtime.Port> | null = null;
let uiReqSeq = 0;
const pendingRpc: Map<number, { resolve: (v: any) => void; reject: (e: any) => void }> = new Map();
let eventEmitter: ((data: RemoteResponse) => void) | null = null;

function onEngineMessage(msg: UiInbound) {
  if (!msg) return;
  if (msg.kind === 'res') {
    const entry = pendingRpc.get(msg.uiReqId);
    if (entry) {
      pendingRpc.delete(msg.uiReqId);
      if (msg.error !== undefined && msg.error !== null) {
        entry.reject(msg.error);
      } else {
        entry.resolve(msg.result);
      }
    }
    return;
  }
  if (msg.kind === 'event') {
    eventEmitter?.(msg.data);
    return;
  }
  if (msg.kind === 'hello') {
    eventEmitter?.({
      id: BackgroundEvent.CONNECTED,
      method: undefined as any,
      result: msg.connected,
      error: undefined,
    });
  }
}

function ensureEnginePort(): Promise<chrome.runtime.Port> {
  if (enginePort) return Promise.resolve(enginePort);
  if (enginePortReady) return enginePortReady;

  enginePortReady = new Promise<chrome.runtime.Port>((resolve) => {
    const finishConnect = () => {
      const env = getEnvironment();
      const name = env === Environment.NOTIFICATION ? Environment.NOTIFICATION : Environment.POPUP;
      const p = extensionizer.runtime.connect({ name });
      p.onMessage.addListener(onEngineMessage);
      p.onDisconnect.addListener(() => {
        enginePort = null;
        enginePortReady = null;
      });
      enginePort = p;
      resolve(p);
    };

    // Ask the service worker to (idempotently) create the offscreen engine before
    // we connect — otherwise a cold-started browser has no engine to accept the port.
    try {
      extensionizer.runtime.sendMessage({ target: 'sw', type: 'ensure-offscreen' }, () => {
        // Read lastError so Chrome doesn't log "Unchecked runtime.lastError".
        if (extensionizer.runtime.lastError) {
          /* offscreen ensured elsewhere; ignore */
        }
        finishConnect();
      });
    } catch {
      finishConnect();
    }
  });

  return enginePortReady;
}

function rpc<T = any>(op: string, args: any[] = []): Promise<T> {
  uiReqSeq += 1;
  const uiReqId = uiReqSeq;
  return ensureEnginePort().then(
    (p) => new Promise<T>((resolve, reject) => {
      pendingRpc.set(uiReqId, { resolve, reject });
      const message: UiRpcMessage = {
        kind: 'rpc',
        uiReqId,
        op,
        args,
      };
      p.postMessage(message);
    }),
  );
}

/**
 * Wraps an engine operation. In the offscreen (engine) context it runs the real
 * WASM-backed implementation; in a UI context it forwards the call to the engine.
 */
function engineOp<A extends any[], R>(op: string, impl: (...a: A) => R) {
  return (...args: A): Promise<Awaited<R>> => (IS_ENGINE ? Promise.resolve(impl(...args)) : rpc<Awaited<R>>(op, args));
}

/** Wire the UI event stream (used by the shared saga's remoteEventChannel). */
export function connectEngine(emitter: (data: RemoteResponse) => void): Promise<chrome.runtime.Port> {
  eventEmitter = emitter;
  return ensureEnginePort().then((p) => {
    if (getEnvironment() === Environment.NOTIFICATION) {
      notificationManager.setReqPort(p);
    }
    return p;
  });
}

export function disconnectEngine() {
  eventEmitter = null;
}

// -------------------------------------------------------------------------------------
// Engine-side (offscreen) server
// -------------------------------------------------------------------------------------

// Every connected UI port (popup + notification window). Engine push events fan out here.
const enginePorts = new Set<chrome.runtime.Port>();

function broadcastEvent(data: RemoteResponse) {
  const message: UiEventMessage = { kind: 'event', data };
  enginePorts.forEach((p) => {
    try {
      p.postMessage(message);
    } catch {
      // ignore dead port
    }
  });
}

// Resolves once the engine has mounted WASM and computed its initial state.
let engineReady: Promise<void> | null = null;

// Engine push callback forwards async wallet callbacks to every tab for that origin.
if (IS_ENGINE) {
  wallet.setExternalAppMessageHandler((appurl: string, json: string) => {
    const msg: BeamRpcPushMessage = {
      type: 'BEAM_WALLET_RPC_PUSH',
      version: 1,
      payload: { json },
    };
    broadcastToOrigin(appurl, msg);
  });
}

export function approveContractInfoRequest(req) {
  return wallet.notificationApproveInfo({ req });
}

export function rejectConnection(params?: { appurl?: string }) {
  if (params?.appurl) {
    notificationManager.sendAuthResponse({ result: false, errcode: -3, ermsg: 'Connection rejected' }, params.appurl);
  }
}

export function rejectContractInfoRequest(req) {
  return wallet.notificationRejectInfo({ req });
}

export function approveSendRequest(req) {
  return wallet.notificationApproveSend({ req });
}

export function rejectSendRequest(req) {
  return wallet.notificationRejectSend({ req });
}

export function approveConnection({
  apiver, apivermin, appname, appurl,
}) {
  return wallet.approveConnection({
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

function handleUiAction({ params, action }: UiActionMessage) {
  switch (action) {
    case 'connect':
      approveConnection(params);
      break;
    case 'connect_rejected':
      rejectConnection(params);
      break;
    case 'rejectSendRequest':
      rejectSendRequest(params);
      break;
    case 'approveSendRequest':
      approveSendRequest(params);
      break;
    case 'rejectContractInfoRequest':
      rejectContractInfoRequest(params);
      break;
    case 'approveContractInfoRequest':
      approveContractInfoRequest(params);
      break;
    default:
      break;
  }
}

async function handleUiRpc(remote: chrome.runtime.Port, msg: UiRpcMessage) {
  const { uiReqId, op, args } = msg;
  try {
    let result: any;
    if (op === '__post') {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      result = await enginePost(args[0], args[1]);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
    } else if (Object.prototype.hasOwnProperty.call(ENGINE_OPS, op)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      result = await ENGINE_OPS[op](...(args || []));
    } else {
      throw new Error(`Unknown engine op "${op}"`);
    }
    remote.postMessage({ kind: 'res', uiReqId, result } as UiResMessage);
  } catch (e) {
    remote.postMessage({ kind: 'res', uiReqId, error: serializeError(e) } as UiResMessage);
  }
}

// A port-like wrapper the engine can use exactly like a real chrome.runtime.Port.
// Used for dApp content-script connections relayed through the service worker.
type PortLike = {
  name: string;
  sender: any;
  postMessage: (msg: any) => void;
  onMessage: { addListener: (cb: (msg: any) => void) => void };
  onDisconnect: { addListener: (cb: () => void) => void };
  disconnect: () => void;
};

function makeRelayVirtualPort(relay: chrome.runtime.Port, name: string, sender: any): PortLike {
  return {
    name,
    sender,
    postMessage: (msg: any) => {
      try {
        relay.postMessage(msg);
      } catch {
        // relay already closed
      }
    },
    onMessage: { addListener: (cb: (msg: any) => void) => relay.onMessage.addListener((m: any) => cb(m)) },
    onDisconnect: { addListener: (cb: () => void) => relay.onDisconnect.addListener(() => cb()) },
    disconnect: () => {
      try {
        relay.disconnect();
      } catch {
        // noop
      }
    },
  };
}

// dApp RPC channel (BEAM_WALLET_RPC_REQUEST relay).
function setupContentPort(remote: PortLike) {
  NotificationManager.setPort(remote as any);
  const origin = getSenderOrigin(remote.sender);
  if (!origin) return;
  addExternalRpcPort(origin, remote as any);

  remote.onDisconnect.addListener(() => {
    removeExternalRpcPort(origin, remote as any);
    appnameByOrigin.delete(origin);
    // Clean up the WASM app API when the dApp's RPC channel closes (tab close / navigation).
    wallet.disconnectAppApi(origin);
  });

  remote.onMessage.addListener((msg: BeamRpcRequestMessage) => {
    if (!msg || msg.type !== 'BEAM_WALLET_RPC_REQUEST' || msg.version !== 1) return;
    const {
      id, method, params, appname,
    } = msg.payload || {};
    if (!id || !method) return;

    // Track appname per origin so multi-tab scenarios don't collide.
    if (appname) {
      appnameByOrigin.set(origin, String(appname).slice(0, 64));
    }

    Promise.resolve(wallet.callExternalWalletApi(origin, { id, method, params }))
      .then((ok) => {
        if (!ok) {
          broadcastToOrigin(origin, {
            type: 'BEAM_WALLET_RPC_ERROR',
            version: 1,
            payload: {
              id,
              error: { code: -32000, message: 'BeamApi not connected for this site' },
            },
          });
        }
      })
      .catch((e: any) => {
        broadcastToOrigin(origin, {
          type: 'BEAM_WALLET_RPC_ERROR',
          version: 1,
          payload: {
            id,
            error: { code: -32001, message: e?.message || 'BeamApi call failed', data: e },
          },
        });
      });
  });
}

// dApp auth handshake channel (create_beam_api relay).
function setupContentReqPort(remote: PortLike) {
  const reqOrigin = getSenderOrigin(remote.sender);
  if (reqOrigin) notificationManager.setContentReqPort(remote as any, reqOrigin);
  contentPort = remote;
  contentPort.onMessage.addListener(async (msg) => {
    const origin = getSenderOrigin(remote.sender);
    if (!origin) return;

    // Authoritative read: silently auto-reconnecting a dApp while the wallet is
    // locked is exactly what this gate exists to prevent.
    const isLocked = await getWalletLocked();

    if (wallet.isRunning() && !isLocked) {
      if (wallet.isConnectedSite({ appName: msg.appname, appUrl: origin })) {
        msg.appurl = origin;
        wallet.connectExternal(msg);
      } else if (msg.type === ExternalAppMethod.CreateBeamApi) {
        if (msg.is_reconnect && notificationManager.appname === msg.appname) {
          // eslint-disable-next-line
          notificationManager.openPopup();
        } else {
          notificationManager.openConnectNotification(msg, origin);
        }
      }
    } else {
      notificationManager.openAuthNotification(msg, origin);
    }
  });

  contentPort.onDisconnect.addListener(() => {
    // CONTENT_REQ ports are ephemeral (disconnected after auth succeeds) — do NOT
    // clean up the app API here. App API lifetime tracks the CONTENT (RPC) port.
  });
}

// Relay ports are opened by the service worker on behalf of a dApp content script.
// Name format: `relay:<content|content_req>:<encodeURIComponent(JSON sender)>`.
function handleRelayPort(relay: chrome.runtime.Port) {
  const parts = relay.name.split(':');
  const type = parts[1];
  let meta: { origin?: string; url?: string; tabId?: number } = {};
  try {
    meta = JSON.parse(decodeURIComponent(parts.slice(2).join(':')));
  } catch {
    meta = {};
  }
  const sender = {
    origin: meta.origin,
    url: meta.url,
    tab: meta.tabId != null ? { id: meta.tabId } : undefined,
  };
  const vport = makeRelayVirtualPort(relay, type, sender);

  if (type === Environment.CONTENT) {
    setupContentPort(vport);
  } else if (type === Environment.CONTENT_REQ) {
    setupContentReqPort(vport);
  }
}

function handleConnect(remote) {
  // dApp content-script traffic is relayed by the service worker (content scripts
  // cannot reach an offscreen document directly).
  if (remote.name && remote.name.startsWith('relay:')) {
    handleRelayPort(remote);
    return;
  }

  port = remote;
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`remote connected to "${port.name}"`);

  port.onDisconnect.addListener(() => {
    connected = false;
    return connected;
  });

  port.onMessage.addListener((msg: any) => {
    if (msg && msg.kind === 'rpc') {
      handleUiRpc(remote, msg as UiRpcMessage);
      return;
    }
    if (msg && (msg as RemoteRequest).action !== undefined) {
      handleUiAction(msg as UiActionMessage);
    }
  });

  switch (port.name) {
    case Environment.POPUP:
    case Environment.NOTIFICATION: {
      enginePorts.add(remote);

      if (port.name === Environment.NOTIFICATION) {
        const tabId = remote.sender?.tab?.id;
        if (tabId !== undefined) {
          notificationManager.openBeamTabsIDs[tabId] = true;
          activeTab = tabId;
        }
        notificationPort = remote;
        notificationPort.onDisconnect.addListener(() => {
          // Resolve the openPopup() promise immediately instead of waiting for the poll.
          notificationManager.closeNotification();
          if (activeTab) {
            activeTab = null;
            notificationManager.openBeamTabsIDs = {};
          }
        });
      }

      remote.onDisconnect.addListener(() => {
        enginePorts.delete(remote);
      });

      // Send the current engine state to this freshly-opened UI so it can route.
      (engineReady ?? Promise.resolve()).then(() => {
        try {
          remote.postMessage({ kind: 'hello', connected: wallet.getConnectedSnapshot() } as UiHelloMessage);
        } catch {
          // port already closed
        }
        // The engine keeps running across popup open/close. On the 2nd+ open the
        // wallet is already running & synced, so no live events fire and this UI
        // would show empty balances. Re-emit the current state so it rehydrates.
        wallet.replayStateToUi();
      });
      break;
    }
    // CONTENT / CONTENT_REQ never arrive here directly — content scripts cannot
    // message an offscreen document. They are relayed by the service worker as
    // `relay:*` ports and handled by handleRelayPort() below.
    default:
      break;
  }
}

export function initRemoteConnection() {
  // Hydrate the lock mirror before any dApp traffic can reach the engine.
  initLockState();

  extensionizer.runtime.onConnect.addListener(handleConnect);

  wallet.initContractInfoHandler((req, info, amounts, cb) => {
    // Keyed by req so concurrent approvals from different dApps don't clobber
    // each other; the notification manager queues the popups one at a time.
    wallet.registerContractInfoCallback(req, cb);
    const appname = appnameByOrigin.get(req?.appurl ?? '') ?? req?.appname;
    notificationManager.openContractNotification(req, info, amounts, appname);
  });

  wallet.initSendHandler((req, info, cb) => {
    wallet.registerSendCallback(req, cb);
    const appname = appnameByOrigin.get(req?.appurl ?? '') ?? req?.appname;
    notificationManager.openSendNotification(req, info, appname);
  });

  // Boot the WASM wallet engine. Every emitted event is broadcast to connected UIs.
  engineReady = Promise.resolve(wallet.init((data) => broadcastEvent(data as unknown as RemoteResponse), null)).then(
    () => undefined,
  );
}

/** Engine-only: send an RPC to the running WASM wallet and await its response. */
function enginePost<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  const target = wallet.send(method, params);
  if (target === null) {
    // send() returns null for WalletMethod values — those are dispatched internally
    // and never produce a response on the id we'd be waiting for. Fail loudly
    // instead of leaving the caller hanging forever.
    return Promise.reject(new Error(`"${method}" is not a wallet RPC method and cannot be awaited`));
  }
  return new Promise((resolve, reject) => {
    wallet.registerResponseHandler(target, (data: RemoteResponse) => {
      if (data.id === target) {
        wallet.removeResponseHandler(target);
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.result);
        }
      }
      // Non-matching events are ignored; handler stays registered until its own response arrives.
    });
  });
}

/**
 * Send a wallet RPC. In the engine this hits WASM directly; in the UI it is forwarded
 * to the offscreen engine over the port.
 */
export function postMessage<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  if (IS_ENGINE) return enginePost<T, P>(method, params);
  return rpc<T>('__post', [method, params]);
}

export const convertTokenToJson = engineOp('convertTokenToJson', (token: string) => WasmWallet.convertTokenToJson(token));

export const startWallet = engineOp('startWallet', (pass: string) => wallet.start(pass));

export const deleteWallet = engineOp('deleteWallet', (pass: string) => wallet.deleteWallet(pass));

export const stopWallet = engineOp('stopWallet', () => wallet.stop());

export const walletLocked = engineOp('walletLocked', () => wallet.lockWallet());

export const createWallet = engineOp('createWallet', (params: CreateWalletParams) => wallet.create(params));

export const isAllowedWord = engineOp('isAllowedWord', (value: string) => WasmWallet.isAllowedWord(value));

export const isAllowedSeed = engineOp('isAllowedSeed', (value: string[]) => WasmWallet.isAllowedSeed(value));

export const generateSeed = engineOp('generateSeed', () => WasmWallet.generateSeed());

export const loadBackgroundLogs = engineOp('loadBackgroundLogs', () => WasmWallet.loadLogs());

export const loadConnectedSites = engineOp('loadConnectedSites', () => wallet.loadConnectedSites());

export const disconnectAllowedSite = engineOp('disconnectAllowedSite', (params: ExternalAppConnection) => wallet.removeConnectedSite(params));

export const finishNotificationAuth = engineOp(
  'finishNotificationAuth',
  (apiver: string, apivermin: string, appname: string, appurl: string) => wallet.notificationAuthenticaticated({
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  }),
);

export const validateAddress = engineOp('validateAddress', async (address: string): Promise<AddressData> => {
  const result = await enginePost<AddressData>(RPCMethod.ValidateAddress, { address });
  const json = WasmWallet.convertTokenToJson(address);

  if (!json) {
    return result;
  }

  return {
    ...result,
    ...json,
  };
});

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  is_push_transaction: boolean;
}

export function getWalletStatus() {
  return postMessage<WalletStatus>(RPCMethod.GetWalletStatus);
}

export function createAddress(params: CreateAddressParams) {
  return postMessage<string>(RPCMethod.CreateAddress, params);
}

export function getVersion() {
  return postMessage(RPCMethod.GetVersion);
}

export function calculateChange(params: CalculateChangeParams) {
  return postMessage<ChangeData>(RPCMethod.CalculateChange, params);
}

export function sendTransaction(params: SendTransactionParams) {
  return postMessage(RPCMethod.SendTransaction, params);
}

export function getTransactionStatus(txId: string) {
  return postMessage<TransactionDetail>(RPCMethod.TxStatus, { txId, rates: true });
}

export function exportPaymentProof(txId: string) {
  return postMessage(RPCMethod.ExportPaymentProof, { txId });
}

export function verifyPaymentProof(payment_proof: string) {
  return postMessage(RPCMethod.VerifyPaymentProof, { payment_proof });
}

export async function getAssetsInfo(asset_ids: number[]) {
  return Promise.all(asset_ids.map((asset_id) => postMessage<Asset>(RPCMethod.GetAssetInfo, { asset_id })));
}
export function getAssetList({ refresh }: { refresh: boolean }) {
  return postMessage<Asset[]>(RPCMethod.AssetsList, { refresh });
}

export interface InvokeContractParams {
  args: string;
  contract?: number[];
  create_tx?: boolean;
  appurl?: string;
  appname?: string;
}

// Store pending contract calls by call ID
const pendingContractCalls: Map<
string,
{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}
> = new Map();

let internalCallId = 0;

// Store internal app APIs by appurl
const internalAppAPIs: Map<string, any> = new Map();

/**
 * Create an internal app API connection for contract invocations
 * This is required before calling invokeContract
 * Uses the same flow as external dApps via SDK
 */
async function createInternalAppAPIEngine(
  appurl: string,
  appname: string,
  apiver: string = '6.2',
  apivermin: string = '6.2',
): Promise<void> {
  // Check if already created
  if (internalAppAPIs.has(appurl)) {
    return;
  }

  // Create the app API connection with a handler for internal responses
  // Same pattern as SDK: createAppAPI -> setHandler -> callWalletApi
  const appApi = await (wallet as any).createAppAPI(apiver, apivermin, appurl, appname, (json: string) => {
    // Handler for API responses - same as SDK flow
    try {
      const response = JSON.parse(json);
      if (response.id && pendingContractCalls.has(String(response.id))) {
        const { resolve, reject } = pendingContractCalls.get(String(response.id))!;
        pendingContractCalls.delete(String(response.id));
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse API response:', e, json);
    }
  });

  // Store the app API for internal use
  internalAppAPIs.set(appurl, appApi);
}

export const createInternalAppAPI = engineOp(
  'createInternalAppAPI',
  (appurl: string, appname: string, apiver: string = '6.2', apivermin: string = '6.2') => createInternalAppAPIEngine(appurl, appname, apiver, apivermin),
);

/**
 * Get internal app API by appurl
 */
export function getInternalAppAPI(appurl: string): any {
  return internalAppAPIs.get(appurl);
}

/**
 * Process raw invoke data returned by invoke_contract.
 * Registers the call in pendingContractCalls so callers can await the result.
 * Note: if the wallet requires send approval the promise resolves only after
 * the user acts on the notification — use a long timeout accordingly.
 */
function processInvokeDataEngine(appurl: string, data: any): Promise<any> {
  const appApi = internalAppAPIs.get(appurl);
  if (!appApi) {
    throw new Error(`App API not found for ${appurl}`);
  }

  const callId = `process-${internalCallId}`;
  internalCallId += 1;

  const request = {
    jsonrpc: '2.0',
    id: callId,
    method: 'process_invoke_data',
    params: { data },
  };

  return new Promise<any>((resolve, reject) => {
    pendingContractCalls.set(callId, { resolve, reject });
    appApi.callWalletApi(JSON.stringify(request));

    // 5 min — user may need to approve in the popup
    setTimeout(() => {
      if (pendingContractCalls.has(callId)) {
        pendingContractCalls.delete(callId);
        reject(new Error('process_invoke_data timeout'));
      }
    }, 300_000);
  });
}

export const processInvokeData = engineOp('processInvokeData', (appurl: string, data: any) => processInvokeDataEngine(appurl, data));

/**
 * Invoke contract using app API (same flow as SDK)
 * This matches the skeleton-dapp flow: create app API -> callWalletApi -> handle response
 */
async function invokeContractEngine(params: InvokeContractParams) {
  const { appurl, appname, ...invokeParams } = params;

  if (!appurl || !appname) {
    throw new Error('appurl and appname are required for contract invocations');
  }

  // Ensure the app API is created (same as SDK's client initialization)
  await createInternalAppAPIEngine(appurl, appname);

  // Get the app API (same as callExternalWalletApi does)
  const appApi = internalAppAPIs.get(appurl);
  if (!appApi) {
    throw new Error(`App API not found for ${appurl}`);
  }

  // Create JSON-RPC request (same format as SDK)
  const callId = `internal-${internalCallId}`;
  internalCallId += 1;

  const request = {
    jsonrpc: '2.0',
    id: callId,
    method: 'invoke_contract',
    params: {
      args: invokeParams.args,
      ...(invokeParams.contract?.length ? { contract: invokeParams.contract } : {}),
      create_tx: invokeParams.create_tx ?? false,
    },
  };

  // Call via app API's callWalletApi (same as SDK flow)
  return new Promise<any>((resolve, reject) => {
    // Store the promise resolvers
    pendingContractCalls.set(callId, { resolve, reject });

    // Call the app API (same as callExternalWalletApi does)
    appApi.callWalletApi(JSON.stringify(request));

    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingContractCalls.has(callId)) {
        pendingContractCalls.delete(callId);
        reject(new Error('Contract invocation timeout'));
      }
    }, 30000);
  });
}

export const invokeContract = engineOp('invokeContract', (params: InvokeContractParams) => invokeContractEngine(params));

// Table of operations the offscreen engine executes on behalf of UI clients.
// In the engine context calling these wrappers runs the real implementation.
const ENGINE_OPS: Record<string, (...args: any[]) => any> = {
  convertTokenToJson,
  startWallet,
  deleteWallet,
  stopWallet,
  walletLocked,
  createWallet,
  isAllowedWord,
  isAllowedSeed,
  generateSeed,
  loadBackgroundLogs,
  loadConnectedSites,
  disconnectAllowedSite,
  finishNotificationAuth,
  validateAddress,
  createInternalAppAPI,
  processInvokeData,
  invokeContract,
};
