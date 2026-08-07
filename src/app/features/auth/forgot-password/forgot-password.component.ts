import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <p class="eyebrow">Recuperar acceso</p>
      <h1>Restablece tu contraseña</h1>
      <p class="help">Te enviaremos un enlace seguro al correo registrado.</p>

      @if (sent()) {
        <p class="success" role="status">
          Si el correo está registrado, recibirás instrucciones para continuar.
        </p>
        <a routerLink="/login">Volver al inicio de sesión</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Correo electrónico
            <input type="email" formControlName="email" autocomplete="email" />
          </label>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Enviando…' : 'Enviar enlace' }}
          </button>
        </form>
        <a routerLink="/login">Volver al inicio de sesión</a>
      }
    </section>
  `,
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth
      .requestPasswordReset(this.form.getRawValue().email)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.sent.set(true),
        error: () => this.error.set('No fue posible solicitar el enlace. Inténtalo nuevamente.'),
      });
  }
}
