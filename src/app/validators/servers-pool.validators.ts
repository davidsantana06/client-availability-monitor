import { Server, ServersPool } from '@app/models/servers-pool.model';

import {
  hasUniqueValues,
  isNonEmptyString,
  isRecord,
  isIpv4Value,
  isPortValue,
} from '@app/validators/app-validators';

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
    isPortValue(value['port']) &&
    hasExactlyOneAddress(value)
  );
}

function hasExactlyOneAddress(value: Record<string, unknown>): boolean {
  const ipFilled = isNonEmptyString(value['ip']);
  const dnsFilled = isNonEmptyString(value['dns']);
  if (ipFilled === dnsFilled) return false;
  return ipFilled ? isIpv4Value(value['ip']) : true;
}
