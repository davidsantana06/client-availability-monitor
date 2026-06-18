import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';

export const FILENAMES = {
  monitorConfig: 'monitor_config.json',
  serversPool: 'servers_pool.json',
  usersInfo: 'users_info.json',
  monitorList: 'monitor_list.txt',
} as const;

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private readonly storage: StorageService) {}

  exportJson(filename: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.download(filename, blob);
  }

  exportText(filename: string, text: string): void {
    const blob = new Blob([text], { type: 'text/plain' });
    this.download(filename, blob);
  }

  exportAll(): void {
    this.exportJson(FILENAMES.monitorConfig, this.storage.monitorConfig);
    this.exportJson(FILENAMES.serversPool, this.storage.serversPool);
    this.exportJson(FILENAMES.usersInfo, this.storage.usersInfo);
    this.exportText(FILENAMES.monitorList, this.toMonitorListText(this.storage.monitorList));
  }

  private toMonitorListText(hostnames: string[]): string {
    return hostnames.join('\n') + '\n';
  }

  private download(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
