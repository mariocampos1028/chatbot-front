import { Routes } from '@angular/router';

import {
  passwordChangeGuard,
  publicOnlyGuard,
  roleGuard,
} from './core/auth/auth.guards';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PortalLayoutComponent } from './layouts/portal-layout/portal-layout.component';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { BusinessCreateComponent } from './features/admin/businesses/business-create.component';
import { BusinessDetailComponent } from './features/admin/businesses/business-detail.component';
import { BusinessListComponent } from './features/admin/businesses/business-list.component';
import { ContactRequestListComponent } from './features/admin/contact-requests/contact-request-list.component';
import { PortalDashboardComponent } from './features/portal/dashboard/portal-dashboard.component';
import { ConversationDetailComponent } from './features/portal/conversations/conversation-detail.component';
import { ConversationListComponent } from './features/portal/conversations/conversation-list.component';
import { HandoffDetailComponent } from './features/portal/handoffs/handoff-detail.component';
import { HandoffListComponent } from './features/portal/handoffs/handoff-list.component';
import { PortalChannelsComponent } from './features/portal/channels/portal-channels.component';
import { BotSettingsComponent } from './features/portal/bot-settings/bot-settings.component';
import { PortalProfileComponent } from './features/portal/profile/portal-profile.component';
import { PortalSettingsComponent } from './features/portal/settings/portal-settings.component';
import { PagePlaceholderComponent } from './shared/components/page-placeholder/page-placeholder.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [publicOnlyGuard] },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [publicOnlyGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [passwordChangeGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard('platform_admin')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'businesses',
        component: BusinessListComponent,
      },
      {
        path: 'businesses/new',
        component: BusinessCreateComponent,
      },
      {
        path: 'businesses/:businessId',
        component: BusinessDetailComponent,
      },
      {
        path: 'contact-requests',
        component: ContactRequestListComponent,
      },
    ],
  },
  {
    path: 'portal',
    component: PortalLayoutComponent,
    canActivate: [roleGuard('business_user')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: PortalDashboardComponent,
      },
      {
        path: 'conversations',
        component: ConversationListComponent,
      },
      {
        path: 'conversations/:conversationId',
        component: ConversationDetailComponent,
      },
      {
        path: 'handoffs',
        component: HandoffListComponent,
      },
      {
        path: 'handoffs/:handoffId',
        component: HandoffDetailComponent,
      },
      {
        path: 'settings',
        component: PortalSettingsComponent,
      },
      {
        path: 'bot-settings',
        component: BotSettingsComponent,
      },
      {
        path: 'channels',
        component: PortalChannelsComponent,
      },
      {
        path: 'profile',
        component: PortalProfileComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
