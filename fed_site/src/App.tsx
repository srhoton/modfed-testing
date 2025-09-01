import React, { useCallback, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FederatedContent } from '@/components/FederatedContent';
import { FederatedCard } from '@/components/FederatedCard';
import { AuthProvider } from './contexts/AuthContext';

// Error fallback component
const ErrorFallback = memo<{ error: Error; resetErrorBoundary: () => void }>(
  ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
);
ErrorFallback.displayName = 'ErrorFallback';

// Main app component
const App: React.FC = () => {
  // Use higher-order function for card click handlers
  const createCardClickHandler = useCallback(
    (cardName: string) => () => {
      // Handle card click event - can be extended with actual logic
      console.info(`Card clicked: ${cardName}`);
    },
    []
  );

  // Card data for cleaner rendering
  const cards = [
    {
      title: 'Component 1',
      description: 'This is a federated card component exposed for remote consumption',
      icon: '🎨',
    },
    {
      title: 'Component 2',
      description: 'Another example of a shared component via Module Federation',
      icon: '🚀',
    },
    {
      title: 'Component 3',
      description: 'Components can be imported dynamically from this remote app',
      icon: '⚡',
    },
  ];

  return (
    <AuthProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Federated Site (Remote Application)
          </h1>
          
          <div className="mb-8">
            <FederatedContent title="Module Federation Demo" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <FederatedCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={createCardClickHandler(card.title)}
              />
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              ℹ️ This application runs on <strong>http://localhost:3001</strong> and exposes components that can be consumed by the main site.
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
    </AuthProvider>
  );
};

export default memo(App);