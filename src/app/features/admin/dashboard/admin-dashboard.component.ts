import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminDashboard } from '../admin.models';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Vista global</p>
        <h2>Resumen de la plataforma</h2>
        <p>Actividad de todos los negocios registrados.</p>
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!dashboard()) {
      <p class="loading">Cargando métricas…</p>
    } @else {
      <div class="metric-grid">
        <article class="metric-card">
          <span>Negocios activos</span>
          <strong>{{ dashboard()!.active_businesses }}</strong>
        </article>
        <article class="metric-card">
          <span>Negocios inactivos</span>
          <strong>{{ dashboard()!.inactive_businesses }}</strong>
        </article>
        <article class="metric-card">
          <span>Conversaciones hoy</span>
          <strong>{{ dashboard()!.conversations_today }}</strong>
        </article>
        <article class="metric-card">
          <span>Escalamientos pendientes</span>
          <strong [class.alert-number]="dashboard()!.pending_handoffs > 0">
            {{ dashboard()!.pending_handoffs }}
          </strong>
        </article>
      </div>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Actividad reciente</h3>
            <p>Negocios con mensajes recientes.</p>
          </div>
          <span>{{ dashboard()!.conversations_week }} conversaciones en los últimos 7 días</span>
        </div>

        @if (dashboard()!.recent_businesses.length === 0) {
          <p class="empty-state">Aún no hay actividad registrada.</p>
        } @else {
          <div class="activity-list">
            @for (business of dashboard()!.recent_businesses; track business.id) {
              <div class="activity-row">
                <div>
                  <strong>{{ business.name }}</strong>
                  <span [class.status-inactive]="!business.is_active">
                    {{ business.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <time>
                  {{ business.last_message_at ? (business.last_message_at | date: 'medium') : 'Sin mensajes' }}
                </time>
              </div>
            }
          </div>
        }
      </section>
    }
  `,
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);

  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.error.set('');
    this.adminService.getDashboard().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: () => this.error.set('No fue posible cargar las métricas globales.'),
    });
  }
}
