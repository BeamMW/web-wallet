import PostMessageStream from 'post-message-stream';
import {cbToPromise, setupDnode, transformMethods} from "@core/setupDnode";

setupInpageApi().catch(console.error);

async function setupInpageApi() {
    const connectionStream = new PostMessageStream({
        name: 'page',
        target: 'content',
    });

    const api = {};
    const dnode = setupDnode(connectionStream, api);

    await new Promise(resolve => {
        dnode.once('remote', remoteApi => {
            resolve(transformMethods(cbToPromise, remoteApi))
        })
    }).then((api) => {
        global.BeamApi = api;
        window.postMessage('apiInjected', window.origin);
        console.log('BEAM WALLET API INJECTED');
        return api
    });
}