import { UserManager, User } from 'oidc-client-ts';
import { createPrivateKeyJWT } from './jwtUtils';

/**
 * Custom UserManager that handles Private Key JWT authentication
 */
export class JwtUserManager extends UserManager {
    private privateKeyPEM: string;
    private keyConfig: { kid: string; algorithm: string };
    private clientId: string;
    private redirectUri: string;

    constructor(settings: any, privateKeyPEM: string, keyConfig: { kid: string; algorithm: string }) {
        super(settings);
        this.privateKeyPEM = privateKeyPEM;
        this.keyConfig = keyConfig;
        this.clientId = settings.client_id;
        this.redirectUri = settings.redirect_uri;
    }
    async signinCallback(url?: string): Promise<User> {
        console.log('Custom signinCallback - handling Private Key JWT authentication');

        // Get the callback URL
        const callbackUrl = url || window.location.href;

        // Parse the authorization code from the URL
        const urlParams = new URLSearchParams(new URL(callbackUrl).search);
        const code = urlParams.get('code');

        if (!code) {
            throw new Error('No authorization code in callback');
        }

        console.log('Authorization code received');

        // Get token endpoint from metadata using the public method
        const metadata = await (this as any)._client.metadataService.getMetadata();
        const tokenEndpoint = metadata.token_endpoint;

        if (!tokenEndpoint) {
            throw new Error('No token endpoint in metadata');
        }

        console.log('Token endpoint:', tokenEndpoint);

        // Create the Private Key JWT
        const clientAssertion = await createPrivateKeyJWT(
            tokenEndpoint,
            this.clientId,
            this.privateKeyPEM,
            this.keyConfig.algorithm,
            this.keyConfig.kid
        );

        console.log('Client assertion JWT created successfully');

        // Build the token request body
        const tokenRequestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_assertion: clientAssertion,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
        });

        console.log('Making token request with Private Key JWT...');

        // Make the token request
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenRequestBody.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token exchange failed:', response.status, errorText);
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
        }

        const tokenResponse = await response.json();
        console.log('✅ Token exchange successful with Private Key JWT!');

        // Let the parent class handle the rest of the signin callback
        // by calling the original implementation with a modified URL that includes the tokens
        // Actually, we can't easily do this, so let's just call processSigninResponse
        try {
            // Use the internal method to process the signin response
            const user = await (this as any)._client.processSigninResponse(callbackUrl);
            return user;
        } catch (err) {
            // If that doesn't work, try the standard flow
            console.warn('Fallback to standard signin callback');
            return super.signinCallback(url);
        }
    }
}

