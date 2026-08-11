import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { BusinessDetail, BusinessUser } from '../admin.models';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-business-detail',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-heading page-heading-actions">
      <div>
        <p class="eyebrow">Administración</p>
        <h2>{{ business()?.name ?? 'Negocio' }}</h2>
        <p>Configuración, canales y usuarios con acceso.</p>
      </div>
      <a class="secondary-link" routerLink="/admin/businesses">Volver al listado</a>
    </section>

    @if (invitationFailed()) {
      <p class="warning" role="alert">
        El negocio se creó, pero no fue posible entregar la invitación. Usa “Reenviar acceso”
        en el usuario Owner.
      </p>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!business()) {
      <p class="loading">Cargando negocio…</p>
    } @else {
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel-title full-width">
          <div>
            <h3>Configuración del negocio</h3>
            <p>Los cambios se aplican al siguiente mensaje procesado por el bot.</p>
          </div>
          <span class="badge" [class.badge-inactive]="!business()!.is_active">
            {{ business()!.is_active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <label>
          Nombre
          <input formControlName="name" />
        </label>
        <label>
          Teléfono para alertas
          <input formControlName="ownerPhone" />
        </label>
        <label>
          Minutos entre recordatorios
          <input type="number" min="1" max="1440" formControlName="handoffCooldown" />
        </label>
        <label class="full-width">
          System prompt
          <textarea formControlName="systemPrompt" rows="7"></textarea>
        </label>
        <div class="button-row full-width">
          <button class="primary-button" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
          </button>
          @if (business()!.is_active) {
            <button class="danger-button" type="button" (click)="deactivate()" [disabled]="saving()">
              Desactivar negocio
            </button>
          }
        </div>
      </form>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Canales de WhatsApp</h3>
            <p>Configurados por la plataforma.</p>
          </div>
        </div>
        @if (business()!.channels.length === 0) {
          <p class="empty-state">Este negocio todavía no tiene un canal asociado.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Phone Number ID</th><th>WABA ID</th><th>Estado</th></tr></thead>
              <tbody>
                @for (channel of business()!.channels; track channel.id) {
                  <tr>
                    <td data-label="Phone Number ID">{{ channel.phone_number_id }}</td>
                    <td data-label="WABA ID">{{ channel.waba_id ?? '—' }}</td>
                    <td data-label="Estado"><span class="badge" [class.badge-inactive]="!channel.is_active">{{ channel.is_active ? 'Activo' : 'Inactivo' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Usuarios del negocio</h3>
            <p>Reenvía un enlace si el cliente no pudo configurar su acceso.</p>
          </div>
        </div>
        @if (users().length === 0) {
          <p class="empty-state">No hay usuarios registrados.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Usuario</th><th>Estado</th><th>Último acceso</th><th></th></tr></thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td data-label="Usuario"><strong>{{ user.full_name }}</strong><small>{{ user.email }}</small></td>
                    <td data-label="Estado">
                      <span class="badge" [class.badge-inactive]="!user.is_active">
                        {{ user.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                      @if (user.must_change_password) { <small>Debe configurar contraseña</small> }
                    </td>
                    <td data-label="Último acceso">{{ user.last_login_at ? (user.last_login_at | date: 'medium') : 'Sin acceso' }}</td>
                    <td class="action-cell" data-label="Acciones">
                      <button class="text-button" type="button" (click)="resetAccess(user)">
                        Reenviar acceso
                      </button>
                      <button class="text-button" type="button" (click)="toggleUser(user)">
                        {{ user.is_active ? 'Desactivar' : 'Activar' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    }
  `,
})
export class BusinessDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly businessId = Number(this.route.snapshot.paramMap.get('businessId'));

  readonly business = signal<BusinessDetail | null>(null);
  readonly users = signal<BusinessUser[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly invitationFailed = signal(this.route.snapshot.queryParamMap.get('invitation') === 'failed');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    ownerPhone: [''],
    handoffCooldown: [10, [Validators.required, Validators.min(1), Validators.max(1440)]],
    systemPrompt: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  load(): void {
    if (!Number.isInteger(this.businessId) || this.businessId < 1) {
      this.error.set('El identificador del negocio no es válido.');
      return;
    }
    this.error.set('');
    this.adminService.getBusiness(this.businessId).subscribe({
      next: ({ business }) => {
        this.business.set(business);
        this.form.setValue({
          name: business.name,
          ownerPhone: business.owner_phone ?? '',
          handoffCooldown: business.handoff_followup_cooldown_mins,
          systemPrompt: business.system_prompt,
        });
      },
      error: () => this.error.set('No fue posible cargar el negocio.'),
    });
    this.loadUsers();
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.adminService
      .updateBusiness(this.businessId, {
        name: value.name.trim(),
        owner_phone: value.ownerPhone.trim() || null,
        handoff_followup_cooldown_minutes: value.handoffCooldown,
        system_prompt: value.systemPrompt.trim(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: ({ business }) => this.business.set(business),
        error: (response: HttpErrorResponse) =>
          this.error.set(response.error?.detail ?? 'No fue posible guardar los cambios.'),
      });
  }

  deactivate(): void {
    if (!confirm('¿Deseas desactivar este negocio? El historial se conservará.')) {
      return;
    }
    this.saving.set(true);
    this.adminService
      .deactivateBusiness(this.businessId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: ({ business }) => this.business.set(business),
        error: () => this.error.set('No fue posible desactivar el negocio.'),
      });
  }

  resetAccess(user: BusinessUser): void {
    this.adminService.resetBusinessUserPassword(user.id).subscribe({
      next: (response) => {
        this.replaceUser(response.user);
        if (!response.invitation_sent) {
          this.error.set('El acceso se reinició, pero no fue posible enviar el correo.');
        }
      },
      error: () => this.error.set('No fue posible reenviar el acceso.'),
    });
  }

  toggleUser(user: BusinessUser): void {
    this.adminService.updateBusinessUser(user.id, { is_active: !user.is_active }).subscribe({
      next: (response) => this.replaceUser(response.user),
      error: () => this.error.set('No fue posible actualizar el usuario.'),
    });
  }

  private loadUsers(): void {
    this.adminService.getBusinessUsers(this.businessId).subscribe({
      next: (response) => this.users.set(response.items),
      error: () => this.error.set('No fue posible cargar los usuarios del negocio.'),
    });
  }

  private replaceUser(updated: BusinessUser): void {
    this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
  }
}
