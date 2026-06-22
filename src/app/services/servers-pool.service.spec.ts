import { TestBed } from '@angular/core/testing';

import { MonitorListService } from '@app/services/monitor-list.service';
import { ServersPoolService } from '@app/services/servers-pool.service';

describe('ServersPoolService', () => {
  let servers: ServersPoolService;
  let monitorList: MonitorListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servers = TestBed.inject(ServersPoolService);
    monitorList = TestBed.inject(MonitorListService);
  });

  const indexOf = (hostname: string) =>
    servers.value.findIndex((server) => server.hostname === hostname);

  describe('cascade to the monitor list', () => {
    it('renames the monitor list entry when a hostname changes', () => {
      servers.updateOne(indexOf('google-dns'), {
        hostname: 'google-dns-v2',
        ip: '8.8.8.8',
        port: 53,
      });

      expect(monitorList.value).toContain('google-dns-v2');
      expect(monitorList.value).not.toContain('google-dns');
    });

    it('leaves the monitor list untouched when the hostname is unchanged', () => {
      const before = [...monitorList.value];
      servers.updateOne(indexOf('cloudflare'), {
        hostname: 'cloudflare',
        dns: 'one.one.one.one',
        port: 8443,
      });

      expect(monitorList.value).toEqual(before);
    });

    it('deselects the hostname when a server is removed', () => {
      servers.removeOne(indexOf('example-web'));

      expect(monitorList.value).not.toContain('example-web');
    });

    it('does not enroll a newly added server', () => {
      servers.addOne({ hostname: 'new-host', ip: '10.0.0.1', port: 80 });

      expect(servers.value.some((server) => server.hostname === 'new-host')).toBeTrue();
      expect(monitorList.value).not.toContain('new-host');
    });
  });

  describe('import', () => {
    const file = (text: string) => new File([text], 'servers_pool.json');

    it('replaces the pool with a valid file', async () => {
      const pool = [{ hostname: 'host-a', ip: '1.1.1.1', port: 80 }];
      await servers.import(file(JSON.stringify(pool)));

      expect(servers.value).toEqual(pool);
    });

    it('rejects malformed JSON', async () => {
      await expectAsync(servers.import(file('{ not json'))).toBeRejectedWithError(
        'The file is not a valid servers pool.',
      );
    });

    it('rejects a server with both ip and dns', async () => {
      const pool = [{ hostname: 'host-a', ip: '1.1.1.1', dns: 'a.example.com', port: 80 }];
      await expectAsync(servers.import(file(JSON.stringify(pool)))).toBeRejected();
    });

    it('rejects duplicate hostnames ignoring case', async () => {
      const pool = [
        { hostname: 'dup', ip: '1.1.1.1', port: 80 },
        { hostname: 'DUP', dns: 'a.example.com', port: 81 },
      ];
      await expectAsync(servers.import(file(JSON.stringify(pool)))).toBeRejected();
    });
  });
});
