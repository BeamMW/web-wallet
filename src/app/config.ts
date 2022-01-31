import { Configuration, ConfigurationObject } from '@app/shared/interface';

const { NODE_ENV = 'development' } = process.env;

const development: Configuration = {
  env: NODE_ENV,
  explorer_url: 'https://master-net.explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/masternet/masternet_recovery.bin',
  path_node: 'eu-node01.masternet.beam.mw:8200',
};

const master_net: Configuration = {
  ...development,
  path_node: 'eu-node01.masternet.beam.mw:8200',
};

const test_net: Configuration = {
  ...development,
  explorer_url: 'https://testnet.explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/testnet/testnet_recovery.bin',
  path_node: '',
};

const main_net: Configuration = {
  ...development,
  explorer_url: 'https://explorer.beam.mw/block?kernel_id=',
  restore_url: 'https://mobile-restore.beam.mw/mainnet/mainnet_recovery.bin',
  path_node: 'web-wallet.beam.mw:8200',
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
};

const configElement: Configuration = (config as any)[NODE_ENV];

export default configElement;
