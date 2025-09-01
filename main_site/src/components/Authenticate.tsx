import React, { useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStytchAuth } from '@/hooks/useStytchAuth';

// Parse URL parameters functionally
const parseAuthParams = (search: string): { token: string | null; tokenType: string | null } => {
  const params = new URLSearchParams(search);
  return {
    token: params.get('token'),
    tokenType: params.get('stytch_token_type'),
  };
};

// Check for OAuth callback
const isOAuthCallback = (search: string): boolean => {
  const params = new URLSearchParams(search);
  return params.has('pkce_code_verifier');
};

// Error display component
const AuthError = memo<{ error: string; onBack: () => void }>(({ error, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="max-w-md w-full">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Authentication Failed
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
));
AuthError.displayName = 'AuthError';

// Loading display component
const AuthLoading = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
    </div>
  </div>
));
AuthLoading.displayName = 'AuthLoading';

// Main Authenticate component
export const Authenticate: React.FC = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { authenticate, isAuthenticating, authError } = useStytchAuth();

  // Parse URL parameters once
  const authParams = useMemo(() => {
    const search = window.location.search;
    
    // Check for OAuth callback first
    if (isOAuthCallback(search)) {
      // OAuth callback detected, session should already be set
      setTimeout(() => navigate('/', { replace: true }), 100);
      return null;
    }
    
    return parseAuthParams(search);
  }, [navigate]);

  // Handle authentication
  useEffect(() => {
    const handleAuth = async () => {
      // Skip if already authenticated
      if (isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }

      // Skip if OAuth callback or no params
      if (!authParams) {
        return;
      }

      // Check for token
      if (!authParams.token) {
        // authError will be set automatically
        return;
      }

      // Authenticate with token
      await authenticate(authParams.token, authParams.tokenType);
    };

    void handleAuth();
  }, [authParams, authenticate, isAuthenticated, navigate]);

  // Navigation handler
  const handleBackToLogin = () => navigate('/login');

  // Render error state
  if (authError || (!authParams?.token && authParams !== null)) {
    const errorMessage = authError || 'No authentication token found';
    return <AuthError error={errorMessage} onBack={handleBackToLogin} />;
  }

  // Render loading state
  return <AuthLoading />;
});

Authenticate.displayName = 'Authenticate';