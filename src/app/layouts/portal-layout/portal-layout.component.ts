import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/portal/dashboard">Mi chatbot</a>
        <button
          class="mobile-nav-toggle"
          type="button"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        >
          {{ menuOpen() ? 'Cerrar menú' : 'Menú' }}
        </button>
        <nav [class.mobile-open]="menuOpen()">
          <a routerLink="/portal/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)">Resumen</a>
          <a routerLink="/portal/conversations" routerLinkActive="active" (click)="menuOpen.set(false)">Conversaciones</a>
          <a routerLink="/portal/handoffs" routerLinkActive="active" (click)="menuOpen.set(false)">Escalamientos</a>
          <a routerLink="/portal/bot-settings" routerLinkActive="active" (click)="menuOpen.set(false)">Configurar bot</a>
          <a routerLink="/portal/settings" routerLinkActive="active" (click)="menuOpen.set(false)">Configuración</a>
          <a routerLink="/portal/channels" routerLinkActive="active" (click)="menuOpen.set(false)">Canales WhatsApp</a>
          <a routerLink="/portal/profile" routerLinkActive="active" (click)="menuOpen.set(false)">Mi cuenta</a>
        </nav>
        <button class="logout" [class.mobile-open]="menuOpen()" type="button" (click)="logout()">Cerrar sesión</button>
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
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
