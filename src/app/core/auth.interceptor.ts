import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // We only want to attach tokens for our *own* API
    const isApiRequest = req.url.startsWith('http://localhost:9090');

    if (token && isApiRequest) {
        // Clone the request and add the Authorization header
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
        return next(authReq);
    }

    // For all other requests (or if not logged in), just pass it along
    return next(req);
};
