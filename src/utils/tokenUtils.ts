import { IDTokenClaims } from '../types/oidc';

export function decodeToken(token: string): IDTokenClaims | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload) as IDTokenClaims;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

export function getTokenExpiryTime(token: string): Date | null {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
        return new Date(decoded.exp * 1000);
    }
    return null;
}

export function isTokenExpired(token: string): boolean {
    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) return false;
    return new Date() > expiryTime;
}
