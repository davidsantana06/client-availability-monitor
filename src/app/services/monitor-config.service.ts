import { Injectable, inject } from '@angular/core';

import { ArtifactStore } from './base/artifact-store';
import { ExportService } from './export.service';
import { MonitorConfig } from '../models/monitor-config.model';
import { parseJson } from '../validators/app-validators';
import { isMonitorConfig } from '../validators/monitor-config.validators';

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
    servers_config_file: 'servers_pool.json',
    user_info_file: 'users_info.json',
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
    const value = parseJson(text);
    if (!isMonitorConfig(value)) throw new Error('The file is not a valid monitor configuration.');
    return value;
  }

  export(): void {
    this.download.downloadJson(FILENAME, this.value);
  }
}
