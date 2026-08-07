import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_URL } from '../api/api.config';
import { AuthResponse, SessionUser } from './auth.models';

interface LoginPayload {
  email: string;
  password: string;
}

interface PasswordPayload {
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<SessionUser | null>(null);
  readonly initialized = signal(false);
  readonly isAuthenticated = computed(() => this.user() !== null);

  login(payload: LoginPayload): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, payload)
      .pipe(map((response) => this.setUser(response.user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${API_URL}/auth/logout`, {}).pipe(
      tap(() => this.clearUser()),
      catchError(() => {
        this.clearUser();
        return of(undefined);
      }),
    );
  }

  restoreSession(): Observable<SessionUser | null> {
    return this.http.get<AuthResponse>(`${API_URL}/auth/me`).pipe(
      map((response) => this.setUser(response.user)),
      catchError(() => {
        this.clearUser();
        return of(null);
      }),
    );
  }

  ensureSession(): Observable<SessionUser | null> {
    return this.initialized() ? of(this.user()) : this.restoreSession();
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, payload: PasswordPayload): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/reset-password`, { token, ...payload })
      .pipe(map((response) => this.setUser(response.user)));
  }

  changePassword(currentPassword: string, payload: PasswordPayload): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/change-password`, {
        current_password: currentPassword,
        ...payload,
      })
      .pipe(map((response) => this.setUser(response.user)));
  }

  updateCurrentUser(changes: Partial<Pick<SessionUser, 'full_name'>>): void {
    this.user.update((user) => (user ? { ...user, ...changes } : user));
  }

  private setUser(user: SessionUser): SessionUser {
    this.user.set(user);
    this.initialized.set(true);
    return user;
  }

  private clearUser(): void {
    this.user.set(null);
    this.initialized.set(true);
  }
}
