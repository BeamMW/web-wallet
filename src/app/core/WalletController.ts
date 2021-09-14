import { sendWalletEvent } from '@core/api';

let backgroundProvider;

export default class WalletController {
    private static instance: WalletController;

    static getInstance() {
        if (this.instance != null) {
            return this.instance;
        }
        this.instance = new WalletController();
            return this.instance;
    }

    static start(pass: string) {
        backgroundProvider.postMessage({type: "start", pass});
    }

    static create(seed, pass, isSeedConfirmed) {
        backgroundProvider.postMessage({type: "create", seed, pass, isSeedConfirmed})
    }

    private portMap = new Map();
    private portMessageId = 0;

    initBgProvider = async (provider, cb, tab) => {
        backgroundProvider = provider;

        backgroundProvider.onMessage.addListener(msg => {
            console.info(msg);
            if (msg.isrunning !== undefined && msg.onboarding !== undefined) {
                cb(msg, tab);
            } else if (msg.event !== undefined) {
                sendWalletEvent(msg.event);
            } else if (msg.id !== undefined && msg.result !== undefined) {
                const {id, result} = msg;
                const resolve = this.portMap.get(id);
                this.portMap.delete(id);
                resolve(result);
            }
        });
    }

    sendRequest = (data) => {
        return new Promise(resolve => {
            const id = ++this.portMessageId;
            this.portMap.set(id, resolve);
            backgroundProvider.postMessage({id, data});
        });
    }

    getSeedPhrase = async () => {
        const seed = await this.sendRequest('get_seed');
        return seed;
    }
}