import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { LoginPage } from './login-page/login-page';
import { PersonalUserDashboard } from './personal-user-dashboard/personal-user-dashboard';
import { ServiceUserDashboard } from './service-user-dashboard/service-user-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Generalhome } from './home-page/generalhome/generalhome';
import { About } from './home-page/about/about';
import { Products } from './home-page/products/products';
import { Userdashboard } from './personal-user-dashboard/userdashboard/userdashboard';
import { Information } from './personal-user-dashboard/information/information';
import { Suerdashboard } from './service-user-dashboard/suerdashboard/suerdashboard';
import { VehicleInfo } from './service-user-dashboard/vehicle-info/vehicle-info';

export const routes: Routes = [
    {path:'',component:HomePage,children:[
        {path:'',component:Generalhome},
        {path:'about',component:About},
        {path:'products',component:Products}
    ]},
    {path:'login',component:LoginPage},
    {path:'personal-user',component:PersonalUserDashboard,children:[
        {path:'',component:Userdashboard},
        {path:'information',component:Information}
    ]},
    {path:'service-user',component:ServiceUserDashboard,children:[
        {path:'',component:Suerdashboard},
        {path:'vehicle-info',component:VehicleInfo}
    ]},
    {path:'admin-user',component:AdminDashboard}
];
