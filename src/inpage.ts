type BeamRpcInitMessage = {
  type: 'BEAM_WALLET_INIT';
  version: 1;
};

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
  payload: {
    json: string;
  };
};

type BeamRpcErrorMessage = {
  type: 'BEAM_WALLET_RPC_ERROR';
  version: 1;
  payload: {
    id?: string;
    error: { code: number; message: string; data?: any };
  };
};

type BeamWalletApiResultHandler = (json: string) => void;

type PendingEntry = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
  timer: number;
};

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function safeJsonParse<T = any>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function setupInpageApi() {
  let channelPort: MessagePort | null = null;
  let apiResultHandler: BeamWalletApiResultHandler | null = null;
  const pending: Map<string, PendingEntry> = new Map();
  const outboundQueue: BeamRpcRequestMessage[] = [];

  function post(msg: BeamRpcRequestMessage) {
    if (!channelPort) {
      outboundQueue.push(msg);
      return;
    }
    channelPort.postMessage(msg);
  }

  function handleIncoming(message: BeamRpcPushMessage | BeamRpcErrorMessage) {
    if (message.type === 'BEAM_WALLET_RPC_PUSH') {
      const { json } = message.payload;

      const parsed = safeJsonParse<any>(json);
      const id = parsed?.id;
      if (typeof id === 'string' && pending.has(id)) {
        const entry = pending.get(id)!;
        clearTimeout(entry.timer);
        pending.delete(id);
        if (parsed?.error) {
          entry.reject(parsed);
        } else {
          entry.resolve(parsed?.result);
        }
      }

      if (apiResultHandler) {
        apiResultHandler(json);
      }
      return;
    }

    if (message.type === 'BEAM_WALLET_RPC_ERROR') {
      const { id, error } = message.payload;
      if (id && pending.has(id)) {
        const entry = pending.get(id)!;
        clearTimeout(entry.timer);
        pending.delete(id);
        entry.reject(error);
      }
    }
  }

  const BeamApi = {
    callWalletApiResult: async (handler: BeamWalletApiResultHandler) => {
      apiResultHandler = handler;
      return true;
    },

    callWalletApi: async (callid: string, method: string, params?: any, appname?: string) => {
      const msg: BeamRpcRequestMessage = {
        type: 'BEAM_WALLET_RPC_REQUEST',
        version: 1,
        payload: {
          id: callid,
          method,
          params,
          appname,
        },
      };
      post(msg);
      return true;
    },

    request: async ({ method, params, appname }: { method: string; params?: any; appname?: string }) => {
      const id = genId();
      return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
          pending.delete(id);
          reject(new Error(`BeamApi.request timeout for method "${method}"`));
        }, 60_000);

        pending.set(id, { resolve, reject, timer });
        BeamApi.callWalletApi(id, method, params, appname).catch((e: any) => {
          clearTimeout(timer);
          pending.delete(id);
          reject(e);
        });
      });
    },
  };

  // @ts-ignore
  global.BeamApi = BeamApi;

  await new Promise<void>((resolve) => {
    const onWindowMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as BeamRpcInitMessage;
      if (!data || data.type !== 'BEAM_WALLET_INIT' || data.version !== 1) return;

      const port = event.ports && event.ports[0];
      if (!port) return;

      channelPort = port;
      channelPort.onmessage = (e: MessageEvent) => {
        handleIncoming(e.data);
      };

      while (outboundQueue.length) {
        channelPort.postMessage(outboundQueue.shift()!);
      }

      window.removeEventListener('message', onWindowMessage);
      resolve();
    };

    window.addEventListener('message', onWindowMessage);
    window.postMessage({ type: 'BEAM_WALLET_INPAGE_READY', version: 1 }, window.origin);
  });
}

setupInpageApi().catch(() => {});
