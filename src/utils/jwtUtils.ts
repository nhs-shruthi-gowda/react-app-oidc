import { SignJWT, importPKCS8 } from 'jose';

/**
 * Creates a Private Key JWT for client authentication
 * @param tokenEndpoint The token endpoint URL
 * @param clientId The client ID
 * @param privateKeyPEM The private key in PEM format
 * @param algorithm The signing algorithm (e.g., 'RS512')
 * @param kid The key ID
 * @returns The signed JWT
 */
export async function createPrivateKeyJWT(
    tokenEndpoint: string,
    clientId: string,
    privateKeyPEM: string,
    algorithm: string = 'RS512',
    kid: string = 'demo-key-1'
): Promise<string> {
    try {
        // Trim whitespace and ensure a proper format
        const trimmedKey = privateKeyPEM?.trim();

        if (!trimmedKey || !trimmedKey.includes('BEGIN PRIVATE KEY')) {
            throw new Error('Invalid private key format - missing BEGIN PRIVATE KEY marker');
        }

        // Import the private key
        const privateKey = await importPKCS8(trimmedKey, algorithm);

        // Create and return the JWT
        return await new SignJWT({})
            .setProtectedHeader({ alg: algorithm, kid })
            .setIssuedAt()
            .setIssuer(clientId)
            .setSubject(clientId)
            .setAudience(tokenEndpoint)
            .setExpirationTime('5m') // Token valid for 5 minutes
            .setJti(crypto.randomUUID()) // Unique identifier for this JWT
            .sign(privateKey);
    } catch (error) {
        console.error('Error creating private key JWT:', error);
        throw error;
    }
}


