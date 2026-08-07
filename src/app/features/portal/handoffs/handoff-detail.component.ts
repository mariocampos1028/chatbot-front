import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Handoff } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-handoff-detail',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="page-heading page-heading-actions">
      <div>
        <p class="eyebrow">Escalamiento</p>
        <h2>{{ handoff()?.display_name || handoff()?.customer_phone || 'Caso' }}</h2>
        <p>{{ handoff()?.created_at | date: 'medium' }}</p>
      </div>
      <a class="secondary-link" routerLink="/portal/handoffs">Volver al listado</a>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!handoff()) {
      <p class="loading">Cargando escalamiento…</p>
    } @else {
      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>{{ reasonLabel(handoff()!.reason) }}</h3>
            <p>{{ handoff()!.summary }}</p>
          </div>
          <span class="badge" [class.badge-inactive]="!handoff()!.resolved_at">
            {{ handoff()!.resolved_at ? 'Resuelto' : 'Pendiente' }}
          </span>
        </div>
        <dl class="detail-list">
          <div><dt>Severidad</dt><dd>{{ handoff()!.severity === 'critical' ? 'Crítica' : 'Alta' }}</dd></div>
          <div><dt>Cliente notificado</dt><dd>{{ handoff()!.customer_notified_at | date: 'medium' }}</dd></div>
          <div><dt>Resuelto por</dt><dd>{{ handoff()!.resolved_by || 'Pendiente' }}</dd></div>
          @if (handoff()!.resolution_note) {
            <div><dt>Nota de resolución</dt><dd>{{ handoff()!.resolution_note }}</dd></div>
          }
        </dl>
        <a class="primary-link" [routerLink]="['/portal/conversations', handoff()!.conversation_id]">
          Ver conversación
        </a>
      </section>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Notificaciones enviadas</h3>
            <p>Alertas y seguimientos registrados para este caso.</p>
          </div>
        </div>
        @if (!handoff()!.notifications?.length) {
          <p class="empty-state">No hay notificaciones registradas.</p>
        } @else {
          <div class="activity-list">
            @for (notification of handoff()!.notifications!; track notification.id) {
              <div class="activity-row">
                <div>
                  <strong>{{ notification.kind === 'initial' ? 'Alerta inicial' : 'Seguimiento' }}</strong>
                  <span>{{ notification.content }}</span>
                </div>
                <time>{{ (notification.sent_at || notification.created_at) | date: 'medium' }}</time>
              </div>
            }
          </div>
        }
      </section>
    }
  `,
})
export class HandoffDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(PortalService);
  private readonly handoffId = Number(this.route.snapshot.paramMap.get('handoffId'));

  readonly handoff = signal<Handoff | null>(null);
  readonly error = signal('');

  constructor() {
    if (!Number.isInteger(this.handoffId) || this.handoffId < 1) {
      this.error.set('El identificador del escalamiento no es válido.');
      return;
    }
    this.portalService.getHandoff(this.handoffId).subscribe({
      next: ({ handoff }) => this.handoff.set(handoff),
      error: () => this.error.set('No fue posible cargar el escalamiento.'),
    });
  }

  reasonLabel(reason: string): string {
    return {
      explicit_human_request: 'Solicitud de atención humana',
      complaint: 'Queja del cliente',
      urgency: 'Caso urgente',
    }[reason] ?? 'Caso escalado';
  }
}
