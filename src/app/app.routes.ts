import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';
import { PersonalUserDashboard } from './personal-user-dashboard/personal-user-dashboard';
import { ServiceUserDashboard } from './service-user-dashboard/service-user-dashboard';
import { Generalhome } from './home-page/generalhome/generalhome';
import { About } from './home-page/about/about';
import { Userdashboard } from './personal-user-dashboard/userdashboard/userdashboard';
import { Information } from './personal-user-dashboard/information/information';
import { Suerdashboard } from './service-user-dashboard/suerdashboard/suerdashboard';
import { VehicleInfo } from './service-user-dashboard/vehicle-info/vehicle-info';
import { Billing } from './service-user-dashboard/billing/billing';
import { Profilepage } from './profilepage/profilepage';
import { Contact } from './home-page/contact/contact';
import { Helpsupport } from './helpsupport/helpsupport';
import { NotFoundPage } from './not-found/not-found';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      { path: '', component: Generalhome },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: 'profile',
    component: Profilepage,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PERSONAL', 'SERVICE', 'ADMIN'] },
  },
  {
    path: 'personal-user-dashboard',
    component: PersonalUserDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PERSONAL'] },
    children: [
      { path: '', component: Userdashboard },
      { path: 'information', component: Information },
    ],
  },
  {
    path: 'service-user-dashboard',
    component: ServiceUserDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SERVICE'] },
    children: [
      { path: '', component: Suerdashboard },
      { path: 'vehicle-info', component: VehicleInfo },
      { path: 'billing', component: Billing },
    ],
  },
  { path: 'help-support', component: Helpsupport },
  { path: '404', component: NotFoundPage },
  { path: '**', redirectTo: '/404' },
];
