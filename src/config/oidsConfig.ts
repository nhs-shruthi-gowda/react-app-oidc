import { WebStorageStateStore, UserManagerSettings } from "oidc-client-ts";
import { createPrivateKeyJWTUserManager } from '../utils/jwtInterceptor';
import { PRIVATE_KEY_PEM as privateKeyPEM } from './privateKey';
const isDevelopment = import.meta.env.DEV;
const baseURL = 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare';
const clientID = import.meta.env.VITE_CLIENT_ID || '5249385045.ui-spike.e9100d89-684b-4aea-818b-3c99619046c1.apps';
const nhsAuthority = isDevelopment ? 'http://localhost:8000' : baseURL;
const privateKeyConfig = {
    kid: 'demo-key-1',
    algorithm: 'RS512' as const,
};

let discoveryConfig: any = null;
async function fetchOpenIDConfiguration(): Promise<any> {
    try {
        const discoveryURL = isDevelopment
            ? `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/.well-known/openid-configuration`
            : `${baseURL}/.well-known/openid-configuration`;
        const response = await fetch(discoveryURL);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const config = await response.json();
        console.log('Discovery loaded:', config);
        return config;
    } catch (error) {
        console.error('Discovery error:', error);
        return null;
    }
}
const configPromise = (async () => {
    try {
        discoveryConfig = await fetchOpenIDConfiguration();
    } catch (error) {
        console.error('Config error:', error);
    }
})();
const oidcSettings: UserManagerSettings = {
    authority: nhsAuthority,
    client_id: clientID,
    redirect_uri: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email nhsperson associatedorgs nationalrbacaccess professionalmemberships organisationalmemberships selectedrole',
    acr_values: 'AAL2_OR_AAL3_ANY',
    post_logout_redirect_uri: `${window.location.origin}/`,
    automaticSilentRenew: false,
    silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    metadata: {
        issuer: baseURL,
        authorization_endpoint: `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/authorize`,
        token_endpoint: `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/access_token`,
        userinfo_endpoint: `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/userinfo`,
        end_session_endpoint: `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/connect/endSession`,
        jwks_uri: `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/connect/jwk_uri`,
    },
};
// Create UserManager with Private Key JWT interceptor (monkey-patches fetch)
export const userManager = createPrivateKeyJWTUserManager(oidcSettings, privateKeyPEM, privateKeyConfig);
export async function initializeOIDC(): Promise<void> {
    await configPromise;
    if (discoveryConfig) {
        console.log('OIDC initialized with discovery');
        if (oidcSettings.metadata) {
            const proxyPath = '/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare';
            oidcSettings.metadata.issuer = discoveryConfig.issuer;
            oidcSettings.metadata.authorization_endpoint = isDevelopment ? `${nhsAuthority}${proxyPath}/authorize` : discoveryConfig.authorization_endpoint;
            oidcSettings.metadata.token_endpoint = isDevelopment ? `${nhsAuthority}${proxyPath}/access_token` : discoveryConfig.token_endpoint;
            oidcSettings.metadata.userinfo_endpoint = isDevelopment ? `${nhsAuthority}${proxyPath}/userinfo` : discoveryConfig.userinfo_endpoint;
            oidcSettings.metadata.jwks_uri = isDevelopment ? `${nhsAuthority}${proxyPath}/connect/jwk_uri` : discoveryConfig.jwks_uri;
            oidcSettings.metadata.end_session_endpoint = isDevelopment ? `${nhsAuthority}${proxyPath}/connect/endSession` : discoveryConfig.end_session_endpoint;
        }
    }
    console.log('Init complete. Key ready:', !!privateKeyPEM);
}
initializeOIDC().catch(console.error);
