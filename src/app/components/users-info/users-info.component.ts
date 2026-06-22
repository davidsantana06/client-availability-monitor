import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConfirmRequest } from '@app/components/confirm-dialog/confirm-dialog.component';
import { User } from '@app/models/users-info.model';
import { UsersInfoService } from '@app/services/users-info.service';
import { hasError, isEmailControl, isUniqueInControl } from '@app/validators/app-validators';

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
  readonly service = inject(UsersInfoService);

  readonly hasError = hasError;
  readonly limits = LIMITS;
  form!: FormGroup;
  editingIndex: number | null = null;
  removalIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(LIMITS.usernameMaxLength)]],
      email: [
        '',
        [
          Validators.required,
          isEmailControl,
          isUniqueInControl(() => this.otherEmails()),
          Validators.maxLength(LIMITS.emailMaxLength),
        ],
      ],
    });
  }

  get isEditing(): boolean {
    return this.editingIndex !== null;
  }

  get removalRequest(): ConfirmRequest | null {
    if (this.removalIndex === null) return null;

    const user = this.service.value[this.removalIndex];
    return {
      title: 'Remove user?',
      message: `"${user.username}" will be removed.`,
      confirmLabel: 'Remove',
    };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const user: User = { username: raw.username.trim(), email: raw.email.trim() };
    if (this.isEditing) this.service.updateOne(this.editingIndex!, user);
    else this.service.addOne(user);
    this.cancel();
  }

  reset(): void {
    if (this.isEditing) this.fillForm(this.service.value[this.editingIndex!]);
    else this.clearForm();
  }

  edit(index: number): void {
    this.fillForm(this.service.value[index]);
    this.editingIndex = index;
  }

  cancel(): void {
    this.clearForm();
    this.editingIndex = null;
  }

  remove(index: number): void {
    this.removalIndex = index;
  }

  confirmRemoval(): void {
    this.service.removeOne(this.removalIndex!);
    if (this.isEditing) this.cancel();
    this.removalIndex = null;
  }

  cancelRemoval(): void {
    this.removalIndex = null;
  }

  private fillForm(user: User): void {
    this.form.setValue({ username: user.username, email: user.email });
  }

  private clearForm(): void {
    this.form.reset({ username: '', email: '' });
  }

  private otherEmails(): string[] {
    return this.service.value
      .filter((_, index) => index !== this.editingIndex)
      .map((user) => user.email);
  }
}
