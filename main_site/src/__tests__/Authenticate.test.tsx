import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Authenticate } from '../components/Authenticate';
import { AuthProvider } from '../contexts/AuthContext';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

const mockNavigate = vi.fn();
const mockStytchClient = {
  session: {
    revoke: vi.fn(),
  },
  discovery: {
    exchangeIntermediateSession: vi.fn(),
  },
  magicLinks: {
    authenticate: vi.fn(),
  },
};

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Stytch
vi.mock('@stytch/react/b2b', () => ({
  StytchB2BProvider: vi.fn(({ children }) => <>{children}</>),
  useStytchB2BClient: vi.fn(() => mockStytchClient),
  useStytchMemberSession: vi.fn(() => ({
    session: null,
    isInitialized: true,
    fromCache: false,
  })),
  useStytchMember: vi.fn(() => ({
    member: null,
    isInitialized: true,
    fromCache: false,
  })),
}));

vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: vi.fn().mockImplementation(() => mockStytchClient),
}));

// Mock useAuth at module level
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(() => ({
    member: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  })),
}));

describe('Authenticate Component', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    window.location = { ...originalLocation, search: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  const renderAuthenticate = (isAuthenticated = false) => {
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      member: isAuthenticated ? { email_address: 'test@example.com' } : null,
      session: isAuthenticated ? {} : null,
      isLoading: false,
      isAuthenticated,
      logout: vi.fn(),
    });

    const mockStytchClientInstance = new StytchB2BUIClient('test-token', { env: 'test' });

    return render(
      <BrowserRouter>
        <StytchB2BProvider stytch={mockStytchClientInstance}>
          <AuthProvider>
            <Authenticate />
          </AuthProvider>
        </StytchB2BProvider>
      </BrowserRouter>
    );
  };

  it('shows authenticating message initially', () => {
    window.location.search = '?token=test-token&stytch_token_type=discovery';
    renderAuthenticate();
    
    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
  });

  it('handles discovery token authentication', async () => {
    window.location.search = '?token=test-token&stytch_token_type=discovery';
    
    mockStytchClient.discovery.exchangeIntermediateSession.mockResolvedValue({
      member_authenticated: true,
      discovered_organizations: [],
    });

    renderAuthenticate();

    await waitFor(() => {
      expect(mockStytchClient.discovery.exchangeIntermediateSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('handles organization selection in discovery flow', async () => {
    window.location.search = '?token=test-token&stytch_token_type=discovery';
    
    mockStytchClient.discovery.exchangeIntermediateSession
      .mockResolvedValueOnce({
        member_authenticated: false,
        discovered_organizations: [
          {
            organization: {
              organization_id: 'org-123',
              organization_name: 'Test Org',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        member_authenticated: true,
        discovered_organizations: [],
      });

    renderAuthenticate();

    await waitFor(() => {
      expect(mockStytchClient.discovery.exchangeIntermediateSession).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockStytchClient.discovery.exchangeIntermediateSession).toHaveBeenLastCalledWith({
        organization_id: 'org-123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('handles OAuth token authentication', async () => {
    window.location.search = '?token=test-token&stytch_token_type=oauth';
    
    mockStytchClient.magicLinks.authenticate.mockResolvedValue({
      member: { email_address: 'test@example.com' },
      session: { member_session_id: 'session-123' },
    });

    renderAuthenticate();

    await waitFor(() => {
      expect(mockStytchClient.magicLinks.authenticate).toHaveBeenCalledWith({
        magic_links_token: 'test-token',
        session_duration_minutes: 60,
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error when no token is present', async () => {
    window.location.search = '';
    renderAuthenticate();

    await waitFor(() => {
      expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
      expect(screen.getByText('No authentication token found')).toBeInTheDocument();
    });
  });

  it('shows error when authentication fails', async () => {
    window.location.search = '?token=test-token&stytch_token_type=discovery';
    
    const error = new Error('Authentication failed');
    mockStytchClient.discovery.exchangeIntermediateSession.mockRejectedValue(error);

    renderAuthenticate();

    await waitFor(() => {
      expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  it('redirects to home if already authenticated', () => {
    window.location.search = '?token=test-token&stytch_token_type=oauth';
    
    const { useStytchMemberSession, useStytchMember } = require('@stytch/react/b2b');
    useStytchMemberSession.mockReturnValue({
      session: { member_session_id: 'existing-session' },
      isInitialized: true,
      fromCache: false,
    });
    useStytchMember.mockReturnValue({
      member: { email_address: 'existing@example.com' },
      isInitialized: true,
      fromCache: false,
    });

    renderAuthenticate(true);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('provides back to login button on error', async () => {
    window.location.search = '';
    renderAuthenticate();

    await waitFor(() => {
      const backButton = screen.getByText('Back to Login');
      expect(backButton).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Login');
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});