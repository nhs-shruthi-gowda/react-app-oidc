import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode
} from 'react';
import { User, UserLoadedEvent } from 'oidc-client-ts';
import { userManager, initializeOIDC } from '../config/oidsConfig';
import { OIDCContextType, OIDCUser } from '../types/oidc';
import { fetchUserInfo as fetchUserInfoUtil, getUserinfoEndpoint } from '../utils/userInfoUtils';

const OIDCContext = createContext<OIDCContextType | undefined>(undefined);

interface OIDCProviderProps {
    children: ReactNode;
}

export function OIDCProvider({ children }: OIDCProviderProps): JSX.Element {
    const [user, setUser] = useState<OIDCUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Wait for OIDC configuration to initialize
                await initializeOIDC();
                setInitialized(true);
            } catch (err) {
                console.error('Failed to initialize OIDC:', err);
                setError('Failed to initialize authentication');
                setLoading(false);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (!initialized) return;

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
    }, [initialized]);

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
    const fetchUserInfo = useCallback(async (): Promise<any> => {
        if (!user || !user.access_token) {
            throw new Error('No access token available. Please login first.');
        }

        try {
            const isDevelopment = import.meta.env.DEV;
            const userinfoEndpoint = getUserinfoEndpoint(isDevelopment);

            console.log('📥 Fetching user info with access token...');
            const userInfo = await fetchUserInfoUtil(userinfoEndpoint, user.access_token);

            console.log('✅ User info fetched successfully:', userInfo);

            // Note: We don't update the user object in storage here
            // as it requires proper User instance creation
            // The fetched info is returned for use in components

            return userInfo;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user info';
            console.error('Error fetching user info:', errorMessage);
            setError(errorMessage);
            throw err;
        }
    }, [user]);

    const isAuthenticated = user !== null;

    const value: OIDCContextType = {
        user,
        loading,
        error,
        login,
        logout,
        refreshToken,
        fetchUserInfo,
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