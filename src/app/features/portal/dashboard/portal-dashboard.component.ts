import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PortalDashboard } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-dashboard',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Resumen</p>
        <h2>Actividad de tu chatbot</h2>
        <p>Consulta conversaciones y casos que necesitan tu atención.</p>
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!dashboard()) {
      <p class="loading">Cargando resumen…</p>
    } @else {
      <div class="metric-grid">
        <article class="metric-card">
          <span>Conversaciones hoy</span>
          <strong>{{ dashboard()!.conversations_today }}</strong>
        </article>
        <article class="metric-card">
          <span>Mensajes este mes</span>
          <strong>{{ dashboard()!.messages_month }}</strong>
        </article>
        <article class="metric-card">
          <span>Escalamientos pendientes</span>
          <strong [class.alert-number]="dashboard()!.pending_handoffs > 0">
            {{ dashboard()!.pending_handoffs }}
          </strong>
        </article>
        <article class="metric-card">
          <span>Casos sin atención &gt; 30 min</span>
          <strong [class.alert-number]="dashboard()!.overdue_handoffs > 0">
            {{ dashboard()!.overdue_handoffs }}
          </strong>
        </article>
      </div>

      @if (dashboard()!.overdue_handoffs > 0) {
        <section class="warning">
          Hay casos escalados que llevan más de 30 minutos sin resolver.
          <a routerLink="/portal/handoffs">Revisar escalamientos</a>
        </section>
      }

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Conversaciones recientes</h3>
            <p>Las últimas interacciones de tus clientes.</p>
          </div>
          <a class="secondary-link" routerLink="/portal/conversations">Ver todas</a>
        </div>
        @if (dashboard()!.recent_conversations.length === 0) {
          <p class="empty-state">Aún no hay conversaciones registradas.</p>
        } @else {
          <div class="activity-list">
            @for (conversation of dashboard()!.recent_conversations; track conversation.id) {
              <a class="activity-row activity-link" [routerLink]="['/portal/conversations', conversation.id]">
                <div>
                  <strong>{{ conversation.display_name || conversation.customer_phone }}</strong>
                  <span>{{ conversation.last_message || 'Sin mensajes' }}</span>
                </div>
                <time>{{ conversation.last_message_at | date: 'medium' }}</time>
              </a>
            }
          </div>
        }
      </section>
    }
  `,
})
export class PortalDashboardComponent {
  private readonly portalService = inject(PortalService);

  readonly dashboard = signal<PortalDashboard | null>(null);
  readonly error = signal('');

  constructor() {
    this.portalService.getDashboard().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: () => this.error.set('No fue posible cargar el resumen del negocio.'),
    });
  }
}
