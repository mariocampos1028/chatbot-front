import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/portal/dashboard">Mi chatbot</a>
        <nav>
          <a routerLink="/portal/dashboard" routerLinkActive="active">Resumen</a>
          <a routerLink="/portal/conversations" routerLinkActive="active">Conversaciones</a>
          <a routerLink="/portal/handoffs" routerLinkActive="active">Escalamientos</a>
          <a routerLink="/portal/bot-settings" routerLinkActive="active">Configurar bot</a>
          <a routerLink="/portal/settings" routerLinkActive="active">Configuración</a>
          <a routerLink="/portal/channels" routerLinkActive="active">Canales WhatsApp</a>
          <a routerLink="/portal/profile" routerLinkActive="active">Mi cuenta</a>
        </nav>
        <button class="logout" type="button" (click)="logout()">Cerrar sesión</button>
      </aside>
      <main class="workspace">
        <header>
          <div>
            <p class="eyebrow">Panel del negocio</p>
            <h1>Hola, {{ auth.user()?.full_name }}</h1>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
})
export class PortalLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
