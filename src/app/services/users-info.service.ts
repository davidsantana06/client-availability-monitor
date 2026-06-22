import { Injectable, inject } from '@angular/core';

import { User, UsersInfo } from '@app/models/users-info.model';
import { ArtifactStore } from '@app/services/base/artifact-store';
import { isUsersInfo } from '@app/validators/users-info.validators';

import { ExportService } from '@app/services/export.service';

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
