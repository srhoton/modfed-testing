import React, { lazy, Suspense, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Welcome } from '@/components/Welcome';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load the federated components
const FederatedContent = lazy(() => import('fed-site/FederatedContent'));
const FederatedCard = lazy(() => import('fed-site/FederatedCard'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Error Fallback component
const ErrorFallback: React.FC<{ error?: Error | undefined }> = ({ error }) => (
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
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, member, logout } = useAuth();
  const [showFederatedContent, setShowFederatedContent] = React.useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCardClick = (cardName: string): void => {
    // Handle card click event
  };

  const toggleFederatedContent = (): void => {
    setShowFederatedContent(!showFederatedContent);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Auth Header */}
      <div className="bg-primary-50 dark:bg-gray-800 border-b border-primary-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {member?.email_address?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {member?.email_address || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Authenticated via Google OAuth
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <Welcome />
      
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ You are authenticated and can access federated content
            </p>
          </div>

          <button
            onClick={toggleFederatedContent}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="mr-2">{showFederatedContent ? '🔽' : '▶️'}</span>
            {showFederatedContent ? 'Hide' : 'Show'} Federated Components
          </button>
          
          {!showFederatedContent && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Click the button above to load components from the federated site running on port 3001
            </p>
          )}
        </div>

        {showFederatedContent && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 animate-fade-in">
              Federated Components Section
            </h2>
            
            {/* Federated Content Component */}
            <ErrorBoundary fallback={<ErrorFallback />}>
              <Suspense fallback={<LoadingSpinner />}>
                <FederatedContent 
                  title="Hello from Main Site!" 
                  className="mb-8 animate-slide-up"
                />
              </Suspense>
            </ErrorBoundary>

            {/* Federated Card Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              <ErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<LoadingSpinner />}>
                  <FederatedCard
                    title="Dynamic Card 1"
                    description="This card is loaded from the federated site"
                    icon="🎯"
                    onClick={() => handleCardClick('Dynamic Card 1')}
                  />
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<LoadingSpinner />}>
                  <FederatedCard
                    title="Dynamic Card 2"
                    description="Module federation enables micro-frontend architecture"
                    icon="🌟"
                    onClick={() => handleCardClick('Dynamic Card 2')}
                  />
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<LoadingSpinner />}>
                  <FederatedCard
                    title="Dynamic Card 3"
                    description="Components shared across applications seamlessly"
                    icon="🔗"
                    onClick={() => handleCardClick('Dynamic Card 3')}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;