export interface Configuration {
  explorer_url: string;
  restore_url: string;
  env: string;
}

export interface ConfigurationObject {
  development: Configuration;
  production: Configuration;
  master_net: Configuration;
  test_net: Configuration;
  main_net: Configuration;
}
