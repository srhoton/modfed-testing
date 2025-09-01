import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStytchB2BClient, useStytchMemberSession, useStytchMember } from '@stytch/react/b2b';
import type { Member, MemberSession } from '@stytch/vanilla-js/b2b';

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
    }
  }, [sessionInitialized, memberInitialized]);

  const logout = async (): Promise<void> => {
    try {
      await stytchClient.session.revoke();
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