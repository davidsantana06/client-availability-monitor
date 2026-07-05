import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConfirmRequest } from '@app/components/confirm-dialog/confirm-dialog.component';
import { Server } from '@app/models/servers-pool.model';
import { ServersPoolService } from '@app/services/servers-pool.service';
import {
  PORT_MAX_VALUE,
  PORT_MIN_VALUE,
  hasError,
  isAddressControl,
  isIpv4Value,
  isPortControl,
  isUniqueInControl,
} from '@app/validators/app-validators';

const LIMITS = {
  hostnameMaxLength: 253,
  addressMaxLength: 253,
  portMinValue: PORT_MIN_VALUE,
  portMaxValue: PORT_MAX_VALUE,
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
    this.form = this.fb.group({
      hostname: [
        '',
        [
          Validators.required,
          isUniqueInControl(() => this.otherHostnames()),
          Validators.maxLength(LIMITS.hostnameMaxLength),
        ],
      ],
      address: [
        '',
        [Validators.required, isAddressControl, Validators.maxLength(LIMITS.addressMaxLength)],
      ],
      port: [null, [Validators.required, isPortControl]],
    });
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
    const address = raw.address.trim();
    const server: Server = { hostname: raw.hostname.trim(), port: raw.port };
    if (isIpv4Value(address)) server.ip = address;
    else server.dns = address;

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
      address: server.ip ?? server.dns ?? '',
      port: server.port,
    });
  }

  private clearForm(): void {
    this.form.reset({ hostname: '', address: '', port: null });
  }

  private otherHostnames(): string[] {
    return this.service.value
      .filter((_, index) => index !== this.editingIndex)
      .map((server) => server.hostname);
  }
}
