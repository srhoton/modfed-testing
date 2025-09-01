import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederatedCard } from '@/components/FederatedCard';

// Mock the useRemoteAuth hook
vi.mock('@/hooks/useRemoteAuth', () => ({
  useRemoteAuth: vi.fn(),
}));

import { useRemoteAuth } from '@/hooks/useRemoteAuth';

describe('FederatedCard', () => {
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

  it('renders with required props', () => {
    render(<FederatedCard title="Test Card" />);
    
    const title = screen.getByRole('heading', { 
      name: /test card/i 
    });
    
    expect(title).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    const description = 'This is a test description';
    render(<FederatedCard title="Test Card" description={description} />);
    
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const customIcon = '🚀';
    render(<FederatedCard title="Test Card" icon={customIcon} />);
    
    expect(screen.getByText(customIcon)).toBeInTheDocument();
  });

  it('renders with default icon when not provided', () => {
    render(<FederatedCard title="Test Card" />);
    
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<FederatedCard title="Test Card" onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard events (Enter key)', () => {
    const handleClick = vi.fn();
    render(<FederatedCard title="Test Card" onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard events (Space key)', () => {
    const handleClick = vi.fn();
    render(<FederatedCard title="Test Card" onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not trigger click on other keys', () => {
    const handleClick = vi.fn();
    render(<FederatedCard title="Test Card" onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Tab' });
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays federated component badge', () => {
    render(<FederatedCard title="Test Card" />);
    
    const badge = screen.getByText('Federated Component');
    expect(badge).toBeInTheDocument();
  });

  it('displays secured badge when authenticated', () => {
    render(<FederatedCard title="Test Card" />);
    
    const securedBadge = screen.getByText('✓ Secured');
    expect(securedBadge).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <FederatedCard title="Test Card" className={customClass} />
    );
    
    const card = container.querySelector('[role="button"]') as HTMLElement;
    expect(card.classList.contains(customClass)).toBe(true);
  });

  it('is keyboard accessible with tabIndex', () => {
    render(<FederatedCard title="Test Card" />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('prevents default on Enter and Space keys', () => {
    const handleClick = vi.fn();
    render(<FederatedCard title="Test Card" onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    
    const enterEvent = new KeyboardEvent('keydown', { 
      key: 'Enter',
      bubbles: true 
    });
    const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');
    
    card.dispatchEvent(enterEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
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
      render(<FederatedCard title="Test Card" />);
      
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('You must be authenticated to view this content.')).toBeInTheDocument();
    });

    it('does not show card content', () => {
      render(<FederatedCard title="Test Card" description="Test description" />);
      
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('does not show secured badge', () => {
      render(<FederatedCard title="Test Card" />);
      
      expect(screen.queryByText('✓ Secured')).not.toBeInTheDocument();
    });
  });
});