import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRemoteAuth } from '../hooks/useRemoteAuth';
import { isUser, isAuthData, isAuthMessage } from '../types/auth';
import { isAllowedOrigin } from '../config/auth.config';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Authentication Type Guards', () => {
  describe('isUser', () => {
    it('validates correct user object', () => {
      const validUser = {
        email: 'test@example.com',
        memberId: 'member-123',
        organizationId: 'org-456',
      };
      expect(isUser(validUser)).toBe(true);
    });

    it('validates user without organizationId', () => {
      const validUser = {
        email: 'test@example.com',
        memberId: 'member-123',
      };
      expect(isUser(validUser)).toBe(true);
    });

    it('rejects invalid user objects', () => {
      expect(isUser(null)).toBe(false);
      expect(isUser(undefined)).toBe(false);
      expect(isUser({})).toBe(false);
      expect(isUser({ email: 'test@example.com' })).toBe(false);
      expect(isUser({ memberId: 'member-123' })).toBe(false);
      expect(isUser({ email: 123, memberId: 'member-123' })).toBe(false);
    });
  });

  describe('isAuthData', () => {
    it('validates correct auth data', () => {
      const validAuthData = {
        user: {
          email: 'test@example.com',
          memberId: 'member-123',
        },
        sessionToken: 'token-abc',
      };
      expect(isAuthData(validAuthData)).toBe(true);
    });

    it('rejects invalid auth data', () => {
      expect(isAuthData(null)).toBe(false);
      expect(isAuthData({})).toBe(false);
      expect(isAuthData({ user: null, sessionToken: 'token' })).toBe(false);
      expect(isAuthData({ user: { email: 'test' }, sessionToken: 'token' })).toBe(false);
    });
  });

  describe('isAuthMessage', () => {
    it('validates correct auth messages', () => {
      expect(isAuthMessage({ type: 'AUTH_UPDATE', user: null })).toBe(true);
      expect(isAuthMessage({ type: 'REQUEST_AUTH' })).toBe(true);
      expect(isAuthMessage({ 
        type: 'AUTH_RESPONSE', 
        user: { email: 'test@example.com', memberId: 'member-123' } 
      })).toBe(true);
    });

    it('rejects invalid auth messages', () => {
      expect(isAuthMessage(null)).toBe(false);
      expect(isAuthMessage({})).toBe(false);
      expect(isAuthMessage({ type: 'INVALID_TYPE' })).toBe(false);
      expect(isAuthMessage({ type: 'AUTH_UPDATE', user: 'invalid' })).toBe(false);
    });
  });
});

describe('Origin Validation', () => {
  it('allows localhost origins in development', () => {
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3001')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:3000')).toBe(true);
  });

  it('rejects unknown origins', () => {
    expect(isAllowedOrigin('http://evil.com')).toBe(false);
    expect(isAllowedOrigin('https://malicious.site')).toBe(false);
  });
});

describe('useRemoteAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useRemoteAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('loads auth from sessionStorage', () => {
    const authData = {
      user: {
        email: 'test@example.com',
        memberId: 'member-123',
        organizationId: 'org-456',
      },
      sessionToken: 'token-abc',
    };
    
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(authData));
    
    const { result } = renderHook(() => useRemoteAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(authData.user);
  });

  it('handles invalid sessionStorage data gracefully', () => {
    mockSessionStorage.getItem.mockReturnValue('invalid json');
    
    const { result } = renderHook(() => useRemoteAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('responds to AUTH_UPDATE messages from allowed origins', () => {
    const { result } = renderHook(() => useRemoteAuth());
    
    const user = {
      email: 'test@example.com',
      memberId: 'member-123',
    };
    
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'http://localhost:3000',
        data: { type: 'AUTH_UPDATE', user },
      }));
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it('ignores messages from unauthorized origins', () => {
    const { result } = renderHook(() => useRemoteAuth());
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'http://evil.com',
        data: { type: 'AUTH_UPDATE', user: { email: 'evil@evil.com', memberId: 'evil' } },
      }));
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Received message from unauthorized origin:',
      'http://evil.com'
    );
    
    consoleSpy.mockRestore();
  });

  it('handles storage events for cross-tab sync', () => {
    const { result } = renderHook(() => useRemoteAuth());
    
    const authData = {
      user: {
        email: 'test@example.com',
        memberId: 'member-123',
      },
      sessionToken: 'token-abc',
    };
    
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stytch_auth',
        newValue: JSON.stringify(authData),
      }));
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(authData.user);
  });

  it('handles logout via storage event', () => {
    const authData = {
      user: {
        email: 'test@example.com',
        memberId: 'member-123',
      },
      sessionToken: 'token-abc',
    };
    
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(authData));
    
    const { result } = renderHook(() => useRemoteAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stytch_auth',
        newValue: null,
      }));
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});