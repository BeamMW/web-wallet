BeamModule().then(module => {
  const WasmWalletClient = module.WasmWalletClient;
  WasmWalletClient.MountFS(() => {
    const wallet = new WasmWalletClient(
      '/beam_wallet/wallet.db',
      '1',
      'eu-node01.masternet.beam.mw:8200',
    );

    wallet.startWallet();
  });
});
