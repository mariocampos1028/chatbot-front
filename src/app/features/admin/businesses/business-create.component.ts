import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CreateBusinessPayload } from '../admin.models';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-business-create',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-heading page-heading-actions">
      <div>
        <p class="eyebrow">Nuevo cliente</p>
        <h2>Crear negocio</h2>
        <p>Se creará el negocio, su Owner y una invitación de acceso por correo.</p>
      </div>
      <a class="secondary-link" routerLink="/admin/businesses">Cancelar</a>
    </section>

    <form class="panel form-grid" [formGroup]="form" (ngSubmit)="submit()">
      <h3>Datos del negocio</h3>
      <label>
        Nombre del negocio
        <input formControlName="name" />
      </label>
      <label>
        Teléfono para alertas
        <input formControlName="ownerPhone" placeholder="573001234567" />
      </label>
      <label class="full-width">
        Instrucciones iniciales del bot <span>(opcional)</span>
        <textarea formControlName="systemPrompt" rows="4"></textarea>
      </label>

      <h3>Usuario Owner</h3>
      <label>
        Nombre completo
        <input formControlName="ownerFullName" />
      </label>
      <label>
        Correo electrónico
        <input type="email" formControlName="ownerEmail" />
      </label>

      <h3>Canal WhatsApp <span>(opcional)</span></h3>
      <label>
        Phone Number ID
        <input formControlName="phoneNumberId" />
      </label>
      <label>
        WABA ID
        <input formControlName="wabaId" />
      </label>
      <label>
        Minutos entre recordatorios
        <input type="number" min="1" max="1440" formControlName="handoffCooldown" />
      </label>

      @if (error()) {
        <p class="error full-width" role="alert">{{ error() }}</p>
      }
      <button class="primary-button full-width" type="submit" [disabled]="form.invalid || saving()">
        {{ saving() ? 'Creando…' : 'Crear negocio e invitar Owner' }}
      </button>
    </form>
  `,
})
export class BusinessCreateComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    ownerPhone: [''],
    systemPrompt: [''],
    ownerFullName: ['', Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
    phoneNumberId: [''],
    wabaId: [''],
    handoffCooldown: [10, [Validators.required, Validators.min(1), Validators.max(1440)]],
  });

  submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    const value = this.form.getRawValue();
    const payload: CreateBusinessPayload = {
      name: value.name.trim(),
      owner_full_name: value.ownerFullName.trim(),
      owner_email: value.ownerEmail.trim(),
      handoff_followup_cooldown_minutes: value.handoffCooldown,
    };
    this.assignIfPresent(payload, 'owner_phone', value.ownerPhone);
    this.assignIfPresent(payload, 'system_prompt', value.systemPrompt);
    this.assignIfPresent(payload, 'phone_number_id', value.phoneNumberId);
    this.assignIfPresent(payload, 'waba_id', value.wabaId);

    this.saving.set(true);
    this.error.set('');
    this.adminService
      .createBusiness(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          const message = response.invitation_sent
            ? ''
            : '?invitation=failed';
          void this.router.navigateByUrl(`/admin/businesses/${response.business.id}${message}`);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(response.error?.detail ?? 'No fue posible crear el negocio.');
        },
      });
  }

  private assignIfPresent(
    target: CreateBusinessPayload,
    key: 'owner_phone' | 'system_prompt' | 'phone_number_id' | 'waba_id',
    value: string,
  ): void {
    const normalized = value.trim();
    if (normalized) {
      target[key] = normalized;
    }
  }
}
