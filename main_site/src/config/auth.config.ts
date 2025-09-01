// Allowed origins for message communication
export const ALLOWED_ORIGINS = 
  import.meta.env.MODE === 'production'
    ? [
        'https://yourdomain.com', // Replace with your production domain
        'https://app.yourdomain.com',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

export function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}

// Stytch configuration
export const STYTCH_PUBLIC_TOKEN = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || 'public-token-test-22ca9034-7007-430c-b118-3847c7617e3e';