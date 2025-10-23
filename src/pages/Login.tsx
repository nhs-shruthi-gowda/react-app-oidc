import React from 'react';
import { useOIDC } from '../context/OIDCContext';
import { LogIn } from 'lucide-react';

export default function Login(): JSX.Element {
    const { login } = useOIDC();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-slate-900">
            <div className="bg-slate-800/40 backdrop-blur rounded-lg border border-blue-500/20 p-8 max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">NHS Identity</h1>
                <p className="text-slate-400 text-center mb-8">OIDC Authentication</p>

                <button
                    onClick={login}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                    <LogIn size={20} />
                    Sign In with NHS Identity/IDENTITY
                </button>

                <p className="text-xs text-slate-500 text-center mt-6">
                    Using oidc-client-ts library for OpenID Connect (TypeScript)
                </p>
            </div>
        </div>
    );
}