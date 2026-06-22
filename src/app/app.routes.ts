import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login';
import { RegisterComponent } from './features/auth/register';
import { LayoutComponent } from './features/layout/layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ApplicationsListComponent } from './features/applications/applications-list';
import { authGuard } from './core/guards/auth';
import { noAuthGuard } from './core/guards/no-auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'applications', component: ApplicationsListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
