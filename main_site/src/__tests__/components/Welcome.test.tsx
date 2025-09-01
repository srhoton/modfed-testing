import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Welcome } from '../../components/Welcome';

describe('Welcome', () => {
  it('renders the welcome heading', () => {
    render(<Welcome />);
    
    const heading = screen.getByRole('heading', { 
      name: /welcome to the main site/i 
    });
    
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Welcome />);
    
    const description = screen.getByText(
      /this is the host application for module federation/i
    );
    
    expect(description).toBeInTheDocument();
  });

  it('renders the module federation ready section', () => {
    render(<Welcome />);
    
    const subheading = screen.getByRole('heading', { 
      name: /module federation ready/i 
    });
    
    expect(subheading).toBeInTheDocument();
    
    const info = screen.getByText(
      /this application is configured to host federated modules/i
    );
    
    expect(info).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    const { container } = render(<Welcome className={customClass} />);
    
    const welcomeDiv = container.firstChild as HTMLElement;
    
    expect(welcomeDiv.classList.contains(customClass)).toBe(true);
  });

  it('renders with proper structure', () => {
    const { container } = render(<Welcome />);
    
    // Check for main container
    const mainContainer = container.querySelector('.flex.flex-col.items-center');
    expect(mainContainer).toBeInTheDocument();
    
    // Check for max-width container
    const contentContainer = container.querySelector('.max-w-4xl');
    expect(contentContainer).toBeInTheDocument();
    
    // Check for info card
    const infoCard = container.querySelector('.bg-gray-100');
    expect(infoCard).toBeInTheDocument();
  });
});