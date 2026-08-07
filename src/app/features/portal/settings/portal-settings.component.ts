import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { PortalSettings } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-settings',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Tu negocio</p>
        <h2>Configuración</h2>
        <p>Define quién recibe las alertas y cada cuánto deseas recordatorios.</p>
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!settings()) {
      <p class="loading">Cargando configuración…</p>
    } @else {
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="save()">
        <label>
          Nombre del negocio
          <input formControlName="name" />
        </label>
        <label>
          Teléfono para alertas
          <input formControlName="ownerPhone" placeholder="573001234567" />
        </label>
        <label>
          Recordatorio cada cuántos minutos
          <input type="number" min="1" max="1440" formControlName="handoffCooldown" />
          <small>Te avisaremos nuevamente si el cliente continúa escribiendo y el caso sigue pendiente.</small>
        </label>
        @if (success()) {
          <p class="success full-width" role="status">{{ success() }}</p>
        }
        <button class="primary-button full-width" type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Guardando…' : 'Guardar configuración' }}
        </button>
      </form>
    }
  `,
})
export class PortalSettingsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly portalService = inject(PortalService);

  readonly settings = signal<PortalSettings | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly saving = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    ownerPhone: [''],
    handoffCooldown: [10, [Validators.required, Validators.min(1), Validators.max(1440)]],
  });

  constructor() {
    this.portalService.getSettings().subscribe({
      next: ({ settings }) => {
        this.settings.set(settings);
        this.form.setValue({
          name: settings.name,
          ownerPhone: settings.owner_phone ?? '',
          handoffCooldown: settings.handoff_followup_cooldown_mins,
        });
      },
      error: () => this.error.set('No fue posible cargar la configuración.'),
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.portalService
      .updateSettings({
        name: value.name.trim(),
        owner_phone: value.ownerPhone.trim() || null,
        handoff_followup_cooldown_minutes: value.handoffCooldown,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: ({ settings }) => {
          this.settings.set(settings);
          this.success.set('Configuración guardada correctamente.');
        },
        error: (response: HttpErrorResponse) =>
          this.error.set(response.error?.detail ?? 'No fue posible guardar la configuración.'),
      });
  }
}
