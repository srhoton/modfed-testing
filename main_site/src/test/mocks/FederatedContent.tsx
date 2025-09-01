import React from 'react';

export interface FederatedContentProps {
  title?: string;
  message?: string;
  className?: string;
}

const FederatedContent: React.FC<FederatedContentProps> = ({ title = 'Federated Content', message }) => {
  return (
    <div data-testid="federated-content">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FederatedContent;