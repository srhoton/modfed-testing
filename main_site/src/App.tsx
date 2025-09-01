import React, { lazy, Suspense, useEffect, memo, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Welcome } from '@/components/Welcome';
import { useAuth } from '@/contexts/AuthContext';
import { useFederatedContent } from '@/hooks/useFederatedContent';

// Lazy load the federated components
const FederatedContent = lazy(() => import('fed-site/FederatedContent'));
const FederatedCard = lazy(() => import('fed-site/FederatedCard'));

// Memoized Loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized Error Fallback component
const ErrorFallback = memo<{ error: Error; resetErrorBoundary: () => void }>(
  ({ error, resetErrorBoundary }) => (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        Failed to Load Federated Component
      </h3>
      <p className="text-red-600 dark:text-red-300">
        {error?.message || 'Unable to load component from remote application'}
      </p>
      <p className="text-sm text-red-500 dark:text-red-400 mt-2">
        Make sure the federated site is running on http://localhost:3001
      </p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
);
ErrorFallback.displayName = 'ErrorFallback';

// Federated component wrapper with error boundary
const FederatedComponentWrapper = memo<{ 
  component: 'content' | 'card';
  props?: any;
}>(({ component, props = {} }) => {
  const Component = component === 'content' ? FederatedContent : FederatedCard;
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
});
FederatedComponentWrapper.displayName = 'FederatedComponentWrapper';


// Main App component

const App: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const federatedContent = useFederatedContent();

  // Navigation handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  // Card click handler using higher-order function
  const createCardClickHandler = useCallback(
    (cardName: string) => () => {
      // Handle card click event
    },
    []
  );

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Module Federation Demo
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Welcome section */}
        <Welcome className="mb-8" />

        {/* Authentication info */}
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200">
            ✅ You are authenticated and can now access federated content!
          </p>
        </div>

        {/* Toggle button for federated content */}
        <div className="mb-8">
          <button
            onClick={federatedContent.toggleVisibility}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            {federatedContent.isVisible ? 'Hide' : 'Show'} Federated Content
          </button>
        </div>

        {/* Federated content */}
        {federatedContent.isVisible && (
          <div className="space-y-8">
            {/* Federated Content Component */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Content from Federated Site
              </h2>
              <FederatedComponentWrapper 
                component="content"
                props={{ message: 'Hello from Main Site!' }}
              />
            </section>

            {/* Federated Card Components */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Cards from Federated Site
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FederatedComponentWrapper
                  component="card"
                  props={{
                    title: 'Federated Card 1',
                    description: 'This card is loaded from the federated site',
                    icon: '🎨',
                    onClick: createCardClickHandler('Federated Card 1'),
                  }}
                />
                <FederatedComponentWrapper
                  component="card"
                  props={{
                    title: 'Federated Card 2',
                    description: 'Another federated component example',
                    icon: '🚀',
                    onClick: createCardClickHandler('Federated Card 2'),
                  }}
                />
                <FederatedComponentWrapper
                  component="card"
                  props={{
                    title: 'Federated Card 3',
                    description: 'Module federation in action!',
                    icon: '⚡',
                    onClick: createCardClickHandler('Federated Card 3'),
                  }}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(App);