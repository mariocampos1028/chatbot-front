export type UserType = 'platform_admin' | 'business_user';
export type BusinessRole = 'platform_admin' | 'owner' | 'staff';

export interface SessionUser {
  id: number;
  email: string;
  full_name: string;
  user_type: UserType;
  role: BusinessRole;
  business_id: number | null;
  must_change_password: boolean;
}

export interface AuthResponse {
  user: SessionUser;
}
