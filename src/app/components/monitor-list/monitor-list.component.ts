import { Component, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

import { MonitorListService } from '@app/services/monitor-list.service';
import { ServersPoolService } from '@app/services/servers-pool.service';

interface MonitorListRow {
  hostname: string;
  checked: boolean;
}

interface MonitorListView {
  rows: MonitorListRow[];
  hostnames: string[];
  orphans: string[];
  selectedCount: number;
  allChecked: boolean;
}

@Component({
  selector: 'app-monitor-list',
  templateUrl: './monitor-list.component.html',
})
export class MonitorListComponent {
  private readonly servers = inject(ServersPoolService);
  readonly service = inject(MonitorListService);

  readonly view$: Observable<MonitorListView> = combineLatest([
    this.servers.value$,
    this.service.value$,
  ]).pipe(
    map(([pool, list]) => {
      const selected = new Set(list);
      const hostnames = pool.map((server) => server.hostname);
      const known = new Set(hostnames);
      const rows = hostnames.map((hostname) => ({ hostname, checked: selected.has(hostname) }));
      return {
        rows,
        hostnames,
        orphans: list.filter((hostname) => !known.has(hostname)),
        selectedCount: list.length,
        allChecked: rows.length > 0 && rows.every((row) => row.checked),
      };
    }),
  );

  toggle(hostname: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.service.select(hostname);
    else this.service.deselect(hostname);
  }
}
