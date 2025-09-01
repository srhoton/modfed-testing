import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../components/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

// Mock the Stytch components
vi.mock('@stytch/react/b2b', () => ({
  StytchB2B: vi.fn(({ config }) => (
    <div data-testid="stytch-b2b-component">
      <button>Sign in with Google</button>
    </div>
  )),
  StytchB2BProvider: vi.fn(({ children }) => <>{children}</>),
  useStytchB2BClient: vi.fn(() => ({
    session: {
      revoke: vi.fn(),
    },
    discovery: {
      exchangeIntermediateSession: vi.fn(),
    },
    magicLinks: {
      authenticate: vi.fn(),
    },
  })),
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

// Mock the StytchB2BUIClient
vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: vi.fn().mockImplementation(() => ({
    session: {
      revoke: vi.fn(),
    },
  })),
  B2BProducts: {
    oauth: 'oauth',
  },
  AuthFlowType: {
    Discovery: 'Discovery',
  },
  B2BOAuthProviders: {
    Google: 'google',
  },
}));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => {
      mockNavigate(to);
      return null;
    }),
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockStytchClient = new StytchB2BUIClient('test-token', { env: 'test' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = (isAuthenticated = false, isLoading = false) => {
    const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const mockAuthContext = {
        member: isAuthenticated ? { email_address: 'test@example.com' } as any : null,
        session: isAuthenticated ? {} as any : null,
        isLoading,
        isAuthenticated,
        logout: vi.fn(),
      };

      return (
        <AuthProvider>
          {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child) : child
          )}
        </AuthProvider>
      );
    };

    return render(
      <BrowserRouter>
        <StytchB2BProvider stytch={mockStytchClient}>
          <MockAuthProvider>
            <Login />
          </MockAuthProvider>
        </StytchB2BProvider>
      </BrowserRouter>
    );
  };

  it('renders login page with welcome message', () => {
    renderLogin(false, false);
    
    expect(screen.getByText('Welcome to Main Site')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google to access federated content')).toBeInTheDocument();
  });

  it('renders Stytch B2B component', () => {
    renderLogin(false, false);
    
    expect(screen.getByTestId('stytch-b2b-component')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('shows loading state when authentication is in progress', () => {
    renderLogin(false, true);
    
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('redirects to home when already authenticated', () => {
    renderLogin(true, false);
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('renders terms and privacy policy links', () => {
    renderLogin(false, false);
    
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});