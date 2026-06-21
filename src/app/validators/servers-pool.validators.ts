import {
  hasUniqueValues,
  isNonEmptyString,
  isRecord,
  isValidIpv4,
  isValidPort,
} from './app-validators';
import { Server, ServersPool } from '../models/servers-pool.model';

export function isServersPool(value: unknown): value is ServersPool {
  return (
    Array.isArray(value) &&
    value.every(isServer) &&
    hasUniqueValues(value.map((server) => server.hostname))
  );
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
