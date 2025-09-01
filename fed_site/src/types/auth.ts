export interface User {
  email: string;
  memberId: string;
  organizationId?: string;
}

export interface AuthData {
  user: User;
  sessionToken: string;
}

export interface AuthMessage {
  type: 'AUTH_UPDATE' | 'REQUEST_AUTH' | 'AUTH_RESPONSE';
  user?: User | null;
}

// Type guards
export function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'email' in data &&
    'memberId' in data &&
    typeof (data as any).email === 'string' &&
    typeof (data as any).memberId === 'string'
  );
}

export function isAuthData(data: unknown): data is AuthData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as any;
  return (
    'user' in obj &&
    'sessionToken' in obj &&
    isUser(obj.user) &&
    typeof obj.sessionToken === 'string'
  );
}

export function isAuthMessage(data: unknown): data is AuthMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as any;
  return (
    'type' in obj &&
    (obj.type === 'AUTH_UPDATE' || obj.type === 'REQUEST_AUTH' || obj.type === 'AUTH_RESPONSE') &&
    (obj.user === undefined || obj.user === null || isUser(obj.user))
  );
}