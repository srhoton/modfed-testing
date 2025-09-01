import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

// Mock Stytch hooks
const mockSession = {
  member_session_id: 'test-session-id',
  member_id: 'test-member-id',
};

const mockMember = {
  member_id: 'test-member-id',
  email_address: 'test@example.com',
  name: 'Test User',
};

const mockStytchClient = {
  session: {
    revoke: vi.fn(),
  },
};

const mockUseStytchMemberSession = vi.fn();
const mockUseStytchMember = vi.fn();
const mockUseStytchB2BClient = vi.fn(() => mockStytchClient);

vi.mock('@stytch/react/b2b', () => ({
  StytchB2BProvider: vi.fn(({ children }) => <>{children}</>),
  useStytchB2BClient: () => mockUseStytchB2BClient(),
  useStytchMemberSession: () => mockUseStytchMemberSession(),
  useStytchMember: () => mockUseStytchMember(),
}));

vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: vi.fn().mockImplementation(() => mockStytchClient),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent: React.FC = () => {
    const { member, session, isLoading, isAuthenticated, logout } = useAuth();
    
    return (
      <div>
        <div data-testid="member">{member?.email_address || 'no-member'}</div>
        <div data-testid="session">{session?.member_session_id || 'no-session'}</div>
        <div data-testid="loading">{isLoading.toString()}</div>
        <div data-testid="authenticated">{isAuthenticated.toString()}</div>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  const renderWithAuth = () => {
    const mockStytchClientInstance = new StytchB2BUIClient('test-token', { env: 'test' });
    
    return render(
      <StytchB2BProvider stytch={mockStytchClientInstance}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </StytchB2BProvider>
    );
  };

  it('provides initial unauthenticated state', () => {
    mockUseStytchMemberSession.mockReturnValue({
      session: null,
      isInitialized: true,
      fromCache: false,
    });
    mockUseStytchMember.mockReturnValue({
      member: null,
      isInitialized: true,
      fromCache: false,
    });

    renderWithAuth();

    expect(screen.getByTestId('member')).toHaveTextContent('no-member');
    expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('provides authenticated state when session and member exist', () => {
    mockUseStytchMemberSession.mockReturnValue({
      session: mockSession,
      isInitialized: true,
      fromCache: false,
    });
    mockUseStytchMember.mockReturnValue({
      member: mockMember,
      isInitialized: true,
      fromCache: false,
    });

    renderWithAuth();

    expect(screen.getByTestId('member')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('session')).toHaveTextContent('test-session-id');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('shows loading state when not initialized', () => {
    mockUseStytchMemberSession.mockReturnValue({
      session: null,
      isInitialized: false,
      fromCache: false,
    });
    mockUseStytchMember.mockReturnValue({
      member: null,
      isInitialized: false,
      fromCache: false,
    });

    renderWithAuth();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('calls logout function correctly', async () => {
    mockUseStytchMemberSession.mockReturnValue({
      session: mockSession,
      isInitialized: true,
      fromCache: false,
    });
    mockUseStytchMember.mockReturnValue({
      member: mockMember,
      isInitialized: true,
      fromCache: false,
    });

    renderWithAuth();

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(mockStytchClient.session.revoke).toHaveBeenCalled();
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const TestComponentWithoutProvider = () => {
      try {
        useAuth();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>{(error as Error).message}</div>;
      }
    };

    render(<TestComponentWithoutProvider />);
    
    expect(screen.getByText('useAuth must be used within an AuthProvider')).toBeInTheDocument();
  });
});