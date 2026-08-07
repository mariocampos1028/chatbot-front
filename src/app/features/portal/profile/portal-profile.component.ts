import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { PortalProfile } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-profile',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Mi cuenta</p>
        <h2>Perfil y seguridad</h2>
        <p>Actualiza tu nombre o cambia la contraseña de acceso.</p>
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!profile()) {
      <p class="loading">Cargando perfil…</p>
    } @else {
      <form class="panel form-grid" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <div class="panel-title full-width">
          <div><h3>Datos personales</h3><p>Correo: {{ profile()!.email }}</p></div>
        </div>
        <label>
          Nombre completo
          <input formControlName="fullName" />
        </label>
        @if (profileSuccess()) { <p class="success full-width">{{ profileSuccess() }}</p> }
        <button class="primary-button full-width" type="submit" [disabled]="profileForm.invalid || profileSaving()">
          {{ profileSaving() ? 'Guardando…' : 'Guardar perfil' }}
        </button>
      </form>

      <form class="panel form-grid" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
        <div class="panel-title full-width">
          <div><h3>Cambiar contraseña</h3><p>Usa mínimo 8 caracteres, con letras y números.</p></div>
        </div>
        <label>
          Contraseña actual
          <input type="password" formControlName="currentPassword" autocomplete="current-password" />
        </label>
        <label>
          Nueva contraseña
          <input type="password" formControlName="password" autocomplete="new-password" />
        </label>
        <label>
          Confirmar nueva contraseña
          <input type="password" formControlName="passwordConfirmation" autocomplete="new-password" />
        </label>
        @if (passwordError()) { <p class="error full-width">{{ passwordError() }}</p> }
        @if (passwordSuccess()) { <p class="success full-width">{{ passwordSuccess() }}</p> }
        <button class="primary-button full-width" type="submit" [disabled]="passwordForm.invalid || passwordSaving()">
          {{ passwordSaving() ? 'Actualizando…' : 'Cambiar contraseña' }}
        </button>
      </form>
    }
  `,
})
export class PortalProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly portalService = inject(PortalService);
  private readonly authService = inject(AuthService);

  readonly profile = signal<PortalProfile | null>(null);
  readonly error = signal('');
  readonly profileSuccess = signal('');
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');
  readonly profileSaving = signal(false);
  readonly passwordSaving = signal(false);
  readonly profileForm = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
  });
  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.portalService.getProfile().subscribe({
      next: ({ profile }) => {
        this.profile.set(profile);
        this.profileForm.setValue({ fullName: profile.full_name });
      },
      error: () => this.error.set('No fue posible cargar tu perfil.'),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.profileSaving()) {
      return;
    }
    this.profileSaving.set(true);
    this.profileSuccess.set('');
    this.portalService
      .updateProfile(this.profileForm.getRawValue().fullName.trim())
      .pipe(finalize(() => this.profileSaving.set(false)))
      .subscribe({
        next: ({ profile }) => {
          this.profile.set(profile);
          this.authService.updateCurrentUser({ full_name: profile.full_name });
          this.profileSuccess.set('Perfil actualizado correctamente.');
        },
        error: (response: HttpErrorResponse) =>
          this.error.set(response.error?.detail ?? 'No fue posible guardar el perfil.'),
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordSaving()) {
      return;
    }
    const { currentPassword, password, passwordConfirmation } = this.passwordForm.getRawValue();
    if (password !== passwordConfirmation) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }
    this.passwordSaving.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.authService
      .changePassword(currentPassword, {
        password,
        password_confirmation: passwordConfirmation,
      })
      .pipe(finalize(() => this.passwordSaving.set(false)))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.passwordSuccess.set('Contraseña actualizada correctamente.');
        },
        error: (response: HttpErrorResponse) =>
          this.passwordError.set(response.error?.detail ?? 'No fue posible cambiar la contraseña.'),
      });
  }
}
