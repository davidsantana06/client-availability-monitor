export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  use_tls: boolean;
  from_address: string;
}

export interface TimingConfig {
  check_interval_in_seconds: number;
  check_timeout_in_seconds: number;
  notification_interval_in_seconds: number;
}

export interface ConcurrencyConfig {
  check_workers: number;
}

export interface PathsConfig {
  servers_config_file: string;
  user_info_file: string;
  logs_folder: string;
}

export interface MonitorConfig {
  smtp: SmtpConfig;
  timing: TimingConfig;
  concurrency: ConcurrencyConfig;
  paths: PathsConfig;
}
