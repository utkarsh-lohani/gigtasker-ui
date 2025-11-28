import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/state/auth-service';

export const noAuthGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated()) {
        const last = auth.lastRoute;
        return router.createUrlTree([last || '/dashboard']);
    }

    return true;
};
