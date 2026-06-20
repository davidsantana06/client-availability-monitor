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

export type Artifact = keyof typeof FILENAMES;

export interface AlertMessage {
  type: 'success' | 'danger';
  lines: string[];
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly readers: Record<Artifact, (text: string) => void> = {
    monitorConfig: (text) => this.storage.setMonitorConfig(this.readJsonObject<MonitorConfig>(text)),
    serversPool: (text) => this.storage.setServersPool(this.readJsonArray<Server>(text)),
    usersInfo: (text) => this.storage.setUsersInfo(this.readJsonArray<User>(text)),
    monitorList: (text) => this.storage.setMonitorList(this.readTextLines(text)),
  };

  private readonly exporters: Record<Artifact, () => void> = {
    monitorConfig: () => this.downloadJson(FILENAMES.monitorConfig, this.storage.monitorConfig),
    serversPool: () => this.downloadJson(FILENAMES.serversPool, this.storage.serversPool),
    usersInfo: () => this.downloadJson(FILENAMES.usersInfo, this.storage.usersInfo),
    monitorList: () => {
      const text = this.storage.monitorList.join('\n') + '\n';
      this.downloadText(FILENAMES.monitorList, text);
    },
  };

  constructor(private readonly storage: StorageService) {}

  exportArtifact(artifact: Artifact): void {
    this.exporters[artifact]();
  }

  async importAs(artifact: Artifact, file: File): Promise<void> {
    this.readers[artifact](await file.text());
  }

  private downloadJson(filename: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.download(filename, blob);
  }

  private downloadText(filename: string, text: string): void {
    const blob = new Blob([text], { type: 'text/plain' });
    this.download(filename, blob);
  }

  private readJsonObject<T>(text: string): T {
    return JSON.parse(text) as T;
  }

  private readJsonArray<T>(text: string): T[] {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');

    return parsed as T[];
  }

  private readTextLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
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
