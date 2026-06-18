import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import { MonitorConfig } from '../models/monitor-config.model';
import { Server } from '../models/servers-pool.model';
import { User } from '../models/users-info.model';

export const FILENAMES = {
  monitorConfig: 'monitor_config.json',
  serversPool: 'servers_pool.json',
  usersInfo: 'users_info.json',
  monitorList: 'monitor_list.txt',
} as const;

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly readers: Record<string, (text: string) => void> = {
    [FILENAMES.monitorConfig]: (text) =>
      this.storage.setMonitorConfig(this.readJson<MonitorConfig>(text)),
    [FILENAMES.serversPool]: (text) => this.storage.setServersPool(this.readArray<Server>(text)),
    [FILENAMES.usersInfo]: (text) => this.storage.setUsersInfo(this.readArray<User>(text)),
    [FILENAMES.monitorList]: (text) => this.storage.setMonitorList(this.readLines(text)),
  };

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

  async importFile(file: File): Promise<boolean> {
    const reader = this.readers[file.name];
    if (!reader) return false;

    reader(await file.text());
    return true;
  }

  private readJson<T>(text: string): T {
    return JSON.parse(text) as T;
  }

  private readArray<T>(text: string): T[] {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected a JSON array');
    }
    return parsed as T[];
  }

  private readLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
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
