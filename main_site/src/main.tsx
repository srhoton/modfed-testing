import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import App from './App';
import { Login } from './components/Login';
import { Authenticate } from './components/Authenticate';
import { AuthProvider } from './contexts/AuthContext';
import { STYTCH_PUBLIC_TOKEN } from './config/stytch';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const stytchClient = new StytchB2BUIClient(STYTCH_PUBLIC_TOKEN);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <StytchB2BProvider stytch={stytchClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/authenticate" element={<Authenticate />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StytchB2BProvider>
  </React.StrictMode>
);