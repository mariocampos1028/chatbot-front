import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ConversationStatus, ConversationSummary } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-conversation-list',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Historial</p>
        <h2>Conversaciones</h2>
        <p>Revisa mensajes y los casos que requieren atención humana.</p>
      </div>
    </section>

    <section class="panel">
      <div class="filter-bar">
        <input
          [(ngModel)]="search"
          (keyup.enter)="load()"
          placeholder="Buscar por nombre o teléfono"
          aria-label="Buscar conversación"
        />
        <select [(ngModel)]="statusFilter" (change)="load()" aria-label="Filtrar por estado">
          <option value="all">Todos los estados</option>
          <option value="bot_active">Bot activo</option>
          <option value="needs_human">Requiere humano</option>
        </select>
        <button class="secondary-button" type="button" (click)="load()">Buscar</button>
      </div>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="loading">Cargando conversaciones…</p>
      } @else if (conversations().length === 0) {
        <p class="empty-state">No hay conversaciones que coincidan con el filtro.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Cliente</th><th>Último mensaje</th><th>Estado</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
              @for (conversation of conversations(); track conversation.id) {
                <tr>
                  <td data-label="Cliente">
                    <strong>{{ conversation.display_name || conversation.customer_phone }}</strong>
                    <small>{{ conversation.customer_phone }}</small>
                  </td>
                  <td class="message-preview" data-label="Último mensaje">{{ conversation.last_message || '—' }}</td>
                  <td data-label="Estado">
                    <span class="badge" [class.badge-inactive]="conversation.status === 'needs_human'">
                      {{ conversation.status === 'bot_active' ? 'Bot activo' : 'Requiere humano' }}
                    </span>
                  </td>
                  <td data-label="Fecha">{{ conversation.last_message_at | date: 'medium' }}</td>
                  <td data-label="Acciones"><a [routerLink]="['/portal/conversations', conversation.id]">Ver detalle</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class ConversationListComponent {
  private readonly portalService = inject(PortalService);

  readonly conversations = signal<ConversationSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  search = '';
  statusFilter = 'all';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const status = this.statusFilter === 'all' ? undefined : (this.statusFilter as ConversationStatus);
    this.portalService.getConversations(this.search, status).subscribe({
      next: (response) => {
        this.conversations.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar las conversaciones.');
        this.loading.set(false);
      },
    });
  }
}
