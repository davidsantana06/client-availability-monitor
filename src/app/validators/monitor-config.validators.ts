import { MonitorConfig } from '@app/models/monitor-config.model';

import {
  isNonEmptyString,
  isPositiveIntegerValue,
  isRecord,
  isEmailValue,
  isPortValue,
} from '@app/validators/app-validators';

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
    isPortValue(value['port']) &&
    isNonEmptyString(value['username']) &&
    isNonEmptyString(value['password']) &&
    typeof value['use_tls'] === 'boolean' &&
    isEmailValue(value['from_address'])
  );
}

function isTimingConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    isPositiveIntegerValue(value['check_interval_in_seconds']) &&
    isPositiveIntegerValue(value['check_timeout_in_seconds']) &&
    isPositiveIntegerValue(value['notification_interval_in_seconds'])
  );
}

function isConcurrencyConfig(value: unknown): boolean {
  return isRecord(value) && isPositiveIntegerValue(value['check_workers']);
}

function isPathsConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value['servers_pool_file']) &&
    isNonEmptyString(value['users_info_file']) &&
    isNonEmptyString(value['logs_folder'])
  );
}
