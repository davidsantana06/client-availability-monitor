import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StorageService } from '../../services/storage.service';
import { email, integer, port } from '../../validators/app-validators';

@Component({
  selector: 'app-monitor-config',
  templateUrl: './monitor-config.component.html',
  styleUrl: './monitor-config.component.css',
})
export class MonitorConfigComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;
  saved = false;
  failed = false;

  ngOnInit(): void {
    const config = this.storage.monitorConfig;

    this.form = this.fb.group({
      smtp: this.fb.group({
        host: [config.smtp.host, Validators.required],
        port: [config.smtp.port, [Validators.required, port]],
        username: [config.smtp.username, Validators.required],
        password: [config.smtp.password, Validators.required],
        use_tls: [config.smtp.use_tls],
        from_address: [config.smtp.from_address, [Validators.required, email]],
      }),
      timing: this.fb.group({
        check_interval_in_seconds: [
          config.timing.check_interval_in_seconds,
          [Validators.required, Validators.min(1), integer],
        ],
        check_timeout_in_seconds: [
          config.timing.check_timeout_in_seconds,
          [Validators.required, Validators.min(1), integer],
        ],
        notification_interval_in_seconds: [
          config.timing.notification_interval_in_seconds,
          [Validators.required, Validators.min(1), integer],
        ],
      }),
      concurrency: this.fb.group({
        check_workers: [
          config.concurrency.check_workers,
          [Validators.required, Validators.min(1), integer],
        ],
      }),
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.saved = false;
      this.failed = false;
    });
  }

  invalid(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && control.touched;
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
