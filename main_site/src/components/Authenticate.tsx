import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStytchB2BClient } from '@stytch/react/b2b';
import { useAuth } from '@/contexts/AuthContext';

export const Authenticate: React.FC = () => {
  const navigate = useNavigate();
  const stytchClient = useStytchB2BClient();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async (): Promise<void> => {
      try {
        // Get all URL params for debugging
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const tokenType = params.get('stytch_token_type');
        
        // Log all params for debugging


        if (!token) {
          // Check if we're coming back from OAuth (which might not have a token param)
          const pkceCodeVerifier = params.get('pkce_code_verifier');
          if (pkceCodeVerifier) {
            // This is an OAuth callback, the session should already be set
            // Just redirect to home
            setTimeout(() => navigate('/', { replace: true }), 100);
            return;
          }
          
          setError('No authentication token found');
          return;
        }

        // Handle different token types for B2B Discovery flow
        // The token type tells us which authentication method to use
        // Check for magic links first (they might have 'discovery' as token type)
        if (tokenType === 'multi_tenant_magic_links' || tokenType === 'discovery_magic_links' || tokenType === 'magic_links') {
          // ('Processing discovery magic link token with type:', tokenType);
          // Magic link tokens in B2B discovery flow
          try {
            const response = await stytchClient.magicLinks.discovery.authenticate({
              discovery_magic_links_token: token,
            });
            // ('Discovery magic link authentication response:', response);
            
            
            if (response.status_code === 200) {
              // ('Magic link discovery authentication successful');
              
              // Check if we have an intermediate session token (need to select/create org)
              if (response.intermediate_session_token) {
                // ('Got intermediate session token from magic link, need to exchange for organization session');
                
                // Handle organization selection
                if (response.discovered_organizations && response.discovered_organizations.length === 1) {
                  const org = response.discovered_organizations[0];
                  // ('Auto-selecting organization:', org?.organization?.organization_name);
                  
                  try {
                    const exchangeResponse = await stytchClient.discovery.intermediateSessions.exchange({
                      intermediate_session_token: response.intermediate_session_token,
                      organization_id: org?.organization?.organization_id || '',
                      session_duration_minutes: 60,
                    });
                    
                    // ('Organization exchange response:', exchangeResponse);
                    
                    if (exchangeResponse.status_code === 200) {
                      // ('Successfully exchanged for organization session');
                      navigate('/', { replace: true });
                    } else {
                      setError('Failed to exchange intermediate session for organization session');
                    }
                  } catch (exchangeError: any) {
                    
                    setError(exchangeError.error_message || 'Failed to join organization');
                  }
                } else if (response.discovered_organizations && response.discovered_organizations.length > 1) {
                  // ('Multiple organizations found, need user selection');
                  setError('Multiple organizations found. Organization selection UI not implemented.');
                } else {
                  // ('No organizations found for this user');
                  setError('No organization found for your account. Please contact your administrator to be added to an organization.');
                }
              } else {
                // Direct session without intermediate token
                // ('Direct session received from magic link, navigating to home');
                navigate('/', { replace: true });
              }
            } else {
              setError('Magic link authentication succeeded but no session was created');
            }
          } catch (magicLinkError: any) {
            
            setError(magicLinkError.error_message || 'Magic link authentication failed');
          }
        } else if (tokenType === 'discovery_oauth' || tokenType === 'oauth') {
          // ('Processing discovery OAuth token...');
          // For B2B discovery flow with OAuth
          try {
            const response = await stytchClient.oauth.discovery.authenticate({
              discovery_oauth_token: token,
            });
            // ('OAuth discovery authentication response:', response);
            
            if (response.status_code === 200) {
              // ('OAuth discovery authentication successful');
              
              // Check if we have an intermediate session token (need to select/create org)
              if (response.intermediate_session_token) {
                // ('Got intermediate session token from magic link, need to exchange for organization session');
                
                // Handle organization selection/creation
                if (response.discovered_organizations && response.discovered_organizations.length === 1) {
                  const org = response.discovered_organizations[0];
                  // ('Auto-selecting organization:', org?.organization?.organization_name);
                  
                  try {
                    const exchangeResponse = await stytchClient.discovery.intermediateSessions.exchange({
                      intermediate_session_token: response.intermediate_session_token,
                      organization_id: org?.organization?.organization_id || '',
                      session_duration_minutes: 60,
                    });
                    
                    // ('Organization exchange response:', exchangeResponse);
                    
                    if (exchangeResponse.status_code === 200) {
                      // ('Successfully exchanged for organization session');
                      navigate('/', { replace: true });
                    } else {
                      setError('Failed to exchange intermediate session for organization session');
                    }
                  } catch (exchangeError: any) {
                    
                    setError(exchangeError.error_message || 'Failed to join organization');
                  }
                } else if (response.discovered_organizations && response.discovered_organizations.length > 1) {
                  // ('Multiple organizations found, need user selection');
                  setError('Multiple organizations found. Organization selection UI not implemented.');
                } else {
                  // ('No organizations found for this user');
                  setError('No organization found for your account. Please contact your administrator to be added to an organization.');
                }
              } else {
                // Direct session without intermediate token
                // ('Direct session received from magic link, navigating to home');
                navigate('/', { replace: true });
              }
            } else {
              setError('Magic link authentication succeeded but no session was created');
            }
          } catch (magicLinkError: any) {
            
            setError(magicLinkError.error_message || 'Magic link authentication failed');
          }
        } else {
          // Unknown token type - try magic link first, then OAuth
          // ('Unknown token type:', tokenType, '- attempting magic link authentication first');
          
          try {
            // Try magic link first (more common for email-based auth)
            const response = await stytchClient.magicLinks.discovery.authenticate({
              discovery_magic_links_token: token,
            });
            // ('Magic link authentication response:', response);
            
            if (response.status_code === 200) {
              // ('Magic link authentication successful');
              
              // Handle intermediate session
              if (response.intermediate_session_token) {
                // ('Got intermediate session token, need to exchange for organization session');
                
                if (response.discovered_organizations && response.discovered_organizations.length === 1) {
                  const org = response.discovered_organizations[0];
                  // ('Auto-selecting organization:', org?.organization?.organization_name);
                  
                  try {
                    const exchangeResponse = await stytchClient.discovery.intermediateSessions.exchange({
                      intermediate_session_token: response.intermediate_session_token,
                      organization_id: org?.organization?.organization_id || '',
                      session_duration_minutes: 60,
                    });
                    
                    if (exchangeResponse.status_code === 200) {
                      // ('Successfully exchanged for organization session');
                      navigate('/', { replace: true });
                    } else {
                      setError('Failed to exchange intermediate session');
                    }
                  } catch (exchangeError: any) {
                    
                    setError(exchangeError.error_message || 'Failed to join organization');
                  }
                } else if (response.discovered_organizations && response.discovered_organizations.length > 1) {
                  setError('Multiple organizations found. Organization selection UI not implemented.');
                } else {
                  setError('No organization found for your account. Please contact your administrator.');
                }
              } else {
                navigate('/', { replace: true });
              }
            } else {
              throw new Error('Magic link authentication failed');
            }
          } catch (magicLinkError: any) {
            
            
            // If magic link fails, try OAuth
            try {
              const oauthResponse = await stytchClient.oauth.discovery.authenticate({
                discovery_oauth_token: token,
              });
              // ('OAuth authentication response:', oauthResponse);
              
              if (oauthResponse.status_code === 200) {
                // Handle OAuth response same as above
                if (oauthResponse.intermediate_session_token) {
                  // Handle intermediate session (same logic as magic link)
                  if (oauthResponse.discovered_organizations && oauthResponse.discovered_organizations.length === 1) {
                    const org = oauthResponse.discovered_organizations[0];
                    const exchangeResponse = await stytchClient.discovery.intermediateSessions.exchange({
                      intermediate_session_token: oauthResponse.intermediate_session_token,
                      organization_id: org?.organization?.organization_id || '',
                      session_duration_minutes: 60,
                    });
                    
                    if (exchangeResponse.status_code === 200) {
                      navigate('/', { replace: true });
                    } else {
                      setError('Failed to exchange intermediate session');
                    }
                  } else if (oauthResponse.discovered_organizations && oauthResponse.discovered_organizations.length > 1) {
                    setError('Multiple organizations found. Organization selection UI not implemented.');
                  } else {
                    setError('No organization found for your account. Please contact your administrator.');
                  }
                } else {
                  navigate('/', { replace: true });
                }
              } else {
                setError(`Authentication failed for token type: ${tokenType}`);
              }
            } catch (oauthError: any) {
              
              setError(`Authentication failed. Token type '${tokenType}' not supported.`);
            }
          }
        }
      } catch (err) {
        
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    if (!isAuthenticated) {
      handleAuthentication();
    } else {
      navigate('/', { replace: true });
    }
  }, [stytchClient, navigate, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Authentication Failed
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
};