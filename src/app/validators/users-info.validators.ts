import { User, UsersInfo } from '@app/models/users-info.model';

import {
  hasUniqueValues,
  isNonEmptyString,
  isRecord,
  isEmailValue,
} from '@app/validators/app-validators';

export function isUsersInfo(value: unknown): value is UsersInfo {
  return (
    Array.isArray(value) &&
    value.every(isUser) &&
    hasUniqueValues(value.map((user) => user.email))
  );
}

function isUser(value: unknown): value is User {
  return isRecord(value) && isNonEmptyString(value['username']) && isEmailValue(value['email']);
}
