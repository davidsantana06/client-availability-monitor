import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { StorageService } from '../../services/storage.service';
import { Server, ServersPool } from '../../models/servers-pool.model';
import { exactlyOneOf, ipv4, port } from '../../validators/app-validators';

@Component({
  selector: 'app-servers-pool',
  templateUrl: './servers-pool.component.html',
  styleUrl: './servers-pool.component.css',
})
export class ServersPoolComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  readonly servers$: Observable<ServersPool> = this.storage.serversPool$;
  form!: FormGroup;
  editingIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        hostname: ['', Validators.required],
        port: [null, [Validators.required, port]],
        ip: ['', ipv4],
        dns: [''],
      },
      { validators: exactlyOneOf(['ip', 'dns']) },
    );
  }

  invalid(control: string): boolean {
    const target = this.form.get(control);
    return !!target && target.invalid && target.touched;
  }

  get addressInvalid(): boolean {
    const ip = this.form.get('ip')!;
    const dns = this.form.get('dns')!;
    return this.form.hasError('exactlyOneOf') && (ip.touched || dns.touched);
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

  remove(index: number): void {
    this.storage.setServersPool(this.storage.serversPool.filter((_, i) => i !== index));
    if (this.editingIndex !== null) {
      this.cancel();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const server: Server = { hostname: raw.hostname, port: raw.port };
    if (raw.ip) {
      server.ip = raw.ip;
    } else {
      server.dns = raw.dns;
    }

    const servers = [...this.storage.serversPool];
    if (this.editingIndex === null) {
      servers.push(server);
    } else {
      servers[this.editingIndex] = server;
    }
    this.storage.setServersPool(servers);
    this.cancel();
  }

  cancel(): void {
    this.form.reset({ hostname: '', port: null, ip: '', dns: '' });
    this.editingIndex = null;
  }
}
