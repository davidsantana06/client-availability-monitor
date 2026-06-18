import { AbstractControl, ValidationErrors } from '@angular/forms';

const MIN_PORT = 1;
const MAX_PORT = 65535;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function integer(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return Number.isInteger(control.value) ? null : { integer: true };
}

export function port(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  const value = control.value;
  const valid = Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT;
  return valid ? null : { port: true };
}

export function email(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) return null;

  return EMAIL_PATTERN.test(control.value) ? null : { email: true };
}
