declare module 'fed-site/FederatedContent' {
  import { FC } from 'react';
  
  export interface FederatedContentProps {
    title?: string;
    className?: string;
  }
  
  const FederatedContent: FC<FederatedContentProps>;
  export default FederatedContent;
}

declare module 'fed-site/FederatedCard' {
  import { FC } from 'react';
  
  export interface FederatedCardProps {
    title: string;
    description?: string;
    icon?: string;
    onClick?: () => void;
    className?: string;
  }
  
  const FederatedCard: FC<FederatedCardProps>;
  export default FederatedCard;
}