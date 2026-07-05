import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenHelper } from '../core/storage/tokenHelper';
import { localStorageHelper } from '../core/storage/localStorage';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Hydrate session on mount
  useEffect(() => {
    const initAuth = () => {
      const token = tokenHelper.getToken();
      const storedUser = localStorageHelper.get('freightflow_user');
      
      if (token && storedUser) {
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
      } else {
        tokenHelper.clearAll();
        localStorageHelper.remove('freightflow_user');
      }
      setIsInitializing(false);
    };

    initAuth();
  }, []);

  const login = useCallback((user, token, refreshToken = null) => {
    // Set tokens
    tokenHelper.setToken(token);
    if (refreshToken) {
      tokenHelper.setRefreshToken(refreshToken);
    }
    
    // Set user info
    localStorageHelper.set('freightflow_user', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    toast.success('Successfully logged in');
  }, []);

  const logout = useCallback(() => {
    tokenHelper.clearAll();
    localStorageHelper.remove('freightflow_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    isInitializing,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};
