import { User } from 'oidc-client-ts';

export interface IDTokenClaims {
    sub: string;
    name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
    iss?: string;
    aud?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

export interface OIDCUser extends User {
    profile?: IDTokenClaims;
    access_token?: string;
}

export interface OIDCContextType {
    user: OIDCUser | null;
    loading: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    fetchUserInfo: () => Promise<any>;
    isAuthenticated: boolean;
}