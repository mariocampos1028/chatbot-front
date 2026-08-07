import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <p class="eyebrow">Configura tu acceso</p>
      <h1>Crea tu contraseña</h1>

      @if (!token) {
        <p class="error" role="alert">El enlace no contiene un token válido.</p>
        <a routerLink="/forgot-password">Solicitar un enlace nuevo</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
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
          <p class="help">Usa mínimo 8 caracteres, incluyendo letras y números.</p>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Guardando…' : 'Guardar contraseña' }}
          </button>
        </form>
      }
    </section>
  `,
})
export class ResetPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly token = this.route.snapshot.queryParamMap.get('token');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (!this.token || this.form.invalid || this.loading()) {
      return;
    }
    const { password, passwordConfirmation } = this.form.getRawValue();
    if (password !== passwordConfirmation) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth
      .resetPassword(this.token, {
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
          this.error.set(response.error?.detail ?? 'No fue posible actualizar la contraseña.');
        },
      });
  }
}
