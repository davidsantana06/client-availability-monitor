import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MonitorConfigService } from '@app/services/monitor-config.service';
import {
  PORT_MAX_VALUE,
  PORT_MIN_VALUE,
  hasError,
  isEmailControl,
  isIntegerControl,
  isPortControl,
} from '@app/validators/app-validators';

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
  readonly service = inject(MonitorConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly hasError = hasError;
  readonly limits = LIMITS;
  form!: FormGroup;
  saved = false;
  failed = false;
  showPassword = false;

  ngOnInit(): void {
    const current = this.service.value;

    this.form = this.fb.group({
      smtp: this.fb.group({
        host: [current.smtp.host, [Validators.required, Validators.maxLength(LIMITS.hostMaxLength)]],
        port: [current.smtp.port, [Validators.required, isPortControl]],
        username: [
          current.smtp.username,
          [Validators.required, Validators.maxLength(LIMITS.usernameMaxLength)],
        ],
        password: [
          current.smtp.password,
          [Validators.required, Validators.maxLength(LIMITS.passwordMaxLength)],
        ],
        use_tls: [current.smtp.use_tls],
        from_address: [
          current.smtp.from_address,
          [Validators.required, isEmailControl, Validators.maxLength(LIMITS.emailMaxLength)],
        ],
      }),
      timing: this.fb.group({
        check_interval_in_seconds: [
          current.timing.check_interval_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.intervalMaxSeconds),
            isIntegerControl,
          ],
        ],
        check_timeout_in_seconds: [
          current.timing.check_timeout_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.timeoutMaxSeconds),
            isIntegerControl,
          ],
        ],
        notification_interval_in_seconds: [
          current.timing.notification_interval_in_seconds,
          [
            Validators.required,
            Validators.min(LIMITS.timingMinSeconds),
            Validators.max(LIMITS.intervalMaxSeconds),
            isIntegerControl,
          ],
        ],
      }),
      concurrency: this.fb.group({
        check_workers: [
          current.concurrency.check_workers,
          [
            Validators.required,
            Validators.min(LIMITS.workersMinValue),
            Validators.max(LIMITS.workersMaxValue),
            isIntegerControl,
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
    this.service.set({
      smtp: raw.smtp,
      timing: raw.timing,
      concurrency: raw.concurrency,
      paths: this.service.value.paths,
    });
    this.saved = true;
    this.failed = false;
  }

  reset(): void {
    this.form.reset(this.service.value);
    this.saved = false;
    this.failed = false;
  }
}
