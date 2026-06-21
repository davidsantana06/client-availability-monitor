import { Component, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

import { ServersPoolService } from '../../services/servers-pool.service';
import { MonitorListService } from '../../services/monitor-list.service';

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
      const known = new Set(pool.map((server) => server.hostname));
      return {
        rows: pool.map((server) => ({
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
    if (checked) this.service.select(hostname);
    else this.service.deselect(hostname);
  }
}
