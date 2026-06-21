import { Injectable, inject } from '@angular/core';

import { ArtifactStore } from './base/artifact-store';
import { ExportService } from './export.service';
import { User, UsersInfo } from '../models/users-info.model';
import { isUsersInfo } from '../validators/users-info.validators';

const FILENAME = 'users_info.json';

const SEED: UsersInfo = [
  { username: 'Admin Alice', email: 'alice@example.com' },
  { username: 'Admin Bob', email: 'bob@example.com' },
];

@Injectable({ providedIn: 'root' })
export class UsersInfoService extends ArtifactStore<UsersInfo> {
  private readonly download = inject(ExportService);
  readonly filename = FILENAME;

  constructor() {
    super(SEED);
  }

  protected parse(text: string): UsersInfo {
    const invalidMessage = 'The file is not a valid users list.';
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(invalidMessage);
    }
    if (!isUsersInfo(value)) throw new Error(invalidMessage);
    return value;
  }

  export(): void {
    this.download.downloadJson(FILENAME, this.value);
  }

  addOne(user: User): void {
    this.set([...this.value, user]);
  }

  updateOne(index: number, user: User): void {
    this.set(this.value.map((item, i) => (i === index ? user : item)));
  }

  removeOne(index: number): void {
    this.set(this.value.filter((_, i) => i !== index));
  }
}
