import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OIDCProvider } from './context/OIDCContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CallbackPage from './pages/CallbackPage';

function App(): JSX.Element {
    return (
        <BrowserRouter>
            <OIDCProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<CallbackPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </OIDCProvider>
        </BrowserRouter>
    );
}

export default App;