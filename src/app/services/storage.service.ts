import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MonitorConfig } from '../models/monitor-config.model';
import { ServersPool } from '../models/servers-pool.model';
import { UsersInfo } from '../models/users-info.model';
import { MonitorList } from '../models/monitor-list.model';

const SEED_MONITOR_CONFIG: MonitorConfig = {
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

const SEED_SERVERS_POOL: ServersPool = [
  { hostname: 'google-dns', ip: '8.8.8.8', port: 53 },
  { hostname: 'cloudflare', dns: 'one.one.one.one', port: 443 },
  { hostname: 'example-web', dns: 'example.com', port: 443 },
  { hostname: 'unreachable', ip: '192.0.2.1', port: 9999 },
];

const SEED_USERS_INFO: UsersInfo = [
  { username: 'Admin Alice', email: 'alice@example.com' },
  { username: 'Admin Bob', email: 'bob@example.com' },
];

const SEED_MONITOR_LIST: MonitorList = ['google-dns', 'cloudflare', 'example-web', 'unreachable'];

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly monitorConfigSubject = new BehaviorSubject<MonitorConfig>(SEED_MONITOR_CONFIG);
  private readonly serversPoolSubject = new BehaviorSubject<ServersPool>(SEED_SERVERS_POOL);
  private readonly usersInfoSubject = new BehaviorSubject<UsersInfo>(SEED_USERS_INFO);
  private readonly monitorListSubject = new BehaviorSubject<MonitorList>(SEED_MONITOR_LIST);

  readonly monitorConfig$: Observable<MonitorConfig> = this.monitorConfigSubject.asObservable();
  readonly serversPool$: Observable<ServersPool> = this.serversPoolSubject.asObservable();
  readonly usersInfo$: Observable<UsersInfo> = this.usersInfoSubject.asObservable();
  readonly monitorList$: Observable<MonitorList> = this.monitorListSubject.asObservable();

  get monitorConfig(): MonitorConfig {
    return this.monitorConfigSubject.value;
  }

  get serversPool(): ServersPool {
    return this.serversPoolSubject.value;
  }

  get usersInfo(): UsersInfo {
    return this.usersInfoSubject.value;
  }

  get monitorList(): MonitorList {
    return this.monitorListSubject.value;
  }

  setMonitorConfig(value: MonitorConfig): void {
    this.monitorConfigSubject.next(value);
  }

  setServersPool(value: ServersPool): void {
    this.serversPoolSubject.next(value);
  }

  setUsersInfo(value: UsersInfo): void {
    this.usersInfoSubject.next(value);
  }

  setMonitorList(value: MonitorList): void {
    this.monitorListSubject.next(value);
  }
}
