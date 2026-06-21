import {
  isNonEmptyString,
  isPositiveInteger,
  isRecord,
  isValidEmail,
  isValidPort,
} from './app-validators';
import { MonitorConfig } from '../models/monitor-config.model';

export function isMonitorConfig(value: unknown): value is MonitorConfig {
  return (
    isRecord(value) &&
    isSmtpConfig(value['smtp']) &&
    isTimingConfig(value['timing']) &&
    isConcurrencyConfig(value['concurrency']) &&
    isPathsConfig(value['paths'])
  );
}

function isSmtpConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value['host']) &&
    isValidPort(value['port']) &&
    isNonEmptyString(value['username']) &&
    isNonEmptyString(value['password']) &&
    typeof value['use_tls'] === 'boolean' &&
    isValidEmail(value['from_address'])
  );
}

function isTimingConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    isPositiveInteger(value['check_interval_in_seconds']) &&
    isPositiveInteger(value['check_timeout_in_seconds']) &&
    isPositiveInteger(value['notification_interval_in_seconds'])
  );
}

function isConcurrencyConfig(value: unknown): boolean {
  return isRecord(value) && isPositiveInteger(value['check_workers']);
}

function isPathsConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value['servers_config_file']) &&
    isNonEmptyString(value['user_info_file']) &&
    isNonEmptyString(value['logs_folder'])
  );
}
