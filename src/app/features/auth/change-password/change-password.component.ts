import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  template: `
    <section class="auth-card">
      <p class="eyebrow">Acción requerida</p>
      <h1>Cambia tu contraseña</h1>
      <p class="help">Debes crear una contraseña personal antes de entrar al panel.</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Contraseña actual
          <input type="password" formControlName="currentPassword" autocomplete="current-password" />
        </label>
        <label>
          Nueva contraseña
          <input type="password" formControlName="password" autocomplete="new-password" />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            formControlName="passwordConfirmation"
            autocomplete="new-password"
          />
        </label>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Guardando…' : 'Guardar contraseña' }}
        </button>
      </form>
    </section>
  `,
})
export class ChangePasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }
    const { currentPassword, password, passwordConfirmation } = this.form.getRawValue();
    if (password !== passwordConfirmation) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth
      .changePassword(currentPassword, {
        password,
        password_confirmation: passwordConfirmation,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (user) => {
          const destination = user.user_type === 'platform_admin' ? '/admin/dashboard' : '/portal/dashboard';
          void this.router.navigateByUrl(destination);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(response.error?.detail ?? 'No fue posible cambiar la contraseña.');
        },
      });
  }
}
