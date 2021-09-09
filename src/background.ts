/// <reference types="chrome"/>

function openExtensionInBrowser() {
  const extensionURL = chrome.runtime.getURL('index.html');

  chrome.tabs.create({ url: extensionURL });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // openExtensionInBrowser();
  }
});

function getOwnTabs(): Promise<chrome.tabs.Tab[]> {
  return Promise.all<chrome.tabs.Tab>(
    chrome.extension
      .getViews({ type: 'tab' })
      .map(
        (view) => new Promise(
          (resolve) => view.chrome.tabs.getCurrent(
            (tab) => resolve(Object.assign(tab, { url: view.location.href })),
          ),
        ),
      ),
  );
}

function openOptions(url) {
  getOwnTabs().then((ownTabs) => {
    const target = ownTabs.find((tab) => tab.url.includes(url));
    if (target) {
      if (target.active && target.status === 'complete') {
        chrome.runtime.sendMessage({ text: 'stop-loading' });
      } else {
        chrome.tabs.update(target.id, { active: true });
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text === 'wallet-opened') {
    openOptions('index.html');
  }
});
