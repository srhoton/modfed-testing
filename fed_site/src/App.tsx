import React from 'react';
import { FederatedContent } from '@/components/FederatedContent';
import { FederatedCard } from '@/components/FederatedCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App: React.FC = () => {
  const handleCardClick = (_cardName: string): void => {
    // Handle card click event
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-8">
        <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Federated Site (Remote Application)
        </h1>
        
        <div className="mb-8">
          <FederatedContent title="Module Federation Demo" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FederatedCard
            title="Component 1"
            description="This is a federated card component exposed for remote consumption"
            icon="🎨"
            onClick={() => handleCardClick('Component 1')}
          />
          <FederatedCard
            title="Component 2"
            description="Another example of a shared component via Module Federation"
            icon="🚀"
            onClick={() => handleCardClick('Component 2')}
          />
          <FederatedCard
            title="Component 3"
            description="Components can be imported dynamically from this remote app"
            icon="⚡"
            onClick={() => handleCardClick('Component 3')}
          />
        </div>

        <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            ℹ️ This application runs on <strong>http://localhost:3001</strong> and exposes components that can be consumed by the main site.
          </p>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;