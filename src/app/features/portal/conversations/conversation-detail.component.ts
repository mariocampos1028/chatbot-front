import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ConversationDetail } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-conversation-detail',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page-heading page-heading-actions">
      <div>
        <p class="eyebrow">Conversación</p>
        <h2>{{ conversation()?.display_name || conversation()?.customer_phone || 'Cliente' }}</h2>
        <p>{{ conversation()?.customer_phone }}</p>
      </div>
      <a class="secondary-link" routerLink="/portal/conversations">Volver al listado</a>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!conversation()) {
      <p class="loading">Cargando conversación…</p>
    } @else {
      @if (conversation()!.latest_handoff; as handoff) {
        <section class="panel handoff-panel">
          <div class="panel-title">
            <div>
              <p class="eyebrow">Escalamiento</p>
              <h3>{{ reasonLabel(handoff.reason) }}</h3>
              <p>{{ handoff.summary }}</p>
            </div>
            <span class="badge badge-inactive">{{ handoff.severity === 'critical' ? 'Crítico' : 'Alto' }}</span>
          </div>
          @if (handoff.resolved_at) {
            <p class="success">
              Resuelto por {{ handoff.resolved_by || 'un asesor' }} el
              {{ handoff.resolved_at | date: 'medium' }}.
              @if (handoff.resolution_note) { Nota: {{ handoff.resolution_note }} }
            </p>
          } @else {
            <p class="warning">El bot está pausado hasta que reactives esta conversación.</p>
          }
        </section>
      }

      @if (conversation()!.status === 'needs_human') {
        <section class="panel">
          <h3>Reactivar bot</h3>
          <p class="help">
            Confirma que ya atendiste al cliente. El siguiente mensaje volverá a ser respondido por el bot.
          </p>
          <label class="resolution-label">
            Nota de resolución <span>(opcional)</span>
            <textarea [(ngModel)]="resolutionNote" rows="3"></textarea>
          </label>
          <button class="primary-button" type="button" (click)="resume()" [disabled]="resuming()">
            {{ resuming() ? 'Reactivando…' : 'Reactivar bot' }}
          </button>
        </section>
      }

      <section class="panel chat-panel">
        <div class="panel-title">
          <div>
            <h3>Historial</h3>
            <p>Mensajes originales del cliente y del chatbot.</p>
          </div>
        </div>
        <div class="chat-history">
          @for (message of conversation()!.messages; track message.id) {
            <article class="chat-bubble" [class.from-assistant]="message.role === 'assistant'">
              <span>{{ message.role === 'assistant' ? 'Chatbot' : 'Cliente' }}</span>
              <p>{{ message.content }}</p>
              <time>{{ message.created_at | date: 'short' }}</time>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class ConversationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(PortalService);
  private readonly conversationId = Number(this.route.snapshot.paramMap.get('conversationId'));

  readonly conversation = signal<ConversationDetail | null>(null);
  readonly error = signal('');
  readonly resuming = signal(false);
  resolutionNote = '';

  constructor() {
    this.load();
  }

  load(): void {
    if (!Number.isInteger(this.conversationId) || this.conversationId < 1) {
      this.error.set('El identificador de conversación no es válido.');
      return;
    }
    this.error.set('');
    this.portalService.getConversation(this.conversationId).subscribe({
      next: ({ conversation }) => this.conversation.set(conversation),
      error: () => this.error.set('No fue posible cargar la conversación.'),
    });
  }

  resume(): void {
    if (this.resuming()) {
      return;
    }
    this.resuming.set(true);
    this.portalService.resumeConversation(this.conversationId, this.resolutionNote.trim()).subscribe({
      next: () => {
        this.resolutionNote = '';
        this.resuming.set(false);
        this.load();
      },
      error: (response: HttpErrorResponse) => {
        this.resuming.set(false);
        this.error.set(response.error?.detail ?? 'No fue posible reactivar el bot.');
      },
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
