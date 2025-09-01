import React, { memo } from 'react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from './ProtectedRoute';
import { useRemoteAuth } from '../hooks/useRemoteAuth';

export interface FederatedContentProps {
  title?: string;
  className?: string;
}

export const FederatedContent: React.FC<FederatedContentProps> = memo(({ 
  title = 'Federated Component',
  className 
}) => {
  const { user } = useRemoteAuth();
  
  return (
    <ProtectedRoute>
      <div className={cn('p-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-xl', className)}>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-white/90 text-lg mb-4">
            🚀 This content is coming from the <strong>Federated Site</strong>!
          </p>
          {user && (
            <p className="text-white/80 text-sm mb-4">
              Authenticated as: {user.email}
            </p>
          )}
          <div className="bg-white/20 rounded-md p-4">
            <p className="text-white text-sm">
              This component is loaded dynamically via Module Federation from a remote application running on port 3001.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs text-white font-semibold">
                Remote Module
              </span>
              <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs text-white font-semibold">
                Port: 3001
              </span>
              <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs text-white font-semibold">
                fed-site
              </span>
              {user && (
                <span className="inline-block px-3 py-1 bg-green-500/30 rounded-full text-xs text-white font-semibold">
                  ✓ Authenticated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
});

FederatedContent.displayName = 'FederatedContent';

export default FederatedContent;