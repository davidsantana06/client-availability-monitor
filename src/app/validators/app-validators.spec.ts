import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  hasError,
  isEmailControl,
  isExactlyOneOfControl,
  isIntegerControl,
  isIpv4Control,
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

  describe('isIpv4Control', () => {
    it('accepts valid addresses', () => {
      expect(isIpv4Control(new FormControl('0.0.0.0'))).toBeNull();
      expect(isIpv4Control(new FormControl('255.255.255.255'))).toBeNull();
      expect(isIpv4Control(new FormControl('8.8.8.8'))).toBeNull();
    });

    it('rejects invalid addresses', () => {
      expect(isIpv4Control(new FormControl('256.0.0.1'))).toEqual({ ipv4: true });
      expect(isIpv4Control(new FormControl('1.2.3'))).toEqual({ ipv4: true });
      expect(isIpv4Control(new FormControl('1.2.3.4.5'))).toEqual({ ipv4: true });
      expect(isIpv4Control(new FormControl('abc'))).toEqual({ ipv4: true });
    });
  });

  describe('isExactlyOneOfControl', () => {
    const validator = isExactlyOneOfControl(['ip', 'dns']);
    const group = (ip: string, dns: string) =>
      new FormGroup({ ip: new FormControl(ip), dns: new FormControl(dns) });

    it('accepts exactly one filled field', () => {
      expect(validator(group('8.8.8.8', ''))).toBeNull();
      expect(validator(group('', 'example.com'))).toBeNull();
    });

    it('rejects when none or both are filled', () => {
      expect(validator(group('', ''))).toEqual({ exactlyOneOf: true });
      expect(validator(group('8.8.8.8', 'example.com'))).toEqual({ exactlyOneOf: true });
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
