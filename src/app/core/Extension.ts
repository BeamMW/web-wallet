import extension from 'extensionizer';
import { EnvironmentType } from '@core/types';

export default class ExtensionPlatform {
  reload() {
    extension.runtime.reload();
  }

    checkForError() {
      const { lastError } = extension.runtime;
      if (!lastError) {
        return undefined;
      }
      if (lastError.stack && lastError.message) {
        return lastError;
      }
      return new Error(lastError.message);
    }

    getEnvironmentType = (url = window.location.href) => {
      const parsedUrl = new URL(url);
      if (parsedUrl.pathname === '/popup.html') {
          return EnvironmentType.POPUP;
      } else if (parsedUrl.pathname === '/page.html') {
          return EnvironmentType.FULLSCREEN;
      } else if (parsedUrl.pathname === '/notification.html') {
          return EnvironmentType.NOTIFICATION;
      }
      return EnvironmentType.BACKGROUND;
    };

  openTab(options) {
    return new Promise((resolve, reject) => {
      extension.tabs.create(options, (newTab) => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newTab);
      });
    });
  }

  openWindow(options) {
    return new Promise((resolve, reject) => {
      extension.windows.create(options, (newWindow) => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  focusWindow(windowId) {
    return new Promise((resolve, reject) => {
      extension.windows.update(windowId, { focused: true }, () => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(true);
      });
    });
  }

  updateWindowPosition(windowId, left, top) {
    return new Promise((resolve, reject) => {
      extension.windows.update(windowId, { left, top }, () => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(true);
      });
    });
  }

  getLastFocusedWindow() {
    return new Promise((resolve, reject) => {
      extension.windows.getLastFocused((windowObject) => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windowObject);
      });
    });
  }

  closeCurrentWindow() {
    return extension.windows.getCurrent((windowDetails) => {
      return extension.windows.remove(windowDetails.id);
    });
  }

  getVersion() {
    return extension.runtime.getManifest().version;
  }

  openExtensionInBrowser(route = null, queryString = null) {
    let extensionURL = extension.runtime.getURL('home.html');

    if (queryString) {
      extensionURL += `?${queryString}`;
    }

    if (route) {
      extensionURL += `#${route}`;
    }
    this.openTab({ url: extensionURL });
    if (this.getEnvironmentType() !== EnvironmentType.BACKGROUND) {
      window.close();
    }
  }

  getPlatformInfo(cb) {
    try {
      extension.runtime.getPlatformInfo((platform) => {
        cb(null, platform);
      });
    } catch (e) {
      cb(e);
      // eslint-disable-next-line no-useless-return
      return;
    }
  }

  getAllWindows() {
    return new Promise((resolve, reject) => {
      extension.windows.getAll((windows) => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windows);
      });
    });
  }

  getActiveTabs() {
    return new Promise((resolve, reject) => {
      extension.tabs.query({ active: true }, (tabs) => {
        const error = this.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(tabs);
      });
    });
  }

  currentTab() {
    return new Promise((resolve, reject) => {
      extension.tabs.getCurrent((tab) => {
        const err = this.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  switchToTab(tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.update(tabId, { highlighted: true }, (tab) => {
        const err = this.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  closeTab(tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.remove(tabId, () => {
        const err = this.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}
