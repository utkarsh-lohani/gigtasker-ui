import { Injectable, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../auth.config';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly oauthService = inject(OAuthService);

    // We use a Signal to hold the authentication state (Zoneless!)
    public isAuthenticated = signal(false);

    constructor() {
        // This tells the library to use our config
        this.oauthService.configure(authConfig);
    }

    // This is the "Ignition" method we run at startup
    public async initLoginFlow(): Promise<void> {
        // This loads the OIDC discovery document
        await this.oauthService.loadDiscoveryDocumentAndTryLogin();

        if (this.oauthService.hasValidAccessToken()) {
            // User is already logged in
            this.isAuthenticated.set(true);
        } else {
            // This is a "silent refresh" check
            this.oauthService.events.subscribe((e) => {
                if (e.type === 'token_received') {
                    this.isAuthenticated.set(true);
                }
            });
        }
    }

    public login(): void {
        // This redirects the user to the Keycloak login page
        this.oauthService.initCodeFlow();
    }

    public logout(): void {
        this.oauthService.logOut();
        this.isAuthenticated.set(false);
    }

    public register(): void {
        // We will build the registration URL ourselves.

        // 1. Guard against missing config
        const clientId = this.oauthService.clientId;
        const redirectUri = this.oauthService.redirectUri;
        const issuer = this.oauthService.issuer;

        if (!clientId || !redirectUri || !issuer) {
            console.error('AuthService is not properly configured.');
            return;
        }

        // 2. Build the URL
        // Keycloak's official registration endpoint is always at this path
        const registrationEndpoint = `${issuer}/protocol/openid-connect/registrations`;

        // 3. Encode the parts for a URL
        const encRedirectUri = encodeURIComponent(redirectUri);
        const encClientId = encodeURIComponent(clientId);

        // 4. Redirect the user. This bypasses all of my buggy
        //    "discovery" code and just *works*.
        globalThis.location.href = `${registrationEndpoint}?client_id=${encClientId}&redirect_uri=${encRedirectUri}&response_type=code&scope=openid`;
    }

    public getToken(): string {
        return this.oauthService.getAccessToken();
    }
}
