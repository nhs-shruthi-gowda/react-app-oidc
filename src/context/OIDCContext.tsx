import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode
} from 'react';
import { User, UserLoadedEvent, UserUnloadedEvent } from 'oidc-client-ts';
import { userManager } from '../config/oidsConfig';
import { OIDCContextType, OIDCUser } from '../types/oidc';

const OIDCContext = createContext<OIDCContextType | undefined>(undefined);

interface OIDCProviderProps {
    children: ReactNode;
}

export function OIDCProvider({ children }: OIDCProviderProps): JSX.Element {
    const [user, setUser] = useState<OIDCUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async (): Promise<void> => {
            try {
                const currentUser = await userManager.getUser() as OIDCUser | null;
                setUser(currentUser);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Error checking user:', errorMessage);

                // Check if it's a CORS error
                if (errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
                    setError('Unable to connect to NHS Identity Provider. Please ensure your client is registered and redirect URIs are configured.');
                } else {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Subscribe to user state changes
        const unsubscribeUserLoaded = userManager.events.addUserLoaded((user: UserLoadedEvent) => {
            setUser(user as OIDCUser);
            setError(null);
        });

        const unsubscribeUserUnloaded = userManager.events.addUserUnloaded(() => {
            setUser(null);
        });

        const unsubscribeAccessTokenExpired = userManager.events.addAccessTokenExpired(() => {
            console.log('Access token expired, attempting silent renew...');
            userManager.signinSilent()
                .then((user: User | null) => setUser(user as OIDCUser))
                .catch((err: Error) => {
                    console.error('Silent renew failed:', err.message);
                    setError('Token refresh failed. Please login again.');
                });
        });

        const unsubscribeAccessTokenExpiring = userManager.events.addAccessTokenExpiring(() => {
            console.log('Access token expiring soon');
        });

        const unsubscribeSigninCallback = userManager.events.addUserSignedIn((user: User | null) => {
            setUser(user as OIDCUser);
            window.history.replaceState({}, document.title, window.location.origin);
        });

        return () => {
            unsubscribeUserLoaded();
            unsubscribeUserUnloaded();
            unsubscribeAccessTokenExpired();
            unsubscribeAccessTokenExpiring();
            unsubscribeSigninCallback();
        };
    }, []);

    const login = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await userManager.signinRedirect();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await userManager.signoutRedirect();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<void> => {
        try {
            const updatedUser = await userManager.signinSilent() as OIDCUser;
            setUser(updatedUser);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Token refresh failed';
            setError(`Token refresh failed: ${errorMessage}`);
        }
    }, []);

    const isAuthenticated = user !== null;

    const value: OIDCContextType = {
        user,
        loading,
        error,
        login,
        logout,
        refreshToken,
        isAuthenticated
    };

    return (
        <OIDCContext.Provider value={value}>
            {children}
        </OIDCContext.Provider>
    );
}

export function useOIDC(): OIDCContextType {
    const context = useContext(OIDCContext);
    if (!context) {
        throw new Error('useOIDC must be used within OIDCProvider');
    }
    return context;
}