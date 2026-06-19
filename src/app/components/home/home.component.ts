import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ExportService, ImportMessage } from '../../services/export.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly exportService = inject(ExportService);
  private readonly router = inject(Router);

  message: ImportMessage | null = null;

  async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    const result = await this.exportService.importFiles(files);
    const hasIssues = result.unknown.length > 0 || result.failed.length > 0;
    if (hasIssues) {
      this.message = this.exportService.summarizeImport(result);
      return;
    }

    this.router.navigate(['/monitor-config']);
  }

  dismiss(): void {
    this.message = null;
  }
}
