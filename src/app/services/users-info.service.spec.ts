import { TestBed } from '@angular/core/testing';

import { UsersInfoService } from '@app/services/users-info.service';

describe('UsersInfoService', () => {
  let service: UsersInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersInfoService);
  });

  const file = (data: unknown) => new File([JSON.stringify(data)], 'users_info.json');

  describe('import', () => {
    it('replaces the users with a valid file', async () => {
      const users = [{ username: 'Carol', email: 'carol@example.com' }];
      await service.import(file(users));

      expect(service.value).toEqual(users);
    });

    it('rejects an invalid email', async () => {
      const users = [{ username: 'Carol', email: 'not-an-email' }];
      await expectAsync(service.import(file(users))).toBeRejected();
    });

    it('rejects duplicate emails ignoring case', async () => {
      const users = [
        { username: 'A', email: 'dup@example.com' },
        { username: 'B', email: 'DUP@EXAMPLE.COM' },
      ];
      await expectAsync(service.import(file(users))).toBeRejected();
    });
  });
});
