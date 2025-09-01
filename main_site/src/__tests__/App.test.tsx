import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: vi.fn(({ to }) => {
      mockNavigate(to);
      return null;
    }),
  };
});

// Mock Stytch
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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = (isAuthenticated = false, member: any = null) => {
    mockUseStytchMemberSession.mockReturnValue({
      session: isAuthenticated ? { member_session_id: 'test-session' } : null,
      isInitialized: true,
      fromCache: false,
    });
    
    mockUseStytchMember.mockReturnValue({
      member: isAuthenticated ? member : null,
      isInitialized: true,
      fromCache: false,
    });

    const mockStytchClientInstance = new StytchB2BUIClient('test-token', { env: 'test' });

    return render(
      <BrowserRouter>
        <StytchB2BProvider stytch={mockStytchClientInstance}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </StytchB2BProvider>
      </BrowserRouter>
    );
  };

  it('redirects to login when not authenticated', () => {
    renderApp(false);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows loading state while checking authentication', () => {
    const { useStytchMemberSession, useStytchMember } = require('@stytch/react/b2b');
    
    useStytchMemberSession.mockReturnValue({
      session: null,
      isInitialized: false,
      fromCache: false,
    });
    
    useStytchMember.mockReturnValue({
      member: null,
      isInitialized: false,
      fromCache: false,
    });

    const { container } = renderApp(false);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders authenticated user interface', () => {
    const member = {
      email_address: 'test@example.com',
      member_id: 'member-123',
    };
    
    renderApp(true, member);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Authenticated via Google OAuth')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('shows authentication success message', () => {
    renderApp(true, { email_address: 'test@example.com' });
    
    expect(screen.getByText('✓ You are authenticated and can access federated content')).toBeInTheDocument();
  });

  it('renders the Welcome component when authenticated', () => {
    renderApp(true, { email_address: 'test@example.com' });
    
    const heading = screen.getByRole('heading', { 
      name: /welcome to the main site/i 
    });
    
    expect(heading).toBeInTheDocument();
  });

  it('shows/hides federated content on button click', async () => {
    renderApp(true, { email_address: 'test@example.com' });
    
    // Initially federated content should not be visible
    expect(screen.queryByText('Federated Content')).not.toBeInTheDocument();
    
    // Click to show federated content
    const toggleButton = screen.getByText('Show Federated Components');
    fireEvent.click(toggleButton);
    
    // Wait for lazy-loaded components
    await waitFor(() => {
      expect(screen.getByText('Federated Content')).toBeInTheDocument();
      expect(screen.getByText('Federated Card: Dynamic Card 1')).toBeInTheDocument();
    });
    
    // Click to hide federated content
    fireEvent.click(screen.getByText('Hide Federated Components'));
    
    await waitFor(() => {
      expect(screen.queryByText('Federated Content')).not.toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    renderApp(true, { email_address: 'test@example.com' });
    
    const logoutButton = screen.getByText('Sign Out');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockStytchClient.session.revoke).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays user avatar with first letter of email', () => {
    renderApp(true, { email_address: 'test@example.com' });
    
    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();
    expect(avatar.parentElement).toHaveClass('bg-primary-600');
  });

  it('applies correct dark mode classes', () => {
    const { container } = renderApp(true, { email_address: 'test@example.com' });
    
    const appContainer = container.querySelector('.min-h-screen');
    expect(appContainer).toHaveClass('bg-white', 'dark:bg-gray-900', 'transition-colors');
  });
});