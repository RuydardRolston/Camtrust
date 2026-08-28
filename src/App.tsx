/**
 * CamTrust Application Root
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import AppRoutes from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <AppRoutes />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
