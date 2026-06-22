import { TestBed } from '@angular/core/testing';

import { MonitorConfigService } from '@app/services/monitor-config.service';

describe('MonitorConfigService', () => {
  let service: MonitorConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitorConfigService);
  });

  const file = (data: unknown) => new File([JSON.stringify(data)], 'monitor_config.json');

  const validConfig = () => ({
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      username: 'monitor',
      password: 'secret',
      use_tls: true,
      from_address: 'monitor@example.com',
    },
    timing: {
      check_interval_in_seconds: 60,
      check_timeout_in_seconds: 3,
      notification_interval_in_seconds: 300,
    },
    concurrency: { check_workers: 10 },
    paths: {
      servers_config_file: 'servers_pool.json',
      user_info_file: 'users_info.json',
      logs_folder: 'logs',
    },
  });

  describe('import', () => {
    it('replaces the config with a valid file', async () => {
      const config = validConfig();
      await service.import(file(config));

      expect(service.value).toEqual(config);
    });

    it('rejects a config missing a section', async () => {
      const { timing, ...withoutTiming } = validConfig();
      await expectAsync(service.import(file(withoutTiming))).toBeRejected();
    });

    it('rejects an out-of-range smtp port', async () => {
      const config = validConfig();
      config.smtp.port = 70000;
      await expectAsync(service.import(file(config))).toBeRejected();
    });
  });
});
