import { hasUniqueValues, isNonEmptyString, isRecord, isValidEmail } from './app-validators';
import { User, UsersInfo } from '../models/users-info.model';

export function isUsersInfo(value: unknown): value is UsersInfo {
  return (
    Array.isArray(value) &&
    value.every(isUser) &&
    hasUniqueValues(value.map((user) => user.email))
  );
}

function isUser(value: unknown): value is User {
  return isRecord(value) && isNonEmptyString(value['username']) && isValidEmail(value['email']);
}
