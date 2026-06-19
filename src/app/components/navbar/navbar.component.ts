import { Component, inject } from '@angular/core';

import { ExportService } from '../../services/export.service';

interface ImportMessage {
  type: 'success' | 'danger';
  text: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly exportService = inject(ExportService);

  message: ImportMessage | null = null;

  exportAll(): void {
    this.exportService.exportAll();
  }

  async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    const loaded: string[] = [];
    const unknown: string[] = [];
    const failed: string[] = [];
    for (const file of files) {
      try {
        const recognized = await this.exportService.importFile(file);
        (recognized ? loaded : unknown).push(file.name);
      } catch {
        failed.push(file.name);
      }
    }
    this.message = this.buildMessage(loaded, unknown, failed);
  }

  dismiss(): void {
    this.message = null;
  }

  private buildMessage(loaded: string[], unknown: string[], failed: string[]): ImportMessage {
    const parts: string[] = [];
    if (loaded.length) parts.push(`Loaded: ${loaded.join(', ')}`);
    if (unknown.length) parts.push(`Ignored (unknown filename): ${unknown.join(', ')}`);
    if (failed.length) parts.push(`Failed to parse: ${failed.join(', ')}`);
    const type: ImportMessage['type'] = failed.length ? 'danger' : 'success';
    return { type, text: parts.join(' · ') };
  }
}
