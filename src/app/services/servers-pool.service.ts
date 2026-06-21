import { Injectable, inject } from '@angular/core';

import { ArtifactStore } from './base/artifact-store';
import { ExportService } from './export.service';
import { MonitorListService } from './monitor-list.service';
import { Server, ServersPool } from '../models/servers-pool.model';
import { parseJson } from '../validators/app-validators';
import { isServersPool } from '../validators/servers-pool.validators';

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
    const value = parseJson(text);
    if (!isServersPool(value)) throw new Error('The file is not a valid servers pool.');
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
