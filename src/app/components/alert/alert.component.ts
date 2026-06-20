import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AlertMessage } from '../../services/export.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input() message: AlertMessage | null = null;
  @Output() dismissed = new EventEmitter<void>();
}
