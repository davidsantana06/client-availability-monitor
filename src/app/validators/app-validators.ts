import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PORT_MIN_VALUE = 1;
export const PORT_MAX_VALUE = 65535;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isInteger(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const isValid = Number.isInteger(control.value);
  return isValid ? null : { integer: true };
}

export function isPort(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return isValidPort(control.value) ? null : { port: true };
}

export function isEmail(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return isValidEmail(control.value) ? null : { email: true };
}

export function isIpv4(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return isValidIpv4(control.value) ? null : { ipv4: true };
}

export function isExactlyOneOf(keys: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const filled = keys.filter((key) => !isEmpty(group.get(key)?.value));
    return filled.length === 1 ? null : { exactlyOneOf: true };
  };
}

export function isUniqueIn(getExisting: () => string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmpty(control.value)) return null;

    const value = normalize(control.value);
    const existing = getExisting().map(normalize);
    return existing.includes(value) ? { notUnique: true } : null;
  };
}

export function hasError(form: AbstractControl, path: string): boolean {
  const control = form.get(path);
  return !!control && control.invalid && control.touched;
}

export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isPositiveInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

export function isValidPort(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= PORT_MIN_VALUE &&
    value <= PORT_MAX_VALUE
  );
}

export function isValidEmail(value: unknown): boolean {
  return isNonEmptyString(value) && EMAIL_PATTERN.test(value);
}

export function isValidIpv4(value: unknown): boolean {
  return isNonEmptyString(value) && IPV4_PATTERN.test(value);
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function normalize(value: unknown): string {
  return String(value).trim().toLowerCase();
}
