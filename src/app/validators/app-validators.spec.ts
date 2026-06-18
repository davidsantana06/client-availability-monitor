import { FormControl, FormGroup } from '@angular/forms';

import { email, exactlyOneOf, integer, ipv4, port } from './app-validators';

describe('app-validators', () => {
  describe('integer', () => {
    it('treats empty as valid (delegated to required)', () => {
      expect(integer(new FormControl(null))).toBeNull();
      expect(integer(new FormControl(''))).toBeNull();
    });

    it('accepts integers and rejects non-integers', () => {
      expect(integer(new FormControl(10))).toBeNull();
      expect(integer(new FormControl(10.5))).toEqual({ integer: true });
    });
  });

  describe('port', () => {
    it('accepts ports within 1-65535', () => {
      expect(port(new FormControl(1))).toBeNull();
      expect(port(new FormControl(65535))).toBeNull();
    });

    it('rejects out-of-range or non-integer ports', () => {
      expect(port(new FormControl(0))).toEqual({ port: true });
      expect(port(new FormControl(65536))).toEqual({ port: true });
      expect(port(new FormControl(80.5))).toEqual({ port: true });
    });
  });

  describe('email', () => {
    it('accepts a valid address and rejects malformed ones', () => {
      expect(email(new FormControl('user@example.com'))).toBeNull();
      expect(email(new FormControl('not-an-email'))).toEqual({ email: true });
      expect(email(new FormControl('a@b'))).toEqual({ email: true });
    });
  });

  describe('ipv4', () => {
    it('accepts valid addresses', () => {
      expect(ipv4(new FormControl('0.0.0.0'))).toBeNull();
      expect(ipv4(new FormControl('255.255.255.255'))).toBeNull();
      expect(ipv4(new FormControl('8.8.8.8'))).toBeNull();
    });

    it('rejects invalid addresses', () => {
      expect(ipv4(new FormControl('256.0.0.1'))).toEqual({ ipv4: true });
      expect(ipv4(new FormControl('1.2.3'))).toEqual({ ipv4: true });
      expect(ipv4(new FormControl('1.2.3.4.5'))).toEqual({ ipv4: true });
      expect(ipv4(new FormControl('abc'))).toEqual({ ipv4: true });
    });
  });

  describe('exactlyOneOf', () => {
    const validator = exactlyOneOf(['ip', 'dns']);
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
});
