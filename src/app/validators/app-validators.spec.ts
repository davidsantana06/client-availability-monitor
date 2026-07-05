import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  hasError,
  isAddressControl,
  isDnsValue,
  isEmailControl,
  isIntegerControl,
  isPortControl,
  isUniqueInControl,
} from '@app/validators/app-validators';

describe('app-validators', () => {
  describe('isIntegerControl', () => {
    it('treats empty as valid (delegated to required)', () => {
      expect(isIntegerControl(new FormControl(null))).toBeNull();
      expect(isIntegerControl(new FormControl(''))).toBeNull();
    });

    it('accepts integers and rejects non-integers', () => {
      expect(isIntegerControl(new FormControl(10))).toBeNull();
      expect(isIntegerControl(new FormControl(10.5))).toEqual({ integer: true });
    });
  });

  describe('isPortControl', () => {
    it('accepts ports within 1-65535', () => {
      expect(isPortControl(new FormControl(1))).toBeNull();
      expect(isPortControl(new FormControl(65535))).toBeNull();
    });

    it('rejects out-of-range or non-integer ports', () => {
      expect(isPortControl(new FormControl(0))).toEqual({ port: true });
      expect(isPortControl(new FormControl(65536))).toEqual({ port: true });
      expect(isPortControl(new FormControl(80.5))).toEqual({ port: true });
    });
  });

  describe('isEmailControl', () => {
    it('accepts a valid address and rejects malformed ones', () => {
      expect(isEmailControl(new FormControl('user@example.com'))).toBeNull();
      expect(isEmailControl(new FormControl('not-an-email'))).toEqual({ email: true });
      expect(isEmailControl(new FormControl('a@b'))).toEqual({ email: true });
    });
  });

  describe('isDnsValue', () => {
    it('accepts valid DNS names', () => {
      expect(isDnsValue('example.com')).toBeTrue();
      expect(isDnsValue('one.one.one.one')).toBeTrue();
      expect(isDnsValue('host-1')).toBeTrue();
    });

    it('rejects malformed DNS names', () => {
      expect(isDnsValue('')).toBeFalse();
      expect(isDnsValue('-bad.com')).toBeFalse();
      expect(isDnsValue('has space')).toBeFalse();
    });
  });

  describe('isAddressControl', () => {
    it('treats empty as valid (delegated to required)', () => {
      expect(isAddressControl(new FormControl(null))).toBeNull();
      expect(isAddressControl(new FormControl(''))).toBeNull();
    });

    it('accepts a valid IPv4 or hostname', () => {
      expect(isAddressControl(new FormControl('8.8.8.8'))).toBeNull();
      expect(isAddressControl(new FormControl('example.com'))).toBeNull();
    });

    it('rejects a malformed IPv4 instead of treating it as a DNS name', () => {
      expect(isAddressControl(new FormControl('1.2.3'))).toEqual({ address: true });
      expect(isAddressControl(new FormControl('256.0.0.1'))).toEqual({ address: true });
    });

    it('rejects a malformed DNS name', () => {
      expect(isAddressControl(new FormControl('has space'))).toEqual({ address: true });
    });
  });

  describe('isUniqueInControl', () => {
    const validator = isUniqueInControl(() => ['google-dns', 'cloudflare']);

    it('treats empty as valid (delegated to required)', () => {
      expect(validator(new FormControl(null))).toBeNull();
      expect(validator(new FormControl(''))).toBeNull();
    });

    it('rejects a value already present, ignoring case and surrounding spaces', () => {
      expect(validator(new FormControl('GOOGLE-DNS'))).toEqual({ notUnique: true });
      expect(validator(new FormControl('  cloudflare  '))).toEqual({ notUnique: true });
    });

    it('accepts a value absent from the list', () => {
      expect(validator(new FormControl('quad9'))).toBeNull();
    });
  });

  describe('hasError', () => {
    const form = () => new FormGroup({ name: new FormControl('', Validators.required) });

    it('flags an invalid control only after it is touched', () => {
      const group = form();
      expect(hasError(group, 'name')).toBeFalse();

      group.get('name')!.markAsTouched();
      expect(hasError(group, 'name')).toBeTrue();
    });

    it('clears once the control becomes valid', () => {
      const group = form();
      group.get('name')!.markAsTouched();
      group.get('name')!.setValue('alice');
      expect(hasError(group, 'name')).toBeFalse();
    });

    it('is false for an unknown path', () => {
      expect(hasError(form(), 'missing')).toBeFalse();
    });
  });
});
