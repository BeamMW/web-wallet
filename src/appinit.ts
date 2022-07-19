import * as extensionizer from 'extensionizer';

chrome.action.onClicked.addListener((tab) => {
  extensionizer.storage.local.get('beamTabId', ({ beamTabId }) => {
    if (!beamTabId) {
      chrome.tabs.create(
        {
          url: 'page.html',
          active: true,
        },
        (tab) => {
          extensionizer.storage.local.set({
            beamTabId: tab.id.toString(),
          });
        },
      );
    } else {
      chrome.tabs.query({ status: 'complete' }, (tabs) => {
        const tab = tabs?.filter((t) => t.id.toString() === beamTabId);
        console.log('TAB', tab);
        if (!tab.length) {
          chrome.tabs.create(
            {
              url: 'page.html',
              active: true,
            },
            (newTab) => {
              extensionizer.storage.local.set({
                beamTabId: newTab.id.toString(),
              });
            },
          );
        }
      });
    }
  });
});
