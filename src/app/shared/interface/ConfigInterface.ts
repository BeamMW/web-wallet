export interface Configuration {
  explorer_url: string;
  restore_url: string;
  path_node: string;
  env: string;
}

export interface ConfigurationObject {
  development: Configuration;
  production: Configuration;
  master_net: Configuration;
  test_net: Configuration;
  main_net: Configuration;
}
