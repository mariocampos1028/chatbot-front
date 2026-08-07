import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <p class="eyebrow">Panel de administración</p>
      <h1>Inicia sesión</h1>
      <p class="help">Accede a la administración de tu chatbot.</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Correo electrónico
          <input type="email" formControlName="email" autocomplete="email" />
        </label>
        <label>
          Contraseña
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>

      <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
    </section>
  `,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (user) => {
          const destination = user.must_change_password
            ? '/change-password'
            : user.user_type === 'platform_admin'
              ? '/admin/dashboard'
              : '/portal/dashboard';
          void this.router.navigateByUrl(destination);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(response.error?.detail ?? 'No fue posible iniciar sesión.');
        },
      });
  }
}
