import { useCallback, useState } from 'react';
import { useStytchB2BClient } from '@stytch/react/b2b';
import { useNavigate } from 'react-router-dom';

interface AuthenticationResult {
  success: boolean;
  error?: string;
}

interface OrganizationInfo {
  organization_id?: string;
  organization_name?: string;
}

export const useStytchAuth = () => {
  const stytchClient = useStytchB2BClient();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleMagicLinkAuth = useCallback(
    async (token: string): Promise<AuthenticationResult> => {
      try {
        const response = await stytchClient.magicLinks.discovery.authenticate({
          discovery_magic_links_token: token,
        });

        if (response.status_code === 200) {
          if (response.intermediate_session_token) {
            return handleIntermediateSession(
              response.intermediate_session_token,
              response.discovered_organizations
            );
          }
          navigate('/', { replace: true });
          return { success: true };
        }
        return { success: false, error: 'Magic link authentication failed' };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.error_message || 'Magic link authentication failed' 
        };
      }
    },
    [stytchClient, navigate]
  );

  const handleOAuthAuth = useCallback(
    async (token: string): Promise<AuthenticationResult> => {
      try {
        const response = await stytchClient.oauth.discovery.authenticate({
          discovery_oauth_token: token,
        });

        if (response.status_code === 200) {
          if (response.intermediate_session_token) {
            return handleIntermediateSession(
              response.intermediate_session_token,
              response.discovered_organizations
            );
          }
          navigate('/', { replace: true });
          return { success: true };
        }
        return { success: false, error: 'OAuth authentication failed' };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.error_message || 'OAuth authentication failed' 
        };
      }
    },
    [stytchClient, navigate]
  );

  const handleIntermediateSession = useCallback(
    async (
      intermediateToken: string,
      organizations?: Array<{ organization?: OrganizationInfo }>
    ): Promise<AuthenticationResult> => {
      if (!organizations || organizations.length === 0) {
        return {
          success: false,
          error: 'No organization found for your account. Please contact your administrator.',
        };
      }

      if (organizations.length > 1) {
        return {
          success: false,
          error: 'Multiple organizations found. Organization selection UI not implemented.',
        };
      }

      const org = organizations[0];
      if (!org?.organization?.organization_id) {
        return {
          success: false,
          error: 'Invalid organization data',
        };
      }

      try {
        const exchangeResponse = await stytchClient.discovery.intermediateSessions.exchange({
          intermediate_session_token: intermediateToken,
          organization_id: org.organization.organization_id,
          session_duration_minutes: 60,
        });

        if (exchangeResponse.status_code === 200) {
          navigate('/', { replace: true });
          return { success: true };
        }
        return {
          success: false,
          error: 'Failed to exchange intermediate session for organization session',
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.error_message || 'Failed to join organization',
        };
      }
    },
    [stytchClient, navigate]
  );

  const authenticate = useCallback(
    async (token: string, tokenType?: string | null): Promise<void> => {
      setIsAuthenticating(true);
      setAuthError(null);

      let result: AuthenticationResult;

      // Check for magic links first
      if (
        tokenType === 'multi_tenant_magic_links' ||
        tokenType === 'discovery_magic_links' ||
        tokenType === 'magic_links'
      ) {
        result = await handleMagicLinkAuth(token);
      } else if (tokenType === 'discovery_oauth' || tokenType === 'oauth') {
        result = await handleOAuthAuth(token);
      } else {
        // Try magic link first, then OAuth
        result = await handleMagicLinkAuth(token);
        if (!result.success) {
          result = await handleOAuthAuth(token);
        }
      }

      if (!result.success) {
        setAuthError(result.error || 'Authentication failed');
      }

      setIsAuthenticating(false);
    },
    [handleMagicLinkAuth, handleOAuthAuth]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await stytchClient.session.revoke();
    } catch (error) {
      // Silently fail logout
    }
  }, [stytchClient]);

  return {
    authenticate,
    logout,
    isAuthenticating,
    authError,
    clearError: () => setAuthError(null),
  };
};