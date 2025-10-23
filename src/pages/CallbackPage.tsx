import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from '../config/oidsConfig'
import { OIDCUser } from '../types/oidc';

export default function CallbackPage(): JSX.Element {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async (): Promise<void> => {
            try {
                const user = await userManager.signinCallback() as OIDCUser | null;
                console.log('User signed in:', user);
                navigate('/');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Callback error:', errorMessage);
                setError(errorMessage);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-slate-900">
            <div className="text-center">
                {error ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h2>
                        <p className="text-slate-300 mb-4">{error}</p>
                        <p className="text-slate-400">Redirecting...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">Authenticating...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    </>
                )}
            </div>
        </div>
    );
}
