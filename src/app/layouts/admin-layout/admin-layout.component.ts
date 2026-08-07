import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/admin/dashboard">Chatbot Admin</a>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Resumen</a>
          <a routerLink="/admin/businesses" routerLinkActive="active">Negocios</a>
        </nav>
        <button class="logout" type="button" (click)="logout()">Cerrar sesión</button>
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
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
