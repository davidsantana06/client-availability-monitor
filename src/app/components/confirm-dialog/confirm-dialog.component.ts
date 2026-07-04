import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent implements OnChanges, OnDestroy {
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  @Input() request: ConfirmRequest | null = null;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.request) this.cancelled.emit();
  }

  ngOnChanges(): void {
    if (this.request) this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    else this.renderer.removeStyle(this.document.body, 'overflow');
  }

  ngOnDestroy(): void {
    this.renderer.removeStyle(this.document.body, 'overflow');
  }
}
