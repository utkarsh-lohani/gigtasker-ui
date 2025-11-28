import {
    ApplicationConfig,
    importProvidersFrom,
    inject,
    provideAppInitializer,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from './core/services/state/auth-service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideOAuthClient(),
        provideHttpClient(withInterceptors([authInterceptor])),
        importProvidersFrom([MatNativeDateModule]),
        provideAppInitializer(() => {
            const auth = inject(AuthService);
            return auth.initLoginFlow();
        })
    ],
};
