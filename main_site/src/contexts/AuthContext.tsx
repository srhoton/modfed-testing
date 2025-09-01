import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStytchB2BClient, useStytchMemberSession, useStytchMember } from '@stytch/react/b2b';
import type { Member, MemberSession } from '@stytch/vanilla-js/b2b';
import { isAuthMessage } from '../types/auth';
import { isAllowedOrigin } from '../config/auth.config';

interface AuthContextValue {
  member: Member | null;
  session: MemberSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stytchClient = useStytchB2BClient();
  const { session, isInitialized: sessionInitialized } = useStytchMemberSession();
  const { member, isInitialized: memberInitialized } = useStytchMember();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionInitialized && memberInitialized) {
      setIsLoading(false);
      
      // Share auth state with federated modules
      if (session && member) {
        const authData = {
          user: {
            email: member.email_address,
            memberId: member.member_id,
            organizationId: member.organization_id,
          },
          sessionToken: session.member_session_id,
        };
        
        // Store in sessionStorage for same-tab access
        sessionStorage.setItem('stytch_auth', JSON.stringify(authData));
        
        // Broadcast auth update
        window.postMessage({ type: 'AUTH_UPDATE', user: authData.user }, '*');
      } else {
        // Clear auth when logged out
        sessionStorage.removeItem('stytch_auth');
        window.postMessage({ type: 'AUTH_UPDATE', user: null }, '*');
      }
    }
  }, [sessionInitialized, memberInitialized, session, member]);

  // Handle auth requests from federated modules with origin validation
  useEffect(() => {
    const handleAuthRequest = (event: MessageEvent): void => {
      // Validate origin
      if (!isAllowedOrigin(event.origin)) {
        console.warn('Received auth request from unauthorized origin:', event.origin);
        return;
      }

      // Validate message structure
      if (!isAuthMessage(event.data)) {
        return;
      }

      if (event.data.type === 'REQUEST_AUTH') {
        if (session && member) {
          const authData = {
            email: member.email_address,
            memberId: member.member_id,
            organizationId: member.organization_id,
          };
          // Send response back to the same origin that requested it
          event.source?.postMessage({ type: 'AUTH_RESPONSE', user: authData }, event.origin as any);
        } else {
          event.source?.postMessage({ type: 'AUTH_RESPONSE', user: null }, event.origin as any);
        }
      }
    };

    window.addEventListener('message', handleAuthRequest);
    return () => window.removeEventListener('message', handleAuthRequest);
  }, [session, member]);

  const logout = async (): Promise<void> => {
    try {
      await stytchClient.session.revoke();
      // Clear shared auth state
      sessionStorage.removeItem('stytch_auth');
      window.postMessage({ type: 'AUTH_UPDATE', user: null }, '*');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextValue = {
    member,
    session,
    isLoading,
    isAuthenticated: !!session && !!member,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};