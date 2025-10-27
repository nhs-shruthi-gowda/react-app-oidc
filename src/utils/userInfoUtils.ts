
export async function fetchUserInfo(userinfoEndpoint: string, accessToken: string): Promise<any> {
    console.log('🔍 Fetching user info from:', userinfoEndpoint);

    try {
        const response = await fetch(userinfoEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch user info:', response.status, errorText);
            throw new Error(`Failed to fetch user info: ${response.status} - ${errorText}`);
        }

        const userInfo = await response.json();
        console.log('User info retrieved successfully');
        console.log('User info:', userInfo);

        return userInfo;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

/**
 * Get the userinfo endpoint URL from metadata or construct it
 * @param isDevelopment Whether running in development mode
 * @returns The userinfo endpoint URL
 */
export function getUserinfoEndpoint(isDevelopment: boolean = false): string {
    const baseURL = 'https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare';
    const nhsAuthority = isDevelopment ? 'http://localhost:8000' : baseURL;

    return `${nhsAuthority}/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare/userinfo`;
}

