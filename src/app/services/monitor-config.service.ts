import { Injectable, inject } from '@angular/core';

import { MonitorConfig } from '@app/models/monitor-config.model';
import { ArtifactStore } from '@app/services/base/artifact-store';
import { isMonitorConfig } from '@app/validators/monitor-config.validators';

import { ExportService } from '@app/services/export.service';

const FILENAME = 'monitor_config.json';

const SEED: MonitorConfig = {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'monitor@example.com',
    password: 'replace-with-app-password',
    use_tls: true,
    from_address: 'monitor@example.com',
  },
  timing: {
    check_interval_in_seconds: 60,
    check_timeout_in_seconds: 3,
    notification_interval_in_seconds: 300,
  },
  concurrency: {
    check_workers: 10,
  },
  paths: {
    servers_pool_file: 'servers_pool.json',
    users_info_file: 'users_info.json',
    logs_folder: 'logs',
  },
};

@Injectable({ providedIn: 'root' })
export class MonitorConfigService extends ArtifactStore<MonitorConfig> {
  private readonly download = inject(ExportService);
  readonly filename = FILENAME;

  constructor() {
    super(SEED);
  }

  protected parse(text: string): MonitorConfig {
    const invalidMessage = 'The file is not a valid monitor configuration.';
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(invalidMessage);
    }
    if (!isMonitorConfig(value)) throw new Error(invalidMessage);
    return value;
  }

  export(): void {
    this.download.downloadJson(FILENAME, this.value);
  }
}
