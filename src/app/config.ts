import { Configuration, ConfigurationObject } from '@app/shared/interface';

const { NODE_ENV = 'production' } = process.env;

const development: Configuration = {
  env: NODE_ENV,
  explorer_url_confidential_id: 'https://dappnet-net.explorer.beam.mw/assets/details/',
  path_node: 'eu-node02.dappnet.beam.mw:8200',
  explorer_url: 'https://dappnet.explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/dappnet/dappnet_recovery.bin',
  theme: 'dappnet',
  dex_url: 'https://dappnet-dex.beam.mw',
  network: 'dappnet',
};

const master_net: Configuration = {
  ...development,
  path_node: 'eu-node01.masternet.beam.mw:8200',
  theme: 'masternet',
  explorer_url_confidential_id: 'https://master-net.explorer.beam.mw/assets/details/',
  network: 'masternet',
};

const test_net: Configuration = {
  ...development,
  explorer_url: 'https://testnet.explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/testnet/testnet_recovery.bin',
  path_node: 'eu-node01.testnet.beam.mw:8200',
  theme: 'testnet',
  explorer_url_confidential_id: 'https://testnet.explorer.beam.mw/assets/details/',
  network: 'testnet',
};

const main_net: Configuration = {
  ...development,
  explorer_url: 'https://explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/mainnet/mainnet_recovery.bin',
  path_node: 'web-wallet.beam.mw:8200',
  theme: 'mainnet',
  explorer_url_confidential_id: 'https://explorer.beam.mw/assets/details/',
  dex_url: 'https://dex.beam.mw',
  network: 'mainnet',
};

const dapp_net: Configuration = {
  ...development,
  path_node: 'eu-node02.dappnet.beam.mw:8200',
  explorer_url: 'https://dappnet.explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/dappnet/dappnet_recovery.bin',
  theme: 'dappnet',
  network: 'dappnet',
};

const production: Configuration = {
  ...main_net,
};

const config: ConfigurationObject = {
  development,
  production,
  master_net,
  test_net,
  main_net,
  dapp_net,
};

const configElement: Configuration = (config as any)[NODE_ENV];

export default configElement;
