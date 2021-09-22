import WasmWallet from './WasmWallet';
import { setupDnode } from "@core/setupDnode";
import { Notification } from '@core/types';

const wallet = WasmWallet.getInstance();

export class DnodeApp {
    private appApi = null;
    private notificationInfo = null;
    private approveContractInfoHandler = null;
    private notificationCb = null;
    
    constructor(approveContractInfoHandler) {
        this.approveContractInfoHandler = approveContractInfoHandler;
    }

    setNotificationInfo(data: Notification, callback?) {
        this.notificationInfo = data;
        this.notificationCb = callback;
    }

    private reconnectHandler = (handler) => {
        wallet.updateHandler(handler);
    };

    pageApi(){
        return {
            createAppAPI: async (id: string, name: string, cb) => {
                return new Promise((resolve, reject) => {
                    wallet.createAppAPI(id, name, cb, (api) => {
                        this.appApi = api;
                        resolve(true);
                    });
                })
            },
            callWalletApi: async (callid: string, method: string, params) => {
                let request = {
                    "jsonrpc": "2.0",
                    "id":      callid,
                    "method":  method,
                    "params":  params
                }
                this.appApi.callWalletApi(JSON.stringify(request));
            }
        }
    }

    popupApi(){
        return {
            init: async (cb, eventHandler) => {
                if (!wallet.isRunning()) {
                    try {
                        const result = await wallet.init(eventHandler);
                        cb({ onboarding: !result, isrunning: false });
                    } catch (e) {
                        cb({ onboarding: true, isrunning: false });
                    }
                } else {
                    this.reconnectHandler(eventHandler);
                    wallet.subunsubTo(false);
                    wallet.subunsubTo(true);
                    cb({ onboarding: false, isrunning: true });
                }
            },
            start: async (pass) => {
                wallet.start(pass);
                wallet.setApproveContractInfoHandler(this.approveContractInfoHandler);
            },
            send: async (data) => {
                const {method, params} = data;
                const result = wallet.send(method, params);
                return result;
            },
            create: async (params) => {
                const {seed, pass, isSeedConfirmed} = params;
                wallet.create(seed, pass, isSeedConfirmed);
            },
            getSeedPhrase: async () => WasmWallet.getSeedPhrase(),
            loadNotificationInfo: async () => {
                return this.notificationInfo;
            },
            setNotificationApproved: async (req) => {
                this.notificationCb.sendApproved(req);
            },
            setNotificationRejected: async (req) => {
                this.notificationCb.sendRejected(req);
            },
            approveConnection: async () => {
                return new Promise((resolve, reject) => {
                    this.notificationCb(true);
                    resolve(true);
                })
            }
        }
    }

    connectPopup(connectionStream){
        const api = this.popupApi();
        const dnode = setupDnode(connectionStream, api);

        dnode.on('remote', (remote) => {
            console.log(remote)
        })
    }

    connectPage(connectionStream, origin){
        const api = this.pageApi();
        const dnode = setupDnode(connectionStream, api);

        dnode.on('remote', (remote) => {
            console.log(origin);
            console.log(remote)
        })
    }
}