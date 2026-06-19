import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const MIN_PORT = 1;
const MAX_PORT = 65535;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function isInteger(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return Number.isInteger(control.value) ? null : { integer: true };
}

export function isPort(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const value = control.value;
  return Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT ? null : { port: true };
}

export function isEmail(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return EMAIL_PATTERN.test(control.value) ? null : { email: true };
}

export function isIpv4(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return IPV4_PATTERN.test(control.value) ? null : { ipv4: true };
}

export function isExactlyOneOf(keys: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const filled = keys.filter((key) => !isEmpty(group.get(key)?.value));
    return filled.length === 1 ? null : { exactlyOneOf: true };
  };
}
