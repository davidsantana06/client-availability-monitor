import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { StorageService } from '../../services/storage.service';
import { User, UsersInfo } from '../../models/users-info.model';
import { isEmail } from '../../validators/app-validators';

@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrl: './users-info.component.css',
})
export class UsersInfoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  readonly users$: Observable<UsersInfo> = this.storage.usersInfo$;
  form!: FormGroup;
  editingIndex: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, isEmail]],
    });
  }

  get isEditing(): boolean {
    return this.editingIndex !== null;
  }

  isInvalid(control: string): boolean {
    const target = this.form.get(control);
    return !!target && target.invalid && target.touched;
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

    const user: User = this.form.getRawValue();
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
}
