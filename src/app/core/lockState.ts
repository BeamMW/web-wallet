/**
 * Wallet lock flag, shared across extension contexts.
 *
 * This used to live in `localStorage('locked')`, which only worked because the UI
 * pages and the offscreen engine happen to be same-origin extension documents. It
 * was invisible to the service worker and depended on synchronous cross-document
 * localStorage visibility. `chrome.storage.session` is the MV3-correct channel and
 * is what `RememberPassword.ts` already uses for the remembered password, so the
 * lock flag and the auto-unlock secret can no longer desync.
 *
 * Session storage is cleared when the browser restarts. That is safe here: after a
 * restart the WASM wallet is not running, and every gate that consults this flag
 * also requires a running wallet.
 */

const LOCK_KEY = 'beam_wallet_locked_v1';
const LEGACY_LOCK_KEY = 'locked';

type ChromeSessionStorage = {
  get: (keys: string[] | string, cb: (items: Record<string, any>) => void) => void;
  set: (items: Record<string, any>, cb?: () => void) => void;
  remove: (keys: string[] | string, cb?: () => void) => void;
};

// Synchronous mirror of the authoritative value, kept fresh by the onChanged
// listener below. Only for call sites that genuinely cannot await.
let cachedLocked = false;
let hydrated: Promise<boolean> | null = null;
let listenerAttached = false;

function getSessionStorage(): ChromeSessionStorage | null {
  const chromeAny = (globalThis as any).chrome;
  return chromeAny?.storage?.session ?? null;
}

function attachChangeListener() {
  if (listenerAttached) return;
  const chromeAny = (globalThis as any).chrome;
  const onChanged = chromeAny?.storage?.onChanged;
  if (!onChanged?.addListener) return;

  onChanged.addListener((changes: Record<string, any>, areaName: string) => {
    if (areaName !== 'session') return;
    if (!Object.prototype.hasOwnProperty.call(changes, LOCK_KEY)) return;
    cachedLocked = !!changes[LOCK_KEY]?.newValue;
  });
  listenerAttached = true;
}

/**
 * Read the flag straight from session storage. Prefer this at every security gate —
 * it cannot be stale, unlike the synchronous mirror.
 */
export function getWalletLocked(): Promise<boolean> {
  const session = getSessionStorage();
  if (!session) return Promise.resolve(cachedLocked);

  return new Promise((resolve) => {
    session.get([LOCK_KEY], (items) => {
      cachedLocked = !!items?.[LOCK_KEY];
      resolve(cachedLocked);
    });
  });
}

export function setWalletLocked(locked: boolean): Promise<void> {
  cachedLocked = locked;
  const session = getSessionStorage();
  if (!session) return Promise.resolve();

  return new Promise((resolve) => {
    if (locked) {
      session.set({ [LOCK_KEY]: true }, () => resolve());
    } else {
      session.remove([LOCK_KEY], () => resolve());
    }
  });
}

/**
 * Best-effort synchronous read of the mirror. Correct once `initLockState()` has
 * resolved in this context; use `getWalletLocked()` wherever awaiting is possible.
 */
export function isWalletLockedSync(): boolean {
  return cachedLocked;
}

/** Hydrate the mirror and subscribe to changes. Call once per context, before use. */
export function initLockState(): Promise<boolean> {
  if (hydrated) return hydrated;

  attachChangeListener();

  // Drop the pre-session-storage key so a stale value can't outlive a browser restart.
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LEGACY_LOCK_KEY);
    }
  } catch {
    /* localStorage unavailable (service worker) — nothing to migrate */
  }

  hydrated = getWalletLocked();
  return hydrated;
}
