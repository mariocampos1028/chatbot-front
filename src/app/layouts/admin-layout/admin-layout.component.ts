import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/admin/dashboard">Chatbot Admin</a>
        <button
          class="mobile-nav-toggle"
          type="button"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        >
          {{ menuOpen() ? 'Cerrar menú' : 'Menú' }}
        </button>
        <nav [class.mobile-open]="menuOpen()">
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)">Resumen</a>
          <a routerLink="/admin/businesses" routerLinkActive="active" (click)="menuOpen.set(false)">Negocios</a>
          <a routerLink="/admin/contact-requests" routerLinkActive="active" (click)="menuOpen.set(false)">Leads web</a>
        </nav>
        <button class="logout" [class.mobile-open]="menuOpen()" type="button" (click)="logout()">Cerrar sesión</button>
      </aside>
      <main class="workspace">
        <header>
          <div>
            <p class="eyebrow">Super Admin</p>
            <h1>Hola, {{ auth.user()?.full_name }}</h1>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
