import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest,} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/state/auth.service';
import {BehaviorSubject, catchError, filter, switchMap, take, throwError} from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    let authReq = req;

    // Fix: Exclude Auth endpoints from token injection
    const isAuthEndpoint = req.url.includes('/api/auth/');

    if (token && req.url.includes('localhost:9090') && !isAuthEndpoint) {
        authReq = addToken(req, token);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
                    return throwError(() => error);
                }

                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    if (isRefreshing) {
        return refreshTokenSubject.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => {
                return next(addToken(request, token));
            })
        );
    } else {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshAccessToken().pipe(
            switchMap((response: any) => {
                isRefreshing = false;
                const newToken = response.access_token;
                refreshTokenSubject.next(newToken);
                return next(addToken(request, newToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
            })
        );
    }
}
