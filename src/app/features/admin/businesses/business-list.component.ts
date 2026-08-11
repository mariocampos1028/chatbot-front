import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BusinessSummary } from '../admin.models';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-business-list',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page-heading page-heading-actions">
      <div>
        <p class="eyebrow">Administración</p>
        <h2>Negocios</h2>
        <p>Gestiona los clientes y accesos de la plataforma.</p>
      </div>
      <a class="primary-link" routerLink="/admin/businesses/new">Nuevo negocio</a>
    </section>

    <section class="panel">
      <div class="filter-bar">
        <input
          [(ngModel)]="search"
          (keyup.enter)="load()"
          placeholder="Buscar por nombre"
          aria-label="Buscar negocio"
        />
        <select [(ngModel)]="activeFilter" (change)="load()" aria-label="Filtrar por estado">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button type="button" class="secondary-button" (click)="load()">Buscar</button>
      </div>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="loading">Cargando negocios…</p>
      } @else if (businesses().length === 0) {
        <p class="empty-state">No hay negocios que coincidan con el filtro.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Estado</th>
                <th>Último mensaje</th>
                <th>Fecha de alta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (business of businesses(); track business.id) {
                <tr>
                  <td data-label="Negocio">
                    <strong>{{ business.name }}</strong>
                    <small>{{ business.owner_phone ?? 'Sin teléfono de alertas' }}</small>
                  </td>
                  <td data-label="Estado">
                    <span class="badge" [class.badge-inactive]="!business.is_active">
                      {{ business.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td data-label="Último mensaje">{{ business.last_message_at ? (business.last_message_at | date: 'medium') : '—' }}</td>
                  <td data-label="Fecha de alta">{{ business.created_at | date: 'mediumDate' }}</td>
                  <td data-label="Acciones"><a [routerLink]="['/admin/businesses', business.id]">Gestionar</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class BusinessListComponent {
  private readonly adminService = inject(AdminService);

  readonly businesses = signal<BusinessSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  search = '';
  activeFilter = 'all';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const isActive =
      this.activeFilter === 'all' ? undefined : this.activeFilter === 'active';
    this.adminService.getBusinesses(this.search, isActive).subscribe({
      next: (response) => {
        this.businesses.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los negocios.');
        this.loading.set(false);
      },
    });
  }
}
