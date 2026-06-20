import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import {
  parseMonitorConfig,
  parseServersPool,
  parseUsersInfo,
} from '../validators/artifact-parsers';

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
    monitorConfig: (text) => this.storage.setMonitorConfig(parseMonitorConfig(text)),
    serversPool: (text) => this.storage.setServersPool(parseServersPool(text)),
    usersInfo: (text) => this.storage.setUsersInfo(parseUsersInfo(text)),
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
