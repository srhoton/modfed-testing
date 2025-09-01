import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FederatedContent } from '@/components/FederatedContent';

describe('FederatedContent', () => {
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
    
    const contentDiv = container.firstChild as HTMLElement;
    expect(contentDiv.classList.contains(customClass)).toBe(true);
  });

  it('displays all information badges', () => {
    render(<FederatedContent />);
    
    expect(screen.getByText('Remote Module')).toBeInTheDocument();
    expect(screen.getByText('Port: 3001')).toBeInTheDocument();
    expect(screen.getByText('fed-site')).toBeInTheDocument();
  });
});