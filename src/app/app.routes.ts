import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/auth-guard';
import { TaskDetail } from './task-detail/task-detail';

export const routes: Routes = [
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'tasks/:id',
        component: TaskDetail,
        canActivate: [authGuard]
    }
];
