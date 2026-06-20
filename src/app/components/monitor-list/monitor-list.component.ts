import { Component, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

import { StorageService } from '../../services/storage.service';

interface MonitorListRow {
  hostname: string;
  checked: boolean;
}

interface MonitorListView {
  rows: MonitorListRow[];
  orphans: string[];
  selectedCount: number;
}

@Component({
  selector: 'app-monitor-list',
  templateUrl: './monitor-list.component.html',
  styleUrl: './monitor-list.component.css',
})
export class MonitorListComponent {
  private readonly storage = inject(StorageService);

  readonly view$: Observable<MonitorListView> = combineLatest([
    this.storage.serversPool$,
    this.storage.monitorList$,
  ]).pipe(
    map(([servers, list]) => {
      const selected = new Set(list);
      const known = new Set(servers.map((server) => server.hostname));
      return {
        rows: servers.map((server) => ({
          hostname: server.hostname,
          checked: selected.has(server.hostname),
        })),
        orphans: list.filter((hostname) => !known.has(hostname)),
        selectedCount: list.length,
      };
    }),
  );

  toggle(hostname: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.storage.monitorList;

    if (!checked) {
      this.storage.setMonitorList(current.filter((entry) => entry !== hostname));
      return;
    }

    const alreadyExists = current.includes(hostname);
    if (!alreadyExists) this.storage.setMonitorList([...current, hostname]);
  }
}
