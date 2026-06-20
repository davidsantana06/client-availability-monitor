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

export interface ImportResult {
  loaded: string[];
  unknown: string[];
  failed: string[];
}

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

  private readonly artifactByFilename = Object.fromEntries(
    (Object.keys(FILENAMES) as Artifact[]).map((artifact) => [FILENAMES[artifact], artifact]),
  ) as Record<string, Artifact>;

  constructor(private readonly storage: StorageService) {}

  exportArtifact(artifact: Artifact): void {
    this.exporters[artifact]();
  }

  exportAll(): void {
    (Object.keys(this.exporters) as Artifact[]).forEach((artifact) => this.exporters[artifact]());
  }

  async importAs(artifact: Artifact, file: File): Promise<void> {
    this.readers[artifact](await file.text());
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

  summarizeImport(result: ImportResult): AlertMessage {
    const lines: string[] = [];
    if (result.loaded.length) lines.push(`Imported: ${result.loaded.join(', ')}`);
    if (result.failed.length) lines.push(`Failed to parse: ${result.failed.join(', ')}`);
    if (result.unknown.length) lines.push(`Ignored (unknown name): ${result.unknown.join(', ')}`);
    const hasFailures = result.failed.length > 0;
    return { type: hasFailures ? 'danger' : 'success', lines };
  }

  private async importFile(file: File): Promise<boolean> {
    const artifact = this.artifactByFilename[file.name];
    if (!artifact) return false;

    await this.importAs(artifact, file);
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
