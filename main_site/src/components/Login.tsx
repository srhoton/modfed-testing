import React, { useEffect } from 'react';
import { StytchB2B } from '@stytch/react/b2b';
import { stytchConfig } from '@/config/stytch';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useStytchB2BClient } from '@stytch/react/b2b';

export const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const stytchClient = useStytchB2BClient();

  useEffect(() => {
    // Stytch client is initialized
  }, [stytchClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Main Site
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in with Google to access federated content
            </p>
          </div>

          {/* Add a div with specific ID for Stytch to mount */}
          <div id="stytch-b2b-container" className="stytch-container">
            <StytchB2B
              config={stytchConfig}
              styles={{
                container: {
                  backgroundColor: 'transparent',
                  width: '100%',
                },
                colors: {
                  primary: '#3b82f6',
                  secondary: '#6b7280',
                  success: '#10b981',
                  error: '#ef4444',
                },
                buttons: {
                  primary: {
                    backgroundColor: '#3b82f6',
                    textColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderRadius: '0.5rem',
                  },
                },
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
              callbacks={{
                onEvent: (_event) => {
                  // Handle Stytch events
                },
                onError: (_error) => {
                  // Handle Stytch errors
                },
              }}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};