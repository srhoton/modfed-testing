import React from 'react';
import { cn } from '@/utils/cn';

export interface WelcomeProps {
  className?: string;
}

export const Welcome: React.FC<WelcomeProps> = ({ className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-screen p-8', className)}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Welcome to the Main Site
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
          This is the host application for module federation. Remote modules will be loaded here.
        </p>
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Module Federation Ready
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This application is configured to host federated modules from remote applications.
          </p>
        </div>
      </div>
    </div>
  );
};