/// <reference types="chrome"/>

// On first install, open a new tab with MetaMask
function openExtensionInBrowser() {
  const extensionURL = chrome.runtime.getURL('index.html');

  chrome.tabs.create({ url: extensionURL });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    openExtensionInBrowser();
  }
});

function getOwnTabs(): Promise<chrome.tabs.Tab[]> {
  return Promise.all<chrome.tabs.Tab>(
    chrome.extension
      .getViews({ type: 'tab' })
      .map(
        view =>
          new Promise(resolve =>
            view.chrome.tabs.getCurrent(tab =>
              resolve(Object.assign(tab, { url: view.location.href })),
            ),
          ),
      ),
  );
}

async function openOptions(url) {
  const ownTabs = await getOwnTabs();
  const tab = ownTabs.find(tab => tab.url.includes(url));
  if (tab) {
    if (tab.active && tab.status === 'complete') {
      chrome.runtime.sendMessage({ text: 'stop-loading' });
    } else {
      chrome.tabs.update(tab.id, { active: true });
    }
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.text === 'wallet-opened') {
    openOptions('index.html');
  }
});
