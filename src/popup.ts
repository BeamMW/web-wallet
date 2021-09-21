
import { EnvironmentType } from '@core/types';
import * as extensionizer from 'extensionizer';
import { PortStream } from "@core/PortStream";
import { initApp } from './index';
import { setupDnode, transformMethods, cbToPromise} from '@app/core/setupDnode';

const getEnvironmentType = (url = window.location.href) => {
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

setupUi().catch(console.error);

async function setupUi() {
    const windowType = getEnvironmentType();
    const backgroundPort = extensionizer.runtime.connect({name: windowType});
    const connectionStream = new PortStream(backgroundPort);

    const api = {
        updateState: async state => {
          console.log('update state:', state);
        }
    };

    const dnode = setupDnode(connectionStream, api);
    const background = await new Promise(resolve => {
        dnode.once('remote', remoteApi => {
            resolve(transformMethods(cbToPromise, remoteApi))
        })
    });

    await initApp(background, windowType)
}
