import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConfirmRequest } from '@app/components/confirm-dialog/confirm-dialog.component';
import { Server } from '@app/models/servers-pool.model';
import { ServersPoolService } from '@app/services/servers-pool.service';
import {
  PORT_MAX_VALUE,
  PORT_MIN_VALUE,
  hasError,
  isExactlyOneOfControl,
  isIpv4Control,
  isPortControl,
  isUniqueInControl,
} from '@app/validators/app-validators';

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
  removalIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        hostname: [
          '',
          [
            Validators.required,
            isUniqueInControl(() => this.otherHostnames()),
            Validators.maxLength(LIMITS.hostnameMaxLength),
          ],
        ],
        port: [null, [Validators.required, isPortControl]],
        ip: ['', [isIpv4Control, Validators.maxLength(LIMITS.ipMaxLength)]],
        dns: ['', Validators.maxLength(LIMITS.dnsMaxLength)],
      },
      { validators: isExactlyOneOfControl(['ip', 'dns']) },
    );
  }

  get isEditing(): boolean {
    return this.editingIndex !== null;
  }

  get removalRequest(): ConfirmRequest | null {
    if (this.removalIndex === null) return null;

    const server = this.service.value[this.removalIndex];
    return {
      title: 'Remove server?',
      message: `"${server.hostname}" will be removed from the pool and the monitor list.`,
      confirmLabel: 'Remove',
    };
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

  submit(): void {
    if (this.form.invalid) return;

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

  edit(index: number): void {
    this.editingIndex = index;
    this.fillForm(this.service.value[index]);
  }

  cancel(): void {
    this.clearForm();
    this.editingIndex = null;
  }

  remove(index: number): void {
    this.removalIndex = index;
  }

  confirmRemoval(): void {
    this.service.removeOne(this.removalIndex!);
    if (this.isEditing) this.cancel();
    this.removalIndex = null;
  }

  cancelRemoval(): void {
    this.removalIndex = null;
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
