import React from 'react';

export interface FederatedCardProps {
  title: string;
  description?: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

const FederatedCard: React.FC<FederatedCardProps> = ({ 
  title, 
  description, 
  icon = '📦', 
  onClick 
}) => {
  return (
    <div 
      data-testid="federated-card"
      onClick={onClick}
      role="button"
    >
      <span>{icon}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};

export default FederatedCard;