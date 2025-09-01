import { B2BProducts, AuthFlowType, B2BOAuthProviders } from '@stytch/vanilla-js/b2b';
import type { StytchB2BUIConfig } from '@stytch/vanilla-js';

export const STYTCH_PUBLIC_TOKEN = import.meta.env['VITE_STYTCH_PUBLIC_TOKEN'] || '';
export const STYTCH_PROJECT_ENV = import.meta.env['VITE_STYTCH_PROJECT_ENV'] || 'test';
export const APP_URL = import.meta.env['VITE_APP_URL'] || 'http://localhost:3000';

if (!STYTCH_PUBLIC_TOKEN) {
  throw new Error('VITE_STYTCH_PUBLIC_TOKEN is required');
}

export const stytchConfig: StytchB2BUIConfig = {
  products: [B2BProducts.oauth, B2BProducts.emailMagicLinks],
  authFlowType: AuthFlowType.Discovery,
  emailMagicLinksOptions: {
    discoveryRedirectURL: `${APP_URL}/authenticate`,
  },
  oauthOptions: {
    discoveryRedirectURL: `${APP_URL}/authenticate`,
    loginRedirectURL: `${APP_URL}/authenticate`,
    signupRedirectURL: `${APP_URL}/authenticate`,
    providers: [
      {
        type: B2BOAuthProviders.Google,
        one_tap: false, // Disable one_tap for now to ensure button shows
      },
    ],
  },
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
};