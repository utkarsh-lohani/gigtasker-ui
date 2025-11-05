import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(), // <-- THIS IS THE CORRECT FUNCTION
        provideRouter(routes),
        provideOAuthClient(),
        provideHttpClient(withInterceptors([authInterceptor])),
    ]
};
