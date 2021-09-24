import { EnvironmentType } from '@core/types';
import * as extensionizer from 'extensionizer';
import { PortStream } from '@core/PortStream';
import { setupDnode, transformMethods, cbToPromise } from '@app/core/setupDnode';
import { initApp } from './index';

const getEnvironmentType = (url = window.location.href) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.pathname === '/popup.html') {
    return EnvironmentType.POPUP;
  } if (parsedUrl.pathname === '/page.html') {
    return EnvironmentType.FULLSCREEN;
  } if (parsedUrl.pathname === '/notification.html') {
    return EnvironmentType.NOTIFICATION;
  }
  return EnvironmentType.BACKGROUND;
};

async function setupUi() {
  const windowType = getEnvironmentType();
  const backgroundPort = extensionizer.runtime.connect({ name: windowType });
  const connectionStream = new PortStream(backgroundPort);

  const api = {
    updateState: async (state) => {
      console.log('update state:', state);
    },
  };

  const dnode = setupDnode(connectionStream, api);
  const background = await new Promise((resolve) => {
    dnode.once('remote', (remoteApi) => {
      resolve(transformMethods(cbToPromise, remoteApi));
    });
  });

  await initApp(background, windowType);
}

setupUi().catch(console.error);
