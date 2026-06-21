import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface AlertMessage {
  type: 'success' | 'danger';
  lines: string[];
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input() message: AlertMessage | null = null;
  @Output() dismissed = new EventEmitter<void>();
}
