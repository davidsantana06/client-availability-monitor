import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { Artifact, ExportService, FILENAMES, ImportMessage } from '../../services/export.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  private readonly exportService = inject(ExportService);

  @Input() title = '';
  @Input() artifact!: Artifact;
  @Output() imported = new EventEmitter<void>();

  message: ImportMessage | null = null;

  get filename(): string {
    return FILENAMES[this.artifact];
  }

  get accept(): string {
    return this.filename.slice(this.filename.lastIndexOf('.'));
  }

  get importTooltip(): string {
    return `Import a ${this.filename} file`;
  }

  get exportTooltip(): string {
    return `Export ${this.filename}`;
  }

  async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    try {
      await this.exportService.importAs(this.artifact, file);
      this.message = { type: 'success', lines: [`Imported ${this.filename}.`] };
      this.imported.emit();
    } catch {
      this.message = { type: 'danger', lines: [`Failed to parse ${file.name}.`] };
    }
  }

  export(): void {
    this.exportService.exportArtifact(this.artifact);
  }

  dismiss(): void {
    this.message = null;
  }
}
