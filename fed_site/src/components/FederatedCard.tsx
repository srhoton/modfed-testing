import React from 'react';
import { cn } from '@/utils/cn';

export interface FederatedCardProps {
  title: string;
  description?: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export const FederatedCard: React.FC<FederatedCardProps> = ({
  title,
  description,
  icon = '📦',
  onClick,
  className
}) => {
  return (
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{icon}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FederatedCard;