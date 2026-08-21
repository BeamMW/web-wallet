import * as extensionizer from 'extensionizer';
import { Environment, ConnectRequest } from '@core/types';

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

let rpcBackgroundPort: chrome.runtime.Port | null = null;
let inpagePort: MessagePort | null = null;
let isConnectedToWallet = false;
let connectInFlight: Promise<boolean> | null = null;

// Lazy port for the legacy window-message path only; new ensureConnected uses ephemeral ports.
// Not created at module scope — doing so would trigger ensureWalletTabOpen on every page load.
let legacyPort: chrome.runtime.Port | null = null;

function getExtensionPort(): chrome.runtime.Port {
  if (!legacyPort) {
    legacyPort = extensionizer.runtime.connect({ name: Environment.CONTENT_REQ });
    legacyPort.onMessage.addListener((msg) => {
      if (msg.result) {
        isConnectedToWallet = true;
        window.postMessage('apiInjected', window.origin);
      } else if (!msg.result) {
        window.postMessage('rejected', window.origin);
      }
    });
    legacyPort.onDisconnect.addListener(() => {
      legacyPort = null;
    });
  }
  return legacyPort;
}

// Attempt one auth connection on a fresh ephemeral port.
// Returns true/false on response, or null on timeout (so caller can retry).
function tryConnect(reqData: ConnectRequest, timeoutMs: number): Promise<boolean | null> {
  const authPort = extensionizer.runtime.connect({ name: Environment.CONTENT_REQ });
  return new Promise<boolean | null>((resolve) => {
    let onMsg: (msg: any) => void;
    const timeoutId = setTimeout(() => {
      authPort.onMessage.removeListener(onMsg);
      try {
        authPort.disconnect();
      } catch {
        /* already dead */
      }
      resolve(null);
    }, timeoutMs);

    onMsg = (msg: any) => {
      if (msg && typeof msg.result === 'boolean') {
        clearTimeout(timeoutId);
        authPort.onMessage.removeListener(onMsg);
        try {
          authPort.disconnect();
        } catch {
          /* already dead */
        }
        resolve(!!msg.result);
      }
    };

    authPort.onMessage.addListener(onMsg);
    authPort.postMessage(reqData);
  });
}

function ensureConnected(appname?: string): Promise<boolean> {
  if (isConnectedToWallet) return Promise.resolve(true);
  if (connectInFlight) return connectInFlight;

  const reqData: ConnectRequest = {
    type: 'create_beam_api',
    apiver: 'current',
    apivermin: '',
    appname: appname || document.title || 'Unknown dApp',
    is_reconnect: false,
  };

  // Two attempts: first 8 s (cold start — wallet tab opens during this window),
  // retry 15 s (wallet tab is now open, new port fires onConnect in page.html).
  connectInFlight = (async () => {
    for (let attempt = 0; attempt <= 1; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await tryConnect(reqData, attempt === 0 ? 8000 : 15000);
      if (ok !== null) {
        connectInFlight = null;
        isConnectedToWallet = ok;
        if (ok) window.postMessage('apiInjected', window.origin);
        return ok;
      }
      // null = timed out; loop continues to retry
    }
    connectInFlight = null;
    return false;
  })();

  return connectInFlight;
}

function ensureRpcBackgroundPort() {
  if (rpcBackgroundPort) return rpcBackgroundPort;
  rpcBackgroundPort = extensionizer.runtime.connect({ name: Environment.CONTENT });

  rpcBackgroundPort.onMessage.addListener((msg: BeamRpcPushMessage | BeamRpcErrorMessage) => {
    if (inpagePort) {
      inpagePort.postMessage(msg);
    }
  });

  rpcBackgroundPort.onDisconnect.addListener(() => {
    rpcBackgroundPort = null;
  });

  return rpcBackgroundPort;
}

function setupInpageChannel() {
  if (inpagePort) return inpagePort;

  const channel = new MessageChannel();
  inpagePort = channel.port1;
  inpagePort.onmessage = (event: MessageEvent<BeamRpcRequestMessage>) => {
    const msg = event.data;
    if (!msg || msg.type !== 'BEAM_WALLET_RPC_REQUEST' || msg.version !== 1) return;
    const { appname } = msg.payload || {};
    ensureConnected(appname)
      .then((ok) => {
        if (!ok) {
          inpagePort?.postMessage({
            type: 'BEAM_WALLET_RPC_ERROR',
            version: 1,
            payload: {
              id: msg.payload?.id,
              error: { code: -3, message: 'Connection rejected' },
            },
          } as BeamRpcErrorMessage);
          return;
        }
        ensureRpcBackgroundPort().postMessage(msg);
      })
      .catch((e: any) => {
        inpagePort?.postMessage({
          type: 'BEAM_WALLET_RPC_ERROR',
          version: 1,
          payload: {
            id: msg.payload?.id,
            error: { code: -32001, message: e?.message || 'Failed to connect', data: e },
          },
        } as BeamRpcErrorMessage);
      });
  };

  window.postMessage({ type: 'BEAM_WALLET_INIT', version: 1 }, window.origin, [channel.port2]);

  return inpagePort;
}

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('src', chrome.runtime.getURL('inpage.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Beam web wallet injection failed.', error);
  }
}

function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i += 1) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

if (shouldInjectProvider()) {
  injectScript();
}

window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  // Any script on the page can postMessage to window — strings, null, arrays.
  // Only object payloads carry a wallet message; everything else is not ours.
  if (!event.data || typeof event.data !== 'object') {
    return;
  }

  if (event.data.type === 'BEAM_WALLET_INPAGE_READY' && event.data.version === 1) {
    setupInpageChannel();
    // Do NOT eagerly create the RPC port here — it would trigger ensureWalletTabOpen
    // on every page load even when the user never interacts with the wallet.
    // The port is created lazily in inpagePort.onmessage when a real RPC call arrives.
    return;
  }

  if (event.data.type !== 'create_beam_api') {
    return;
  }

  const reqData: ConnectRequest = {
    type: event.data.type,
    apiver: event.data.apiver,
    apivermin: event.data.apivermin,
    appname: event.data.appname,
    is_reconnect: event.data.is_reconnect,
  };

  // getExtensionPort() creates the port lazily (and registers the response listener once).
  getExtensionPort().postMessage(reqData);
});
