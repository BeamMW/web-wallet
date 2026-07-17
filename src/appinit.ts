/// <reference types="chrome"/>

const OFFSCREEN_URL = 'offscreen.html';

let creating: Promise<void> | null = null;

async function hasOffscreenDocument(): Promise<boolean> {
  // hasDocument() is the simplest check; guard in case a channel lacks it.
  if (chrome.offscreen && typeof (chrome.offscreen as any).hasDocument === 'function') {
    return (chrome.offscreen as any).hasDocument();
  }
  return false;
}

async function ensureOffscreen(): Promise<void> {
  if (await hasOffscreenDocument()) return;
  if (!creating) {
    creating = chrome.offscreen
      .createDocument({
        url: OFFSCREEN_URL,
        reasons: [chrome.offscreen.Reason.WORKERS, chrome.offscreen.Reason.BLOBS],
        justification: 'Runs the Beam WASM wallet engine and its web worker.',
      })
      .catch((err) => {
        // A concurrent createDocument may already have made it — ignore that race.
        // eslint-disable-next-line no-console
        console.warn('createDocument failed (may already exist):', err);
      })
      .finally(() => {
        creating = null;
      });
  }
  await creating;
}

// Create the engine as soon as the extension starts so it can sync in the
// background and be ready to serve dApps / the popup.
chrome.runtime.onInstalled.addListener(() => {
  ensureOffscreen();
});
chrome.runtime.onStartup.addListener(() => {
  ensureOffscreen();
});
// Also on service-worker (re)spawn.
ensureOffscreen();

// ---------------------------------------------------------------------------
// Window / tab operations delegated by the offscreen engine (NotificationManager).
// ---------------------------------------------------------------------------

function handleWinOp(msg: any, sendResponse: (r: any) => void): boolean {
  const { op, payload } = msg;
  switch (op) {
    case 'openWindow':
      chrome.windows.create(payload, (win) => sendResponse({ result: win }));
      return true;
    case 'focusWindow':
      chrome.windows.update(payload.windowId, { focused: true }, (win) => sendResponse({ result: win }));
      return true;
    case 'updateWindowPosition':
      chrome.windows.update(payload.windowId, { left: payload.left, top: payload.top }, (win) => sendResponse({ result: win }));
      return true;
    case 'getAllWindows':
      chrome.windows.getAll({ populate: false }, (windows) => sendResponse({ result: windows }));
      return true;
    case 'getLastFocused':
      chrome.windows.getLastFocused({}, (win) => sendResponse({ result: win }));
      return true;
    case 'getActiveTabs':
      chrome.tabs.query({ active: true }, (tabs) => sendResponse({ result: tabs }));
      return true;
    case 'closeTab':
      chrome.tabs.remove(payload.tabId, () => sendResponse({ result: true }));
      return true;
    default:
      sendResponse({ error: `Unknown win-op "${op}"` });
      return false;
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg !== 'object') return undefined;

  if (msg.target === 'sw' && msg.type === 'ensure-offscreen') {
    ensureOffscreen().then(() => sendResponse({ ok: true }));
    return true; // async response
  }

  if (msg.target === 'sw-winop') {
    return handleWinOp(msg, sendResponse);
  }

  // chrome.storage proxy for the offscreen engine (offscreen has no chrome.storage).
  if (msg.target === 'sw-storage') {
    const { op, payload } = msg;
    if (op === 'get') {
      chrome.storage.local.get(payload, (items) => sendResponse({ result: items }));
      return true;
    }
    if (op === 'set') {
      chrome.storage.local.set(payload, () => sendResponse({ result: true }));
      return true;
    }
    if (op === 'remove') {
      chrome.storage.local.remove(payload, () => sendResponse({ result: true }));
      return true;
    }
    sendResponse({ error: `Unknown storage op "${op}"` });
    return false;
  }

  return undefined;
});

// ---------------------------------------------------------------------------
// Content-script <-> offscreen relay.
// ---------------------------------------------------------------------------

function senderOrigin(sender?: chrome.runtime.MessageSender): string | null {
  if (!sender) return null;
  if (sender.origin) return sender.origin;
  if (sender.url) {
    try {
      return new URL(sender.url).origin;
    } catch {
      return null;
    }
  }
  return null;
}

chrome.runtime.onConnect.addListener((contentPort) => {
  const { name } = contentPort;
  if (name !== 'content' && name !== 'content_req') return;

  const origin = senderOrigin(contentPort.sender);
  const meta = encodeURIComponent(
    JSON.stringify({ origin, tabId: contentPort.sender?.tab?.id, url: contentPort.sender?.url }),
  );

  let relay: chrome.runtime.Port | null = null;
  let contentAlive = true;
  const buffer: any[] = [];

  // Buffer content-script messages synchronously until the relay is ready.
  contentPort.onMessage.addListener((msg) => {
    if (relay) {
      try {
        relay.postMessage(msg);
      } catch {
        /* relay dead */
      }
    } else {
      buffer.push(msg);
    }
  });
  contentPort.onDisconnect.addListener(() => {
    contentAlive = false;
    if (relay) {
      try {
        relay.disconnect();
      } catch {
        /* already closed */
      }
    }
  });

  ensureOffscreen().then(() => {
    if (!contentAlive) return;
    relay = chrome.runtime.connect({ name: `relay:${name}:${meta}` });
    relay.onMessage.addListener((msg) => {
      try {
        contentPort.postMessage(msg);
      } catch {
        /* content port dead */
      }
    });
    relay.onDisconnect.addListener(() => {
      relay = null;
      try {
        contentPort.disconnect();
      } catch {
        /* already closed */
      }
    });
    while (buffer.length) {
      relay.postMessage(buffer.shift());
    }
  });
});
