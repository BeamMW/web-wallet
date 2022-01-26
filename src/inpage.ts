import PostMessageStream from 'post-message-stream';
import { cbToPromise, setupDnode, transformMethods } from '@core/setupDnode';
import { Environment } from '@core/types';

async function setupInpageApi() {
  const connectionStream = new PostMessageStream({
    name: 'page',
    target: Environment.CONTENT,
  });

  const inpageApi = {};
  const dnode = setupDnode(connectionStream, inpageApi);
  await new Promise((resolve) => {
    dnode.once('remote', (remoteApi) => {
      resolve(transformMethods(cbToPromise, remoteApi));
    });
  }).then((api) => {
    global.BeamApi = api;
    window.postMessage('apiInjected', window.origin);
    // eslint-disable-next-line no-console
    console.log('BEAM WALLET API INJECTED');
    return api;
  });
}
// eslint-disable-next-line no-console
setupInpageApi().catch(console.error);
