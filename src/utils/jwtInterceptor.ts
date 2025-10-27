import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { createPrivateKeyJWT } from './jwtUtils';

/**
 * Monkey-patch fetch to intercept token requests and add Private Key JWT
 */
function createPrivateKeyJWTInterceptor(
    clientId: string,
    privateKeyPEM: string,
    keyConfig: { kid: string; algorithm: string }
) {
    const originalFetch = window.fetch;

    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        // Check if this is a token request
        if (url.includes('/access_token') && init?.method === 'POST') {
            console.log('🔍 Intercepted token request to:', url);

            try {
                // Parse the existing body
                const body = init.body as string;
                const params = new URLSearchParams(body);

                // Check if this is an authorization code grant
                if (params.get('grant_type') === 'authorization_code') {
                    console.log('📝 Adding Private Key JWT to token request');

                    // IMPORTANT: Use the REAL NHS token endpoint as audience, not the proxied localhost URL
                    const realTokenEndpoint = url.replace(
                        'http://localhost:8000',
                        'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443'
                    );

                    console.log('  - Token request URL (proxied):', url);
                    console.log('  - JWT audience (real endpoint):', realTokenEndpoint);

                    // Create the Private Key JWT with the REAL endpoint as audience
                    const clientAssertion = await createPrivateKeyJWT(
                        realTokenEndpoint,
                        clientId,
                        privateKeyPEM,
                        keyConfig.algorithm,
                        keyConfig.kid
                    );

                    // Add the Private Key JWT parameters
                    params.set('client_assertion', clientAssertion);
                    params.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');

                    // Remove client_secret if present (we're using Private Key JWT instead)
                    if (params.has('client_secret')) {
                        console.log('Removing client_secret (using Private Key JWT instead)');
                        params.delete('client_secret');
                    }

                    // Update the request body
                    init.body = params.toString();
                    console.log('Request params:', {
                        grant_type: params.get('grant_type'),
                        client_id: params.get('client_id'),
                        has_client_assertion: !!params.get('client_assertion'),
                        client_assertion_type: params.get('client_assertion_type')
                    });
                }
            } catch (error) {
                console.error('Failed to add Private Key JWT:', error);
            }
        }

        // Call the original fetch
        return originalFetch(input, init);
    };

    console.log('✅ Fetch interceptor installed for Private Key JWT');
}

/**
 * Create UserManager with Private Key JWT support
 */
export function createPrivateKeyJWTUserManager(
    settings: UserManagerSettings,
    privateKeyPEM: string,
    keyConfig: { kid: string; algorithm: string }
): UserManager {
    // Install the fetch interceptor
    createPrivateKeyJWTInterceptor(settings.client_id, privateKeyPEM, keyConfig);

    // Return a standard UserManager - the interceptor handles the rest
    return new UserManager(settings);
}

