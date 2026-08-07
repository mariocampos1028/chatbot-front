import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../../core/api/api.config';
import {
  BotConfiguration,
  BotFaq,
  BotServiceItem,
  BotSettings,
  ConversationDetail,
  ConversationListResponse,
  ConversationStatus,
  Handoff,
  HandoffListResponse,
  HandoffReason,
  PortalChannel,
  PortalDashboard,
  PortalProfile,
  PortalSettings,
} from './portal.models';

@Injectable({ providedIn: 'root' })
export class PortalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/portal`;

  getDashboard(): Observable<PortalDashboard> {
    return this.http.get<PortalDashboard>(`${this.baseUrl}/dashboard`);
  }

  getConversations(
    search = '',
    status?: ConversationStatus,
  ): Observable<ConversationListResponse> {
    let params = new HttpParams().set('limit', 100);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ConversationListResponse>(`${this.baseUrl}/conversations`, { params });
  }

  getConversation(conversationId: number): Observable<{ conversation: ConversationDetail }> {
    return this.http.get<{ conversation: ConversationDetail }>(
      `${this.baseUrl}/conversations/${conversationId}`,
    );
  }

  resumeConversation(
    conversationId: number,
    resolutionNote: string,
  ): Observable<{ conversation: { id: number; status: ConversationStatus } }> {
    return this.http.post<{ conversation: { id: number; status: ConversationStatus } }>(
      `${this.baseUrl}/conversations/${conversationId}/resume`,
      { resolution_note: resolutionNote || null },
    );
  }

  getHandoffs(
    state?: 'pending' | 'resolved',
    reason?: HandoffReason,
  ): Observable<HandoffListResponse> {
    let params = new HttpParams().set('limit', 100);
    if (state) {
      params = params.set('state', state);
    }
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.get<HandoffListResponse>(`${this.baseUrl}/handoffs`, { params });
  }

  getHandoff(handoffId: number): Observable<{ handoff: Handoff }> {
    return this.http.get<{ handoff: Handoff }>(`${this.baseUrl}/handoffs/${handoffId}`);
  }

  getSettings(): Observable<{ settings: PortalSettings }> {
    return this.http.get<{ settings: PortalSettings }>(`${this.baseUrl}/settings`);
  }

  updateSettings(
    payload: Partial<{
      name: string;
      owner_phone: string | null;
      handoff_followup_cooldown_minutes: number;
    }>,
  ): Observable<{ settings: PortalSettings }> {
    return this.http.patch<{ settings: PortalSettings }>(`${this.baseUrl}/settings`, payload);
  }

  getChannels(): Observable<{ channels: PortalChannel[] }> {
    return this.http.get<{ channels: PortalChannel[] }>(`${this.baseUrl}/channels`);
  }

  getProfile(): Observable<{ profile: PortalProfile }> {
    return this.http.get<{ profile: PortalProfile }>(`${this.baseUrl}/profile`);
  }

  updateProfile(fullName: string): Observable<{ profile: PortalProfile }> {
    return this.http.patch<{ profile: PortalProfile }>(`${this.baseUrl}/profile`, {
      full_name: fullName,
    });
  }

  getBotConfiguration(): Observable<BotConfiguration> {
    return this.http.get<BotConfiguration>(`${this.baseUrl}/bot-settings`);
  }

  updateBotSettings(
    payload: Partial<
      Pick<
        BotSettings,
        'business_description' | 'business_hours' | 'tone' | 'prohibited_promises' | 'escalation_rules'
      >
    >,
  ): Observable<BotConfiguration> {
    return this.http.patch<BotConfiguration>(`${this.baseUrl}/bot-settings`, payload);
  }

  createBotService(payload: Pick<BotServiceItem, 'name' | 'description'>): Observable<{ service: BotServiceItem }> {
    return this.http.post<{ service: BotServiceItem }>(`${this.baseUrl}/services`, payload);
  }

  updateBotService(
    serviceId: number,
    payload: Partial<Pick<BotServiceItem, 'name' | 'description' | 'is_active'>>,
  ): Observable<{ service: BotServiceItem }> {
    return this.http.patch<{ service: BotServiceItem }>(`${this.baseUrl}/services/${serviceId}`, payload);
  }

  deleteBotService(serviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${serviceId}`);
  }

  createBotFaq(payload: Pick<BotFaq, 'question' | 'answer'>): Observable<{ faq: BotFaq }> {
    return this.http.post<{ faq: BotFaq }>(`${this.baseUrl}/faqs`, payload);
  }

  updateBotFaq(
    faqId: number,
    payload: Partial<Pick<BotFaq, 'question' | 'answer' | 'is_active'>>,
  ): Observable<{ faq: BotFaq }> {
    return this.http.patch<{ faq: BotFaq }>(`${this.baseUrl}/faqs/${faqId}`, payload);
  }

  deleteBotFaq(faqId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/faqs/${faqId}`);
  }
}
