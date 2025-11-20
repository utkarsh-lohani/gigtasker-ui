import { Injectable, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../auth.config';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly oauthService = inject(OAuthService);

    // We use a Signal to hold the authentication state (Zoneless!)
    public isAuthenticated = signal(false);
    public isAdmin = signal(false);

    constructor() {
        // This tells the library to use our config
        this.oauthService.configure(authConfig);
    }

    // This is the "Ignition" method we run at startup
    public async initLoginFlow(): Promise<void> {
        // This loads the OIDC discovery document
        await this.oauthService.loadDiscoveryDocumentAndTryLogin();

        this.oauthService.setupAutomaticSilentRefresh();

        if (this.oauthService.hasValidAccessToken()) {
            // User is already logged in
            this.isAuthenticated.set(true);
            this.checkAdminRole(); // Check if User has Admin Role
        } else {
            // This is a "silent refresh" check
            this.oauthService.events.subscribe((e) => {
                if (e.type === 'token_received') {
                    this.isAuthenticated.set(true);
                    this.checkAdminRole(); // Check if User has Admin Role
                }
                if (e.type === 'token_refresh_error') {
                    console.error('[AuthService] Token Refresh Failed!', e);
                }
                if (e.type === 'session_terminated') {
                    console.warn('[AuthService] Session Terminated event received');
                }
            });
        }
    }

    public login(): void {
        // This redirects the user to the Keycloak login page
        this.oauthService.initCodeFlow();
    }

    public logout(): void {
        // 1. Get the ID Token (required by Keycloak for redirect)
        const idToken = this.oauthService.getIdToken();

        // 2. Get the logout endpoint from the discovery document
        const logoutUrl = this.oauthService.logoutUrl;

        // 3. Get your redirect URI (where you want to go after logout)
        const postLogoutRedirectUri = globalThis.location.origin; // http://localhost:4200

        if (idToken && logoutUrl) {
            // 4. Construct the OIDC-compliant URL manually
            const url = `${logoutUrl}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
                postLogoutRedirectUri
            )}`;

            // 5. Clear local state
            this.oauthService.logOut(true); // "true" means "no remote call", since we do it ourselves
            this.isAuthenticated.set(false);
            this.isAdmin.set(false);

            // 6. Redirect the browser
            globalThis.location.href = url;
        } else {
            // Fallback: Just clear local state if we can't notify Keycloak
            this.oauthService.logOut();
            this.isAuthenticated.set(false);
            this.isAdmin.set(false);
            globalThis.location.reload();
        }
    }

    public register(): void {
        // We will build the registration URL.

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

    public getUsername(): string {
        // 1. Get the claims (the "payload") from the ID token
        const claims = this.oauthService.getIdentityClaims();

        if (!claims) {
            console.error('AuthService: Cannot get username, claims are null.');
            return '';
        }

        // 2. Return the 'email' claim.
        //    We told our backend (notification-service) to use 'email'
        //    so we *must* use 'email' here.
        return (claims as any)['email'];
    }

    private checkAdminRole(): void {
        const token = this.oauthService.getAccessToken();
        if (!token) return;

        try {
            // Decode the token payload
            const decodedToken: any = jwtDecode(token);

            // Check for the "roles" array inside "realm_access"
            // This path is specific to Keycloak
            const realmManagementRoles = decodedToken.realm_access?.['roles'] || [];

            // Now we check this *new* array for our admin roles
            const hasAdminRole = realmManagementRoles.includes('ROLE_ADMIN');

            // Set our signal
            this.isAdmin.set(hasAdminRole);
        } catch (err) {
            console.error('Failed to decode token', err);
            this.isAdmin.set(false);
        }
    }
}
