import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Handoff, HandoffReason } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-handoff-list',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Atención humana</p>
        <h2>Escalamientos</h2>
        <p>Casos que el chatbot envió para tu intervención.</p>
      </div>
    </section>

    <section class="panel">
      <div class="filter-bar">
        <select [(ngModel)]="stateFilter" (change)="load()" aria-label="Filtrar por estado">
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="resolved">Resueltos</option>
        </select>
        <select [(ngModel)]="reasonFilter" (change)="load()" aria-label="Filtrar por motivo">
          <option value="all">Todos los motivos</option>
          <option value="explicit_human_request">Solicitud humana</option>
          <option value="complaint">Queja</option>
          <option value="urgency">Urgencia</option>
        </select>
      </div>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="loading">Cargando escalamientos…</p>
      } @else if (handoffs().length === 0) {
        <p class="empty-state">No hay escalamientos para los filtros seleccionados.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cliente</th><th>Motivo</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              @for (handoff of handoffs(); track handoff.id) {
                <tr>
                  <td data-label="Cliente">
                    <strong>{{ handoff.display_name || handoff.customer_phone }}</strong>
                    <small>{{ handoff.summary }}</small>
                  </td>
                  <td data-label="Motivo">{{ reasonLabel(handoff.reason) }}</td>
                  <td data-label="Estado">
                    <span class="badge" [class.badge-inactive]="!handoff.resolved_at">
                      {{ handoff.resolved_at ? 'Resuelto' : 'Pendiente' }}
                    </span>
                  </td>
                  <td data-label="Fecha">{{ handoff.created_at | date: 'medium' }}</td>
                  <td data-label="Acciones"><a [routerLink]="['/portal/handoffs', handoff.id]">Ver detalle</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class HandoffListComponent {
  private readonly portalService = inject(PortalService);

  readonly handoffs = signal<Handoff[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  stateFilter = 'all';
  reasonFilter = 'all';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const state = this.stateFilter === 'all' ? undefined : (this.stateFilter as 'pending' | 'resolved');
    const reason = this.reasonFilter === 'all' ? undefined : (this.reasonFilter as HandoffReason);
    this.portalService.getHandoffs(state, reason).subscribe({
      next: (response) => {
        this.handoffs.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los escalamientos.');
        this.loading.set(false);
      },
    });
  }

  reasonLabel(reason: HandoffReason): string {
    return {
      explicit_human_request: 'Solicitud humana',
      complaint: 'Queja',
      urgency: 'Urgencia',
    }[reason];
  }
}
