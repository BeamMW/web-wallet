export interface Configuration {
  explorer_url: string;
  restore_url: string;
  path_node: string;
  env: string;
  theme: string;
  explorer_url_confidential_id: string;
}

export interface ConfigurationObject {
  development: Configuration;
  production: Configuration;
  master_net: Configuration;
  test_net: Configuration;
  main_net: Configuration;
  dapp_net: Configuration;
}
