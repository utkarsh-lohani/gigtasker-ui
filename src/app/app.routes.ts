import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login-component/login-component').then((m) => m.LoginComponent),
    },
    {
        path: 'registration',
        loadComponent: () =>
            import('./auth/registration-component/registration-component').then((m) => m.RegistrationComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./dashboard/dashboard')
                .then((m) => m.Dashboard),
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
        redirectTo: 'login',
    },
];
