import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PORT_MIN_VALUE = 1;
export const PORT_MAX_VALUE = 65535;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
export const DNS_PATTERN =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isPortValue(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= PORT_MIN_VALUE &&
    value <= PORT_MAX_VALUE
  );
}

export function isPortControl(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return isPortValue(control.value) ? null : { port: true };
}

export function isPositiveIntegerValue(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

export function isIntegerControl(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const isValid = Number.isInteger(control.value);
  return isValid ? null : { integer: true };
}

export function isEmailValue(value: unknown): boolean {
  return isNonEmptyString(value) && EMAIL_PATTERN.test(value);
}

export function isEmailControl(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return isEmailValue(control.value) ? null : { email: true };
}

export function isIpv4Value(value: unknown): boolean {
  return isNonEmptyString(value) && IPV4_PATTERN.test(value);
}

export function isDnsValue(value: unknown): boolean {
  return isNonEmptyString(value) && DNS_PATTERN.test(value);
}

export function isAddressControl(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const value = String(control.value).trim();
  const isValid = /^[\d.]+$/.test(value) ? isIpv4Value(value) : isDnsValue(value);
  return isValid ? null : { address: true };
}

export function hasUniqueValues(values: string[]): boolean {
  const normalized = values.map(normalize);
  return new Set(normalized).size === normalized.length;
}

export function isUniqueInControl(getExisting: () => string[]): ValidatorFn {
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

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function normalize(value: unknown): string {
  return String(value).trim().toLowerCase();
}
