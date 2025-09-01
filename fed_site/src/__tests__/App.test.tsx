import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '@/App';

// Mock console.log for testing
const consoleSpy = vi.spyOn(console, 'log');

describe('App', () => {
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
    
    // Check for content from FederatedContent component
    const moduleDemo = screen.getByRole('heading', { 
      name: /module federation demo/i 
    });
    
    expect(moduleDemo).toBeInTheDocument();
  });

  it('renders all three FederatedCard components', () => {
    render(<App />);
    
    expect(screen.getByText('Component 1')).toBeInTheDocument();
    expect(screen.getByText('Component 2')).toBeInTheDocument();
    expect(screen.getByText('Component 3')).toBeInTheDocument();
  });

  it('handles card clicks correctly', () => {
    render(<App />);
    
    const component1Card = screen.getByText('Component 1').closest('[role="button"]');
    if (component1Card) {
      fireEvent.click(component1Card);
      expect(consoleSpy).toHaveBeenCalledWith('Clicked on Component 1 card from federated site');
    }
  });

  it('displays port information', () => {
    render(<App />);
    
    const portInfo = screen.getByText(/this application runs on/i);
    expect(portInfo).toBeInTheDocument();
    
    const portNumber = screen.getByText(/http:\/\/localhost:3001/i);
    expect(portNumber).toBeInTheDocument();
  });

  it('shows information about exposed components', () => {
    render(<App />);
    
    const info = screen.getByText(/exposes components that can be consumed by the main site/i);
    expect(info).toBeInTheDocument();
  });

  it('renders with proper layout classes', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.min-h-screen');
    expect(appContainer).toBeInTheDocument();
    
    const maxWidthContainer = container.querySelector('.max-w-6xl');
    expect(maxWidthContainer).toBeInTheDocument();
  });

  it('renders cards in a responsive grid', () => {
    const { container } = render(<App />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.classList.contains('grid-cols-1')).toBe(true);
    expect(grid?.classList.contains('md:grid-cols-2')).toBe(true);
    expect(grid?.classList.contains('lg:grid-cols-3')).toBe(true);
  });

  it('displays correct icons for each card', () => {
    render(<App />);
    
    expect(screen.getByText('🎨')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });
});