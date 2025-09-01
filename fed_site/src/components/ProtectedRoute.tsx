import React from 'react';
import { useRemoteAuth } from '../hooks/useRemoteAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useRemoteAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Authentication Required
            </h3>
            <p className="text-red-600 dark:text-red-300">
              You must be authenticated to view this content.
            </p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              Please log in through the main application.
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};