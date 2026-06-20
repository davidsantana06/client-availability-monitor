import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const MIN_PORT = 1;
const MAX_PORT = 65535;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isInteger(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const isValid = Number.isInteger(control.value);
  return isValid ? null : { integer: true };
}

export function isPort(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const { value } = control;
  const isValid = Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT;
  return isValid ? null : { port: true };
}

export function isEmail(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const isValid = EMAIL_PATTERN.test(control.value);
  return isValid ? null : { email: true };
}

export function isIpv4(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const isValid = IPV4_PATTERN.test(control.value);
  return isValid ? null : { ipv4: true };
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

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function normalize(value: unknown): string {
  return String(value).trim().toLowerCase();
}
