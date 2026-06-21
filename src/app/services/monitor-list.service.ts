import { Injectable, inject } from '@angular/core';

import { ArtifactStore } from './base/artifact-store';
import { ExportService } from './export.service';
import { MonitorList } from '../models/monitor-list.model';

const FILENAME = 'monitor_list.txt';

const SEED: MonitorList = ['google-dns', 'cloudflare', 'example-web', 'unreachable'];

@Injectable({ providedIn: 'root' })
export class MonitorListService extends ArtifactStore<MonitorList> {
  private readonly download = inject(ExportService);
  readonly filename = FILENAME;

  constructor() {
    super(SEED);
  }

  parse(text: string): MonitorList {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  export(): void {
    const text = this.value.join('\n') + '\n';
    this.download.downloadText(FILENAME, text);
  }

  select(hostname: string): void {
    if (!this.value.includes(hostname)) this.set([...this.value, hostname]);
  }

  deselect(hostname: string): void {
    if (this.value.includes(hostname)) this.set(this.value.filter((entry) => entry !== hostname));
  }

  selectAll(hostnames: string[]): void {
    this.set([...hostnames]);
  }

  clear(): void {
    this.set([]);
  }

  rename(from: string, to: string): void {
    if (!this.value.includes(from)) return;
    this.set(this.value.map((hostname) => (hostname === from ? to : hostname)));
  }
}
