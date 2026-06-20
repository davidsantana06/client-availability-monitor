import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { StorageService } from '../../services/storage.service';
import { Server, ServersPool } from '../../models/servers-pool.model';
import { hasError, isExactlyOneOf, isIpv4, isPort, isUniqueIn } from '../../validators/app-validators';

@Component({
  selector: 'app-servers-pool',
  templateUrl: './servers-pool.component.html',
})
export class ServersPoolComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  readonly servers$: Observable<ServersPool> = this.storage.serversPool$;
  readonly hasError = hasError;
  form!: FormGroup;
  editingIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        hostname: ['', [Validators.required, isUniqueIn(() => this.otherHostnames())]],
        port: [null, [Validators.required, isPort]],
        ip: ['', isIpv4],
        dns: [''],
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
    const server = this.storage.serversPool[index];
    this.form.setValue({
      hostname: server.hostname,
      port: server.port,
      ip: server.ip ?? '',
      dns: server.dns ?? '',
    });
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

    if (this.isEditing) this.storage.updateServer(this.editingIndex!, server);
    else this.storage.addServer(server);
    this.cancel();
  }

  cancel(): void {
    this.form.reset({ hostname: '', port: null, ip: '', dns: '' });
    this.editingIndex = null;
  }

  remove(index: number): void {
    this.storage.removeServer(index);
    if (this.isEditing) this.cancel();
  }

  private otherHostnames(): string[] {
    return this.storage.serversPool
      .filter((_, index) => index !== this.editingIndex)
      .map((server) => server.hostname);
  }
}
