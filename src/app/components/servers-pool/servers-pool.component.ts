import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServersPoolService } from '../../services/servers-pool.service';
import { Server } from '../../models/servers-pool.model';
import {
  PORT_MAX_VALUE,
  PORT_MIN_VALUE,
  hasError,
  isExactlyOneOf,
  isIpv4,
  isPort,
  isUniqueIn,
} from '../../validators/app-validators';

const LIMITS = {
  hostnameMaxLength: 253,
  portMinValue: PORT_MIN_VALUE,
  portMaxValue: PORT_MAX_VALUE,
  ipMaxLength: 15,
  dnsMaxLength: 253,
} as const;

@Component({
  selector: 'app-servers-pool',
  templateUrl: './servers-pool.component.html',
})
export class ServersPoolComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly service = inject(ServersPoolService);

  readonly hasError = hasError;
  readonly limits = LIMITS;
  form!: FormGroup;
  editingIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        hostname: [
          '',
          [
            Validators.required,
            isUniqueIn(() => this.otherHostnames()),
            Validators.maxLength(LIMITS.hostnameMaxLength),
          ],
        ],
        port: [null, [Validators.required, isPort]],
        ip: ['', [isIpv4, Validators.maxLength(LIMITS.ipMaxLength)]],
        dns: ['', Validators.maxLength(LIMITS.dnsMaxLength)],
      },
      { validators: isExactlyOneOf(['ip', 'dns']) },
    );
  }

  get isEditing(): boolean {
    return this.editingIndex !== null;
  }

  get isAddressInvalid(): boolean {
    const ip = this.form.get('ip')!;
    const dns = this.form.get('dns')!;
    return this.form.hasError('exactlyOneOf') && (ip.touched || dns.touched);
  }

  addressType(server: Server): 'IP' | 'DNS' {
    const hasIp = !!server.ip;
    return hasIp ? 'IP' : 'DNS';
  }

  address(server: Server): string {
    return server.ip || server.dns || '';
  }

  edit(index: number): void {
    this.fillForm(this.service.value[index]);
    this.editingIndex = index;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const server: Server = { hostname: raw.hostname.trim(), port: raw.port };
    const hasIp = !!raw.ip;
    if (hasIp) server.ip = raw.ip;
    else server.dns = raw.dns;

    if (this.isEditing) this.service.updateOne(this.editingIndex!, server);
    else this.service.addOne(server);
    this.cancel();
  }

  reset(): void {
    if (this.isEditing) this.fillForm(this.service.value[this.editingIndex!]);
    else this.clearForm();
  }

  cancel(): void {
    this.clearForm();
    this.editingIndex = null;
  }

  remove(index: number): void {
    this.service.removeOne(index);
    if (this.isEditing) this.cancel();
  }

  private fillForm(server: Server): void {
    this.form.setValue({
      hostname: server.hostname,
      port: server.port,
      ip: server.ip ?? '',
      dns: server.dns ?? '',
    });
  }

  private clearForm(): void {
    this.form.reset({ hostname: '', port: null, ip: '', dns: '' });
  }

  private otherHostnames(): string[] {
    return this.service.value
      .filter((_, index) => index !== this.editingIndex)
      .map((server) => server.hostname);
  }
}
