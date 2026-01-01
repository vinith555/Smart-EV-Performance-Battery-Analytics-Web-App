import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { LoginPage } from './login-page/login-page';
import { PersonalUserDashboard } from './personal-user-dashboard/personal-user-dashboard';
import { ServiceUserDashboard } from './service-user-dashboard/service-user-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [
    {path:'',component:HomePage},
    {path:'login',component:LoginPage},
    {path:'personal-user',component:PersonalUserDashboard},
    {path:'service-user',component:ServiceUserDashboard},
    {path:'admin-user',component:AdminDashboard}
];
