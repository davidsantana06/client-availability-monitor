import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StorageService } from '../../services/storage.service';
import {
  PORT_MAX_VALUE,
  PORT_MIN_VALUE,
  hasError,
  isEmail,
  isInteger,
  isPort,
} from '../../validators/app-validators';

const LIMITS = {
  hostMaxLength: 253,
  usernameMaxLength: 255,
  passwordMaxLength: 255,
  emailMaxLength: 254,
  portMinValue: PORT_MIN_VALUE,
  portMaxValue: PORT_MAX_VALUE,
  timingMinSeconds: 1,
  intervalMaxSeconds: 86_400,
  timeoutMaxSeconds: 3_600,
  workersMinValue: 1,
  workersMaxValue: 1_000,
} as const;

@Component({
  selector: 'app-monitor-config',
  templateUrl: './monitor-config.component.html',
})
export class MonitorConfigComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly hasError = hasError;
  readonly limits = LIMITS;
  form!: FormGroup;
  saved = false;
  failed = false;

  ngOnInit(): void {
    const config = this.storage.monitorConfig;

    this.form = this.fb.group({
      smtp: this.fb.group({
        host: [config.smtp.host, [Validators.required, Validators.maxLength(LIMITS.hostMaxLength)]],
        port: [config.smtp.port, [Validators.required, isPort]],
        username: [
          config.smtp.username,
          [Validators.required, Validators.maxLength(LIMITS.usernameMaxLength)],
        ],
        password: [
          config.smtp.password,
          [Validators.required, Validators.maxLength(LIMITS.passwordMaxLength)],
        ],
        use_tls: [config.smtp.use_tls],
        from_address: [
          config.smtp.from_address,
          [Validators.required, isEmail, Validators.maxLength(LIMITS.emailMaxLength)],
        ],
      }),
      timing: this.fb.group({
        check_interval_in_seconds: [
          config.timing.check_interval_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.intervalMaxSeconds),
            isInteger,
          ],
        ],
        check_timeout_in_seconds: [
          config.timing.check_timeout_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.timeoutMaxSeconds),
            isInteger,
          ],
        ],
        notification_interval_in_seconds: [
          config.timing.notification_interval_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.intervalMaxSeconds),
            isInteger,
          ],
        ],
      }),
      concurrency: this.fb.group({
        check_workers: [
          config.concurrency.check_workers,
          [
            Validators.required,
            Validators.min(LIMITS.workersMinValue),
            Validators.max(LIMITS.workersMaxValue),
            isInteger,
          ],
        ],
      }),
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.saved = false;
      this.failed = false;
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saved = false;
      this.failed = true;
      return;
    }

    const raw = this.form.getRawValue();
    this.storage.setMonitorConfig({
      smtp: raw.smtp,
      timing: raw.timing,
      concurrency: raw.concurrency,
      paths: this.storage.monitorConfig.paths,
    });
    this.saved = true;
    this.failed = false;
  }

  reset(): void {
    this.form.reset(this.storage.monitorConfig);
    this.saved = false;
    this.failed = false;
  }
}
