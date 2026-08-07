import { Component, inject, signal } from '@angular/core';

import { PortalChannel } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-channels',
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">WhatsApp</p>
        <h2>Canales conectados</h2>
        <p>Estos datos son configurados por la plataforma y están disponibles en modo lectura.</p>
      </div>
    </section>

    <section class="panel">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (channels() === null) {
        <p class="loading">Cargando canales…</p>
      } @else if (channels()!.length === 0) {
        <p class="empty-state">No hay canales WhatsApp asociados a este negocio.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead><tr><th>Phone Number ID</th><th>WABA ID</th><th>Estado</th></tr></thead>
            <tbody>
              @for (channel of channels()!; track channel.id) {
                <tr>
                  <td>{{ channel.phone_number_id }}</td>
                  <td>{{ channel.waba_id || '—' }}</td>
                  <td>
                    <span class="badge" [class.badge-inactive]="!channel.is_active">
                      {{ channel.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class PortalChannelsComponent {
  private readonly portalService = inject(PortalService);

  readonly channels = signal<PortalChannel[] | null>(null);
  readonly error = signal('');

  constructor() {
    this.portalService.getChannels().subscribe({
      next: ({ channels }) => this.channels.set(channels),
      error: () => this.error.set('No fue posible cargar los canales.'),
    });
  }
}
