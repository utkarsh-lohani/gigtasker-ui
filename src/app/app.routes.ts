import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/auth-guard';
import { TaskDetail } from './task-detail/task-detail';
import { Home } from './home/home';

export const routes: Routes = [
    {
        path: '',
        component: Home, // public home route
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
    },
    {
        path: 'tasks/:id',
        component: TaskDetail,
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
