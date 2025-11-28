import {ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {MatNativeDateModule} from '@angular/material/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideOAuthClient(),
        provideHttpClient(withInterceptors([authInterceptor])),
        importProvidersFrom([MatNativeDateModule])
    ]
};
