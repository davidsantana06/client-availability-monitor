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

export interface ImportResult {
  loaded: string[];
  unknown: string[];
  failed: string[];
}

export interface ImportMessage {
  type: 'success' | 'danger';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly readers: Record<string, (text: string) => void> = {
    [FILENAMES.monitorConfig]: (text) => this.storage.setMonitorConfig(this.readJsonObject<MonitorConfig>(text)),
    [FILENAMES.serversPool]: (text) => this.storage.setServersPool(this.readJsonArray<Server>(text)),
    [FILENAMES.usersInfo]: (text) => this.storage.setUsersInfo(this.readJsonArray<User>(text)),
    [FILENAMES.monitorList]: (text) => this.storage.setMonitorList(this.readTextLines(text)),
  };

  constructor(private readonly storage: StorageService) {}

  exportMonitorConfig(): void {
    this.downloadJson(FILENAMES.monitorConfig, this.storage.monitorConfig);
  }

  exportServersPool(): void {
    this.downloadJson(FILENAMES.serversPool, this.storage.serversPool);
  }

  exportUsersInfo(): void {
    this.downloadJson(FILENAMES.usersInfo, this.storage.usersInfo);
  }

  exportMonitorList(): void {
    const text = this.storage.monitorList.join('\n') + '\n';
    this.downloadText(FILENAMES.monitorList, text);
  }

  exportAll(): void {
    this.exportMonitorConfig();
    this.exportServersPool();
    this.exportUsersInfo();
    this.exportMonitorList();
  }

  async importFiles(files: File[]): Promise<ImportResult> {
    const result: ImportResult = { loaded: [], unknown: [], failed: [] };
    for (const file of files) {
      try {
        const recognized = await this.importFile(file);
        (recognized ? result.loaded : result.unknown).push(file.name);
      } catch {
        result.failed.push(file.name);
      }
    }
    return result;
  }

  summarizeImport(result: ImportResult): ImportMessage {
    const parts: string[] = [];
    if (result.loaded.length) parts.push(`Loaded: ${result.loaded.join(', ')}`);
    if (result.unknown.length)
      parts.push(`Ignored (unknown filename): ${result.unknown.join(', ')}`);
    if (result.failed.length) parts.push(`Failed to parse: ${result.failed.join(', ')}`);
    const hasFailures = result.failed.length > 0;
    return { type: hasFailures ? 'danger' : 'success', text: parts.join(' · ') };
  }

  private async importFile(file: File): Promise<boolean> {
    const reader = this.readers[file.name];
    if (!reader) return false;

    reader(await file.text());
    return true;
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
