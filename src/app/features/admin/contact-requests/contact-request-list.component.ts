import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../admin.service';
import { ContactRequest, ContactRequestStatus } from '../admin.models';

@Component({
  selector: 'app-contact-request-list',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Contactos del sitio web</p>
        <h2>Leads web</h2>
        <p>Solicitudes enviadas desde macafdigital.com.</p>
      </div>
    </section>

    <section class="panel">
      <div class="filter-bar">
        <input
          [(ngModel)]="search"
          (ngModelChange)="load()"
          placeholder="Buscar por nombre, negocio, correo o teléfono"
        />
        <select [(ngModel)]="selectedStatus" (ngModelChange)="load()">
          <option value="">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="closed">Cerrado</option>
          <option value="spam">Spam</option>
        </select>
      </div>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (loading()) {
        <p class="loading">Cargando solicitudes…</p>
      } @else if (!requests().length) {
        <p class="empty-state">Aún no hay solicitudes de contacto.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Interés</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Recibido</th>
              </tr>
            </thead>
            <tbody>
              @for (contact of requests(); track contact.id) {
                <tr>
                  <td>
                    <strong>{{ contact.full_name }}</strong>
                    <small>{{ contact.business_name || 'Sin negocio indicado' }}</small>
                    <small>{{ contact.email }}{{ contact.phone ? ' · ' + contact.phone : '' }}</small>
                  </td>
                  <td>{{ contact.service_interest }}</td>
                  <td class="message-preview" [title]="contact.message || ''">
                    {{ contact.message || 'Sin mensaje' }}
                  </td>
                  <td>
                    <select
                      [ngModel]="contact.status"
                      (ngModelChange)="changeStatus(contact, $event)"
                      aria-label="Estado de la solicitud"
                    >
                      <option value="new">Nuevo</option>
                      <option value="contacted">Contactado</option>
                      <option value="qualified">Calificado</option>
                      <option value="closed">Cerrado</option>
                      <option value="spam">Spam</option>
                    </select>
                  </td>
                  <td>{{ contact.created_at | date: 'medium' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class ContactRequestListComponent {
  private readonly adminService = inject(AdminService);

  readonly requests = signal<ContactRequest[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  search = '';
  selectedStatus: ContactRequestStatus | '' = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService
      .getContactRequests(this.search, this.selectedStatus || undefined)
      .subscribe({
        next: (response) => {
          this.requests.set(response.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible cargar las solicitudes.');
          this.loading.set(false);
        },
      });
  }

  changeStatus(contact: ContactRequest, status: ContactRequestStatus): void {
    this.adminService.updateContactRequest(contact.id, { status }).subscribe({
      next: ({ contact_request }) => {
        this.requests.update((items) =>
          items.map((item) => (item.id === contact_request.id ? contact_request : item)),
        );
      },
      error: () => this.error.set('No fue posible actualizar el estado de la solicitud.'),
    });
  }
}
