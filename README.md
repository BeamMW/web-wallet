# Running Beam Web wallet

## Run wallet extension

`npm install`
`npm run build`

Enable developer mode in Chrome `chrome://extensions/`
Import unpacked extension from `./dist`


# Web wallet integration with DAPP

- Add [utils.js](https://github.com/BeamMW/dapp-utils) to DAPP

- Initialize Utils

```
Utils.initialize({
  "appname": "DAPP NAME",
  "min_api_version": "6.2",
  "headless": false,
  "apiResultHandler": (error, result, full) => {
    console.log('api result data: ', result, full);
  }
}, (err) => {
    Utils.download("./PATH_TO_SHADER.wasm", (err, bytes) => {
        // subscribe to the state change event
        Utils.callApi("ev_subunsub", {ev_system_state: true}, 
          (error, result, full) => {
          
          }
        );
    })
});
```

- Call allowed methods from [BEAM Wallet API](https://github.com/BeamMW/beam/wiki/Beam-wallet-protocol-API-v6.3)

```
Utils.callApi("METHOD_NAME", PARAMS, (error, result, full) => {});
```

- Invoke contract methods

```
Utils.invokeContract("role=manager,action=view,cid=" + CID, (error, result, full) => {});
```
