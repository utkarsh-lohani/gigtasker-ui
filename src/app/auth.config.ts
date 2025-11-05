// src/app/auth.config.ts
import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
    // 1. The URL of your Keycloak "issuer"
    // (Go to your Realm settings in Keycloak -> Endpoints -> OpenID Endpoint Configuration)
    issuer: 'http://localhost:8180/realms/gigtasker',

    // 2. The URL Angular runs on
    redirectUri: 'http://localhost:4200',

    // 3. The "Client ID" you will create in Keycloak
    // We'll call it 'gigtasker-angular'
    clientId: 'gigtasker-angular',

    // 4. Standard OIDC scopes
    scope: 'openid profile email',

    // 5. Use the modern "Code Flow + PKCE"
    responseType: 'code',

    // 6. Good for debugging
    showDebugInformation: true,
};
