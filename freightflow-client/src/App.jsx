import React from 'react';
import AppRouter from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ERPProvider } from './contexts/ERPContext';

function App() {
  return (
    <AuthProvider>
      <ERPProvider>
        <AppRouter />
      </ERPProvider>
    </AuthProvider>
  );
}

export default App;

