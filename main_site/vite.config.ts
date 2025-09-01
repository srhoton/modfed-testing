import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const federatedSiteUrl = env.VITE_FEDERATED_SITE_URL || 'http://localhost:3001';
  
  return {
  plugins: [
    react(),
    federation({
      name: 'main-site',
      remotes: {
        'fed-site': `${federatedSiteUrl}/assets/remoteEntry.js`,
      },
      exposes: {
        // Components that this app exposes to other apps
        // We'll add exposed components as we create them
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        zustand: {
          singleton: true,
          requiredVersion: '^4.0.0',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  };
});