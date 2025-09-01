import { vi } from 'vitest';
import type { User } from '../../types/auth';

export const mockUser: User = {
  email: 'test@example.com',
  memberId: 'member-123',
  organizationId: 'org-456',
};

export const mockUseRemoteAuth = vi.fn(() => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
}));

export const mockUseRemoteAuthUnauthenticated = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
}));

export const mockUseRemoteAuthLoading = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
}));