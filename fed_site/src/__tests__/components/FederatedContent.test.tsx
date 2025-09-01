import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederatedContent } from '@/components/FederatedContent';

// Mock the useRemoteAuth hook
vi.mock('@/hooks/useRemoteAuth', () => ({
  useRemoteAuth: vi.fn(),
}));

import { useRemoteAuth } from '@/hooks/useRemoteAuth';

describe('FederatedContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up authenticated state by default
    (useRemoteAuth as any).mockReturnValue({
      user: { 
        email: 'test@example.com', 
        memberId: 'member-123', 
        organizationId: 'org-456' 
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders with default title', () => {
    render(<FederatedContent />);
    
    const heading = screen.getByRole('heading', { 
      name: /federated component/i 
    });
    
    expect(heading).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const customTitle = 'Custom Module Title';
    render(<FederatedContent title={customTitle} />);
    
    const heading = screen.getByRole('heading', { 
      name: customTitle 
    });
    
    expect(heading).toBeInTheDocument();
  });

  it('displays federated site message', () => {
    render(<FederatedContent />);
    
    const message = screen.getByText(/this content is coming from the/i);
    expect(message).toBeInTheDocument();
    
    const siteText = screen.getByText(/federated site/i);
    expect(siteText).toBeInTheDocument();
  });

  it('shows module federation description', () => {
    render(<FederatedContent />);
    
    const description = screen.getByText(
      /this component is loaded dynamically via module federation/i
    );
    
    expect(description).toBeInTheDocument();
  });

  it('displays port information', () => {
    render(<FederatedContent />);
    
    const portInfo = screen.getByText(/port: 3001/i);
    expect(portInfo).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    const { container } = render(<FederatedContent className={customClass} />);
    
    // Find the gradient div within the structure
    const gradientDiv = container.querySelector('.bg-gradient-to-r');
    expect(gradientDiv?.classList.contains(customClass)).toBe(true);
  });

  it('displays all information badges', () => {
    render(<FederatedContent />);
    
    expect(screen.getByText('Remote Module')).toBeInTheDocument();
    expect(screen.getByText('Port: 3001')).toBeInTheDocument();
    expect(screen.getByText('fed-site')).toBeInTheDocument();
  });

  it('displays authenticated user email', () => {
    render(<FederatedContent />);
    
    expect(screen.getByText(/authenticated as: test@example.com/i)).toBeInTheDocument();
  });

  it('displays authenticated badge when user is authenticated', () => {
    render(<FederatedContent />);
    
    expect(screen.getByText('✓ Authenticated')).toBeInTheDocument();
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      (useRemoteAuth as any).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('shows authentication required message', () => {
      render(<FederatedContent />);
      
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('You must be authenticated to view this content.')).toBeInTheDocument();
    });

    it('does not show federated content', () => {
      render(<FederatedContent />);
      
      expect(screen.queryByText(/this content is coming from the/i)).not.toBeInTheDocument();
    });
  });
});