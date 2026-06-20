import { FormControl, FormGroup } from '@angular/forms';

import { isEmail, isExactlyOneOf, isInteger, isIpv4, isPort, isUniqueIn } from './app-validators';

describe('app-validators', () => {
  describe('isInteger', () => {
    it('treats empty as valid (delegated to required)', () => {
      expect(isInteger(new FormControl(null))).toBeNull();
      expect(isInteger(new FormControl(''))).toBeNull();
    });

    it('accepts integers and rejects non-integers', () => {
      expect(isInteger(new FormControl(10))).toBeNull();
      expect(isInteger(new FormControl(10.5))).toEqual({ integer: true });
    });
  });

  describe('isPort', () => {
    it('accepts ports within 1-65535', () => {
      expect(isPort(new FormControl(1))).toBeNull();
      expect(isPort(new FormControl(65535))).toBeNull();
    });

    it('rejects out-of-range or non-integer ports', () => {
      expect(isPort(new FormControl(0))).toEqual({ port: true });
      expect(isPort(new FormControl(65536))).toEqual({ port: true });
      expect(isPort(new FormControl(80.5))).toEqual({ port: true });
    });
  });

  describe('isEmail', () => {
    it('accepts a valid address and rejects malformed ones', () => {
      expect(isEmail(new FormControl('user@example.com'))).toBeNull();
      expect(isEmail(new FormControl('not-an-email'))).toEqual({ email: true });
      expect(isEmail(new FormControl('a@b'))).toEqual({ email: true });
    });
  });

  describe('isIpv4', () => {
    it('accepts valid addresses', () => {
      expect(isIpv4(new FormControl('0.0.0.0'))).toBeNull();
      expect(isIpv4(new FormControl('255.255.255.255'))).toBeNull();
      expect(isIpv4(new FormControl('8.8.8.8'))).toBeNull();
    });

    it('rejects invalid addresses', () => {
      expect(isIpv4(new FormControl('256.0.0.1'))).toEqual({ ipv4: true });
      expect(isIpv4(new FormControl('1.2.3'))).toEqual({ ipv4: true });
      expect(isIpv4(new FormControl('1.2.3.4.5'))).toEqual({ ipv4: true });
      expect(isIpv4(new FormControl('abc'))).toEqual({ ipv4: true });
    });
  });

  describe('isExactlyOneOf', () => {
    const validator = isExactlyOneOf(['ip', 'dns']);
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

  describe('isUniqueIn', () => {
    const validator = isUniqueIn(() => ['google-dns', 'cloudflare']);

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
});
