import React, { memo, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from './ProtectedRoute';
import { useRemoteAuth } from '../hooks/useRemoteAuth';

export interface FederatedCardProps {
  title: string;
  description?: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export const FederatedCard: React.FC<FederatedCardProps> = memo(({
  title,
  description,
  icon = '📦',
  onClick,
  className
}) => {
  const { isAuthenticated } = useRemoteAuth();
  
  // Memoize keyboard handler to avoid recreating on each render
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <ProtectedRoute>
      <div 
      className={cn(
        'p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-purple-400',
        'hover:shadow-xl hover:border-purple-500 transition-all duration-300',
        'cursor-pointer transform hover:scale-105',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${title} card`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl" aria-hidden="true">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Federated Component
            </span>
            {isAuthenticated && (
              <span className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Secured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
});

FederatedCard.displayName = 'FederatedCard';

export default FederatedCard;