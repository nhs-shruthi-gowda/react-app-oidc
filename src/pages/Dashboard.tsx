import React, { useState } from 'react';
import { useOIDC } from '../context/OIDCContext';
import { decodeToken } from '../utils/tokenUtils';
import { LogOut, RefreshCw, User, UserCheck } from "lucide-react";
import { IDTokenClaims } from '../types/oidc';

export default function Dashboard(): JSX.Element {
    const { user, loading, error, logout, refreshToken, fetchUserInfo } = useOIDC();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [fetchingUserInfo, setFetchingUserInfo] = useState(false);

    const handleFetchUserInfo = async () => {
        setFetchingUserInfo(true);
        try {
            const info = await fetchUserInfo();
            setUserInfo(info);
            console.log('User info fetched:', info);
        } catch (err) {
            console.error('Failed to fetch user info:', err);
        } finally {
            setFetchingUserInfo(false);
        }
    };

    if (loading) {
        return <div className="text-center text-white mt-20">Loading...</div>;
    }

    if (!user) {
        return <div className="text-center text-white mt-20">Not authenticated</div>;
    }

    const idTokenPayload: IDTokenClaims | null = user.id_token
        ? decodeToken(user.id_token)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 pt-8">
                    <h1 className="text-4xl font-bold text-white mb-2">NHS Identity OIDC</h1>
                    <p className="text-blue-200">oidc-client-ts Integration (TypeScript)</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Profile */}
                    <div className="bg-slate-800/40 backdrop-blur rounded-lg border border-green-500/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <User size={24} className="text-green-400" />
                            User Profile
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">Name</p>
                                <p className="text-lg font-semibold text-white">
                                    {idTokenPayload?.name || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Email</p>
                                <p className="text-lg font-semibold text-white">
                                    {idTokenPayload?.email || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Subject (sub)</p>
                                <p className="text-sm font-mono text-slate-300 break-all">
                                    {idTokenPayload?.sub || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Email Verified</p>
                                <p className="text-green-400">
                                    {idTokenPayload?.email_verified ? '✓ Yes' : '✗ No'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tokens */}
                    <div className="bg-slate-800/40 backdrop-blur rounded-lg border border-cyan-500/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Tokens</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">Access Token</p>
                                <div className="bg-slate-900/40 p-2 rounded border border-slate-700/50 mt-1">
                                    <p className="text-xs font-mono text-slate-300 break-all">
                                        {user.access_token?.substring(0, 50)}...
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Token Type</p>
                                <p className="text-white font-mono">{user.token_type || 'Bearer'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Expires In</p>
                                <p className="text-white font-mono">
                                    {user.expires_in ? `${user.expires_in}s` : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Session State</p>
                                <p className="text-xs font-mono text-slate-400 break-all">
                                    {user.session_state?.substring(0, 40)}...
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ID Token Claims */}
                    {idTokenPayload && (
                        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur rounded-lg border border-purple-500/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">ID Token Claims</h2>
                            <pre className="bg-slate-900/60 p-4 rounded border border-slate-700/50 text-xs text-slate-300 overflow-auto max-h-64">
                {JSON.stringify(idTokenPayload, null, 2)}
              </pre>
                        </div>
                    )}

                    {/* Fetched User Info */}
                    {userInfo && (
                        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur rounded-lg border border-green-500/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <UserCheck size={24} className="text-green-400" />
                                User Info from Userinfo Endpoint
                            </h2>
                            <pre className="bg-slate-900/60 p-4 rounded border border-slate-700/50 text-xs text-slate-300 overflow-auto max-h-64">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="lg:col-span-2 flex gap-3">
                        <button
                            onClick={handleFetchUserInfo}
                            disabled={fetchingUserInfo}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                            <UserCheck size={18} />
                            {fetchingUserInfo ? 'Fetching...' : 'Fetch User Info'}
                        </button>

                        <button
                            onClick={refreshToken}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Refresh Token
                        </button>

                        <button
                            onClick={logout}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}