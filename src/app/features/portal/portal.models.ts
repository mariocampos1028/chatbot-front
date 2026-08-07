export type ConversationStatus = 'bot_active' | 'needs_human';
export type HandoffReason = 'explicit_human_request' | 'complaint' | 'urgency';

export interface ConversationSummary {
  id: number;
  customer_phone: string;
  display_name: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  last_message: string | null;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  whatsapp_message_id: string | null;
  created_at: string;
}

export interface HandoffNotification {
  id: number;
  kind: 'initial' | 'followup';
  content: string;
  status: 'pending' | 'sent' | 'failed';
  error_detail: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface Handoff {
  id: number;
  conversation_id: number;
  trigger_message_id?: number;
  reason: HandoffReason;
  severity: 'high' | 'critical';
  summary: string;
  customer_notified_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  customer_phone?: string;
  display_name?: string | null;
  notifications?: HandoffNotification[];
}

export interface ConversationDetail {
  id: number;
  business_id: number;
  customer_phone: string;
  display_name: string | null;
  status: ConversationStatus;
  created_at: string;
  last_message_at: string | null;
  messages: ChatMessage[];
  latest_handoff: Handoff | null;
}

export interface PortalDashboard {
  conversations_today: number;
  pending_handoffs: number;
  messages_month: number;
  overdue_handoffs: number;
  recent_conversations: ConversationSummary[];
}

export interface ConversationListResponse {
  total: number;
  items: ConversationSummary[];
}

export interface HandoffListResponse {
  total: number;
  items: Handoff[];
}

export interface PortalSettings {
  id: number;
  name: string;
  owner_phone: string | null;
  handoff_followup_cooldown_mins: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortalChannel {
  id: number;
  phone_number_id: string;
  waba_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PortalProfile {
  id: number;
  email: string;
  full_name: string;
  role: 'owner' | 'staff';
  business_id: number;
}

export type BotTone = 'formal' | 'cercano' | 'divertido';

export interface BotSettings {
  business_id: number;
  business_description: string;
  business_hours: string;
  tone: BotTone;
  prohibited_promises: string;
  escalation_rules: string;
  created_at: string;
  updated_at: string;
}

export interface BotServiceItem {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotFaq {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotConfiguration {
  settings: BotSettings;
  services: BotServiceItem[];
  faqs: BotFaq[];
}
