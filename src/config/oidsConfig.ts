import { UserManager, WebStorageStateStore, UserManagerSettings } from "oidc-client-ts";

const nhsAuthority = import.meta.env.VITE_OIDC_ISSUER || 'http://localhost:8000';


const oidcSettings: UserManagerSettings = {
    authority: nhsAuthority, // Use proxy to avoid CORS
    client_id: import.meta.env.VITE_CLIENT_ID || 'your-client-id',
    client_secret: import.meta.env.VITE_CLIENT_SECRET || 'your-client-secret',
    redirect_uri: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email nhsperson associatedorgs nationalrbacaccess professionalmemberships organisationalmemberships selectedrole',
    acr_values: 'AAL2_OR_AAL3_ANY',
    post_logout_redirect_uri: `${window.location.origin}/`,
    automaticSilentRenew: true,
    silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({
        store: window.localStorage
    }),
    // Explicitly define metadata to use proxied endpoints
    /*metadata: {
        issuer: 'http://localhost:8000',
        authorization_endpoint: 'http://localhost:8000/oauth2/authorize',
        token_endpoint: 'http://localhost:8000/oauth2/token',
        userinfo_endpoint: 'http://localhost:8000/userinfo',
        jwks_uri: 'http://localhost:8000/jwks',
    },*/

    metadata: {
        issuer: nhsAuthority,
        authorization_endpoint: `${nhsAuthority}/authorize`,
        token_endpoint: `${nhsAuthority}/access_token`,
        userinfo_endpoint: `${nhsAuthority}/userinfo`,
        end_session_endpoint: `${nhsAuthority}/connect/endSession`,
        jwks_uri: `${nhsAuthority}/connect/jwk_uri`,
    },

};

export const userManager = new UserManager(oidcSettings);

