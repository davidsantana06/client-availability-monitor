import { Injectable, inject } from '@angular/core';

import { Server, ServersPool } from '@app/models/servers-pool.model';
import { ArtifactStore } from '@app/services/base/artifact-store';
import { isServersPool } from '@app/validators/servers-pool.validators';

import { ExportService } from '@app/services/export.service';
import { MonitorListService } from '@app/services/monitor-list.service';

const FILENAME = 'servers_pool.json';

const SEED: ServersPool = [
  { hostname: 'google-dns', ip: '8.8.8.8', port: 53 },
  { hostname: 'cloudflare', dns: 'one.one.one.one', port: 443 },
  { hostname: 'example-web', dns: 'example.com', port: 443 },
  { hostname: 'unreachable', ip: '192.0.2.1', port: 9999 },
];

@Injectable({ providedIn: 'root' })
export class ServersPoolService extends ArtifactStore<ServersPool> {
  private readonly download = inject(ExportService);
  private readonly monitorList = inject(MonitorListService);
  readonly filename = FILENAME;

  constructor() {
    super(SEED);
  }

  protected parse(text: string): ServersPool {
    const invalidMessage = 'The file is not a valid servers pool.';
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(invalidMessage);
    }
    if (!isServersPool(value)) throw new Error(invalidMessage);
    return value;
  }

  export(): void {
    this.download.downloadJson(FILENAME, this.value);
  }

  addOne(server: Server): void {
    this.set([...this.value, server]);
  }

  updateOne(index: number, server: Server): void {
    const previous = this.value[index];
    this.set(this.value.map((item, i) => (i === index ? server : item)));
    if (previous.hostname !== server.hostname) {
      this.monitorList.rename(previous.hostname, server.hostname);
    }
  }

  removeOne(index: number): void {
    const removed = this.value[index];
    this.set(this.value.filter((_, i) => i !== index));
    this.monitorList.deselect(removed.hostname);
  }
}
