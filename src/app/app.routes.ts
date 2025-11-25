import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login-component/login-component').then((m) => m.LoginComponent),
        canActivate: [noAuthGuard],
    },
    {
        path: 'registration',
        loadComponent: () =>
            import('./auth/registration-component/registration-component').then((m) => m.RegistrationComponent),
        canActivate: [noAuthGuard],
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [authGuard],
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/admin').then((m) => m.AdminComponent),
        canActivate: [authGuard],
    },
    {
        path: 'tasks/:id',
        loadComponent: () => import('./task-detail/task-detail').then((m) => m.TaskDetail),
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
