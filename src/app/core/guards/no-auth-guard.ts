import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/state/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If user IS authenticated, kick them to Dashboard
    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
    }

    // If user is NOT authenticated, let them see the Login page
    return true;
};
