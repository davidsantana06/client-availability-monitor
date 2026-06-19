import { Component, inject } from '@angular/core';

import { ExportService, ImportMessage } from '../../services/export.service';

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

    const result = await this.exportService.importFiles(files);
    this.message = this.exportService.summarizeImport(result);
  }

  dismiss(): void {
    this.message = null;
  }
}
