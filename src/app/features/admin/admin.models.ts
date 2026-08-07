export interface AdminDashboard {
  active_businesses: number;
  inactive_businesses: number;
  conversations_today: number;
  conversations_week: number;
  pending_handoffs: number;
  recent_businesses: RecentBusiness[];
}

export interface RecentBusiness {
  id: number;
  name: string;
  is_active: boolean;
  last_message_at: string | null;
}

export interface BusinessSummary {
  id: number;
  name: string;
  owner_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface BusinessChannel {
  id: number;
  phone_number_id: string;
  waba_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BusinessDetail {
  id: number;
  name: string;
  system_prompt: string;
  owner_phone: string | null;
  handoff_followup_cooldown_mins: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channels: BusinessChannel[];
}

export interface BusinessUser {
  id: number;
  business_id: number;
  email: string;
  full_name: string;
  role: 'owner' | 'staff';
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  locked_until: string | null;
}

export interface BusinessListResponse {
  total: number;
  items: BusinessSummary[];
}

export interface BusinessUsersResponse {
  total: number;
  items: BusinessUser[];
}

export interface CreateBusinessPayload {
  name: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone?: string;
  phone_number_id?: string;
  waba_id?: string;
  handoff_followup_cooldown_minutes: number;
  system_prompt?: string;
}

export interface CreateBusinessResponse {
  business: BusinessDetail;
  owner: BusinessUser;
  channel: BusinessChannel | null;
  invitation_sent: boolean;
}
