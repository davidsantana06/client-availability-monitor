import { MonitorConfig } from '../models/monitor-config.model';
import { Server, ServersPool } from '../models/servers-pool.model';
import { User, UsersInfo } from '../models/users-info.model';
import { EMAIL_PATTERN, IPV4_PATTERN, PORT_MAX_VALUE, PORT_MIN_VALUE } from './app-validators';

export function parseMonitorConfig(text: string): MonitorConfig {
  const value = parseJson(text);
  if (!isMonitorConfig(value)) throw new Error('The file is not a valid monitor configuration.');
  return value;
}

export function parseServersPool(text: string): ServersPool {
  const value = parseJson(text);
  if (!isServersPool(value)) throw new Error('The file is not a valid servers pool.');
  return value;
}

export function parseUsersInfo(text: string): UsersInfo {
  const value = parseJson(text);
  if (!isUsersInfo(value)) throw new Error('The file is not a valid users list.');
  return value;
}

function isMonitorConfig(value: unknown): value is MonitorConfig {
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

function isServersPool(value: unknown): value is ServersPool {
  return Array.isArray(value) && value.every(isServer);
}

function isServer(value: unknown): value is Server {
  return (
    isRecord(value) &&
    isNonEmptyString(value['hostname']) &&
    isValidPort(value['port']) &&
    hasExactlyOneAddress(value)
  );
}

function hasExactlyOneAddress(value: Record<string, unknown>): boolean {
  const ipFilled = isNonEmptyString(value['ip']);
  const dnsFilled = isNonEmptyString(value['dns']);
  if (ipFilled === dnsFilled) return false;
  return ipFilled ? isValidIpv4(value['ip']) : true;
}

function isUsersInfo(value: unknown): value is UsersInfo {
  return Array.isArray(value) && value.every(isUser);
}

function isUser(value: unknown): value is User {
  return isRecord(value) && isNonEmptyString(value['username']) && isValidEmail(value['email']);
}

function isValidPort(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= PORT_MIN_VALUE &&
    value <= PORT_MAX_VALUE
  );
}

function isValidEmail(value: unknown): boolean {
  return isNonEmptyString(value) && EMAIL_PATTERN.test(value);
}

function isValidIpv4(value: unknown): boolean {
  return isNonEmptyString(value) && IPV4_PATTERN.test(value);
}

function isPositiveInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
}
