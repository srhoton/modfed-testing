import { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { isAuthData, isAuthMessage, isUser } from '../types/auth';
import { isAllowedOrigin } from '../config/auth.config';

export const useRemoteAuth = (): { user: User | null; isAuthenticated: boolean; isLoading: boolean } => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're running in a federated context
    const checkAuth = (): void => {
      try {
        // Check session storage for auth data
        const authDataStr = sessionStorage.getItem('stytch_auth');
        if (authDataStr) {
          const parsed: unknown = JSON.parse(authDataStr);
          if (isAuthData(parsed)) {
            setUser(parsed.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth updates from main app with origin validation
    const handleAuthUpdate = (event: MessageEvent): void => {
      // Validate origin
      if (!isAllowedOrigin(event.origin)) {
        console.warn('Received message from unauthorized origin:', event.origin);
        return;
      }

      // Validate message structure
      if (!isAuthMessage(event.data)) {
        return;
      }

      if (event.data.type === 'AUTH_UPDATE') {
        if (event.data.user && isUser(event.data.user)) {
          setUser(event.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    // Listen for storage events for cross-tab sync
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === 'stytch_auth') {
        if (e.newValue) {
          try {
            const parsed: unknown = JSON.parse(e.newValue);
            if (isAuthData(parsed)) {
              setUser(parsed.user);
              setIsAuthenticated(true);
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('message', handleAuthUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('message', handleAuthUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { user, isAuthenticated, isLoading };
};