import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '@/App';

// Mock all auth-related modules
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useRemoteAuth', () => ({
  useRemoteAuth: vi.fn(),
}));

// Import mocked functions
import { useAuth } from '@/contexts/AuthContext';
import { useRemoteAuth } from '@/hooks/useRemoteAuth';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      const authenticatedState = {
        user: { 
          email: 'test@example.com', 
          memberId: 'member-123', 
          organizationId: 'org-456' 
        },
        isAuthenticated: true,
        isLoading: false,
      };

      (useAuth as any).mockReturnValue(authenticatedState);
      (useRemoteAuth as any).mockReturnValue(authenticatedState);
    });

    it('renders without crashing', () => {
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });

    it('renders the main heading', () => {
      render(<App />);
      const heading = screen.getByRole('heading', { 
        name: /federated site \(remote application\)/i 
      });
      expect(heading).toBeInTheDocument();
    });

    it('renders the FederatedContent component', () => {
      render(<App />);
      // Check for the gradient background that FederatedContent has
      const federatedContent = document.querySelector('.bg-gradient-to-r');
      expect(federatedContent).toBeInTheDocument();
    });

    it('displays user email when authenticated', () => {
      render(<App />);
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('shows authenticated badges', () => {
      render(<App />);
      const authenticatedBadges = screen.getAllByText(/✓/);
      expect(authenticatedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      const unauthenticatedState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      (useAuth as any).mockReturnValue(unauthenticatedState);
      (useRemoteAuth as any).mockReturnValue(unauthenticatedState);
    });

    it('shows authentication required messages', () => {
      render(<App />);
      const authMessages = screen.getAllByText('Authentication Required');
      expect(authMessages.length).toBeGreaterThan(0);
    });

    it('shows login instruction', () => {
      render(<App />);
      const loginMessages = screen.getAllByText('Please log in through the main application.');
      expect(loginMessages.length).toBeGreaterThan(0);
    });

    it('does not show user email', () => {
      render(<App />);
      expect(screen.queryByText(/test@example.com/)).not.toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    beforeEach(() => {
      const loadingState = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
      };

      (useAuth as any).mockReturnValue(loadingState);
      (useRemoteAuth as any).mockReturnValue(loadingState);
    });

    it('renders the app container while loading', () => {
      render(<App />);
      const heading = screen.getByRole('heading', { 
        name: /federated site \(remote application\)/i 
      });
      expect(heading).toBeInTheDocument();
    });
  });
});