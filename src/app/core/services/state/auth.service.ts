import { Injectable, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../../auth.config';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError, firstValueFrom } from 'rxjs';
import { AuthApi } from '../api/auth-api';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly TOKEN_KEY = 'gigtasker_token';
    private readonly REFRESH_TOKEN_KEY = 'gigtasker_refresh_token';

    private readonly oauthService = inject(OAuthService);
    private readonly router = inject(Router);
    private readonly authApi = inject(AuthApi);

    public isAuthenticated = signal(false);
    public isAdmin = signal(false);
    public isDoneLoading = signal(false);

    constructor() {
        this.oauthService.configure(authConfig);
    }

    public async initLoginFlow(): Promise<void> {
        try {
            // 1. Check Local Token (Manual Flow)
            this.checkLocalToken();

            // 2. If valid, we are done!
            if (this.isAuthenticated()) {
                this.isDoneLoading.set(true);
                return;
            }

            // If access token is expired but refresh token exists, try to swap it NOW.
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                try {
                    await firstValueFrom(this.refreshAccessToken());
                    // If successful, saveToken() inside refreshAccessToken sets isAuthenticated=true
                    this.isDoneLoading.set(true);
                    return;
                } catch (err) {
                    console.warn('Startup refresh failed', err);
                    // Continue to OIDC check...
                }
            }

            // 4. Fallback: Check OIDC (Keycloak Redirect Flow)
            await this.oauthService.loadDiscoveryDocumentAndTryLogin();
            this.oauthService.setupAutomaticSilentRefresh();

            if (this.oauthService.hasValidAccessToken()) {
                this.isAuthenticated.set(true);
                this.checkAdminRole(this.oauthService.getAccessToken());
            }
        } catch (e) {
            console.error('Auth Init failed', e);
        } finally {
            this.isDoneLoading.set(true);
        }
    }

    // --- Token Management ---

    public saveToken(response: any): void {
        if (response.access_token) {
            localStorage.setItem(this.TOKEN_KEY, response.access_token);
        }
        if (response.refresh_token) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
        }
        // Re-check validity immediately
        this.checkLocalToken();
    }

    public checkLocalToken(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token && !this.isTokenExpired(token)) {
            this.isAuthenticated.set(true);
            this.checkAdminRole(token);
        } else {
            // Ensure state is false if expired (so initLoginFlow moves to refresh step)
            this.isAuthenticated.set(false);
        }
    }

    public getToken(): string | null {
        const localToken = localStorage.getItem(this.TOKEN_KEY);
        if (localToken) return localToken;
        return this.oauthService.getAccessToken();
    }

    public getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY) || this.oauthService.getRefreshToken();
    }

    // --- Unified Logout ---
    public logout(): void {
        // 1. Clear Manual Tokens
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);

        // 2. Check for OIDC Session
        const idToken = this.oauthService.getIdToken();
        const logoutUrl = this.oauthService.logoutUrl;

        // 3. Clear Local State
        this.oauthService.logOut(true);
        this.isAuthenticated.set(false);
        this.isAdmin.set(false);

        // 4. Redirect
        if (idToken && logoutUrl) {
            const postLogoutRedirectUri = globalThis.location.origin;
            const url = `${logoutUrl}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
                postLogoutRedirectUri
            )}`;
            globalThis.location.href = url;
        } else {
            this.router.navigate(['/login']);
        }
    }

    // --- Refresh Logic ---
    public refreshAccessToken(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.authApi.refreshToken(refreshToken).pipe(
            tap((response: any) => {
                this.saveToken(response);
                console.log('Token refreshed successfully');
            }),
            catchError((err) => {
                console.error('Refresh failed', err);
                this.logout(); // Logout if refresh fails
                return throwError(() => err);
            })
        );
    }

    // --- Helpers ---

    public getUsername(): string {
        const token = this.getToken();
        if (!token) return '';

        try {
            const decoded = jwtDecode<any>(token);
            return decoded.email ?? decoded.sub ?? '';
        } catch {
            // invalid/malformed token → treat as no username
            return '';
        }
    }

    private checkAdminRole(token?: string | null): void {
        const t = token ?? this.getToken();
        if (!t) {
            this.isAdmin.set(false);
            return;
        }
        try {
            const decoded = jwtDecode<any>(t);
            const roles = decoded.realm_access?.roles ?? [];
            this.isAdmin.set(roles.includes('ROLE_ADMIN'));
        } catch {
            this.isAdmin.set(false); // invalid or corrupted token
        }
    }

    private isTokenExpired(token: string): boolean {
        try {
            const decoded = jwtDecode<any>(token);

            if (!decoded.exp) return false; // no exp → treat as non-expiring

            return decoded.exp < Math.floor(Date.now() / 1000);
        } catch {
            // If token can't be decoded → treat as expired for safety
            return true;
        }
    }
}
