import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, throwError, tap } from 'rxjs'; // <-- Import tap

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    let authReq = req;
    // Check if we are calling our own backend
    if (token && req.url.startsWith('http://localhost:9090')) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }

    return next(authReq).pipe(
        // Spy on the response
        tap({
            next: () => {},
            error: (error: HttpErrorResponse) => {
                if (error.status === 401 || error.status === 403) {
                    console.error(
                        `[AuthInterceptor] Security Error on ${req.url}:`,
                        error.status
                    );
                }
                if (error.status === 503) {
                    console.error(`[AuthInterceptor] Backend Down on ${req.url}`);
                }
            },
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.warn('[AuthInterceptor] 401 Unauthorized. Triggering Logout...');
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};
