import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { StorageService } from '../../services/storage.service';
import { User, UsersInfo } from '../../models/users-info.model';
import { hasError, isEmail, isUniqueIn } from '../../validators/app-validators';

const LIMITS = {
  usernameMaxLength: 120,
  emailMaxLength: 254,
} as const;

@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
})
export class UsersInfoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  readonly users$: Observable<UsersInfo> = this.storage.usersInfo$;
  readonly hasError = hasError;
  readonly limits = LIMITS;
  form!: FormGroup;
  editingIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(LIMITS.usernameMaxLength)]],
      email: [
        '',
        [
          Validators.required,
          isEmail,
          isUniqueIn(() => this.otherEmails()),
          Validators.maxLength(LIMITS.emailMaxLength),
        ],
      ],
    });
  }

  get isEditing(): boolean {
    return this.editingIndex !== null;
  }

  edit(index: number): void {
    const user = this.storage.usersInfo[index];
    this.form.setValue({ username: user.username, email: user.email });
    this.editingIndex = index;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const user: User = { username: raw.username.trim(), email: raw.email.trim() };
    const users = [...this.storage.usersInfo];
    if (this.isEditing) users[this.editingIndex!] = user;
    else users.push(user);
    this.storage.setUsersInfo(users);
    this.cancel();
  }

  cancel(): void {
    this.form.reset({ username: '', email: '' });
    this.editingIndex = null;
  }

  remove(index: number): void {
    this.storage.setUsersInfo(this.storage.usersInfo.filter((_, i) => i !== index));
    if (this.isEditing) this.cancel();
  }

  private otherEmails(): string[] {
    return this.storage.usersInfo
      .filter((_, index) => index !== this.editingIndex)
      .map((user) => user.email);
  }
}
