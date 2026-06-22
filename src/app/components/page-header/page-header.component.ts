import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AlertMessage } from '@app/components/alert/alert.component';
import { ArtifactIo } from '@app/services/contract/artifact-io';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() io!: ArtifactIo;
  @Output() imported = new EventEmitter<void>();

  message: AlertMessage | null = null;

  get filename(): string {
    return this.io.filename;
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

    if (file.name !== this.filename) {
      this.message = { type: 'danger', lines: [`Choose a file named ${this.filename}.`] };
      return;
    }

    try {
      await this.io.import(file);
      this.message = { type: 'success', lines: [`Imported ${this.filename}.`] };
      this.imported.emit();
    } catch (error) {
      const reason = error instanceof Error ? error.message : `Could not import ${file.name}.`;
      this.message = { type: 'danger', lines: [reason] };
    }
  }

  export(): void {
    this.io.export();
  }
}
