import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../../core/api/api.config';
import {
  AdminDashboard,
  BusinessDetail,
  BusinessListResponse,
  BusinessUser,
  BusinessUsersResponse,
  ContactRequest,
  ContactRequestListResponse,
  ContactRequestStatus,
  CreateBusinessPayload,
  CreateBusinessResponse,
} from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/admin`;

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.baseUrl}/dashboard`);
  }

  getBusinesses(search = '', isActive?: boolean): Observable<BusinessListResponse> {
    let params = new HttpParams().set('limit', 100);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    if (isActive !== undefined) {
      params = params.set('is_active', isActive);
    }
    return this.http.get<BusinessListResponse>(`${this.baseUrl}/businesses`, { params });
  }

  getBusiness(businessId: number): Observable<{ business: BusinessDetail }> {
    return this.http.get<{ business: BusinessDetail }>(`${this.baseUrl}/businesses/${businessId}`);
  }

  createBusiness(payload: CreateBusinessPayload): Observable<CreateBusinessResponse> {
    return this.http.post<CreateBusinessResponse>(`${this.baseUrl}/businesses`, payload);
  }

  updateBusiness(
    businessId: number,
    payload: Partial<{
      name: string;
      system_prompt: string;
      owner_phone: string | null;
      handoff_followup_cooldown_minutes: number;
      is_active: boolean;
    }>,
  ): Observable<{ business: BusinessDetail }> {
    return this.http.patch<{ business: BusinessDetail }>(
      `${this.baseUrl}/businesses/${businessId}`,
      payload,
    );
  }

  deactivateBusiness(businessId: number): Observable<{ business: BusinessDetail }> {
    return this.http.post<{ business: BusinessDetail }>(
      `${this.baseUrl}/businesses/${businessId}/deactivate`,
      {},
    );
  }

  getBusinessUsers(businessId: number): Observable<BusinessUsersResponse> {
    return this.http.get<BusinessUsersResponse>(`${this.baseUrl}/businesses/${businessId}/users`);
  }

  updateBusinessUser(
    userId: number,
    payload: Partial<Pick<BusinessUser, 'full_name' | 'is_active'>>,
  ): Observable<{ user: BusinessUser }> {
    return this.http.patch<{ user: BusinessUser }>(`${this.baseUrl}/business-users/${userId}`, payload);
  }

  resetBusinessUserPassword(userId: number): Observable<{ user: BusinessUser; invitation_sent: boolean }> {
    return this.http.post<{ user: BusinessUser; invitation_sent: boolean }>(
      `${this.baseUrl}/business-users/${userId}/reset-password`,
      {},
    );
  }

  getContactRequests(
    search = '',
    status?: ContactRequestStatus,
  ): Observable<ContactRequestListResponse> {
    let params = new HttpParams().set('limit', 100);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ContactRequestListResponse>(`${this.baseUrl}/contact-requests`, { params });
  }

  updateContactRequest(
    requestId: number,
    payload: Partial<Pick<ContactRequest, 'status' | 'internal_notes'>>,
  ): Observable<{ contact_request: ContactRequest }> {
    return this.http.patch<{ contact_request: ContactRequest }>(
      `${this.baseUrl}/contact-requests/${requestId}`,
      payload,
    );
  }
}
