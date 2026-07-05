import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStorageHelper } from '../../../core/storage/localStorage';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    sidebarExpanded: true,
    defaultView: 'table', // 'table' or 'card'
    theme: 'light',
  });

  useEffect(() => {
    const storedPrefs = localStorageHelper.get('freightflow_admin_prefs');
    if (storedPrefs) {
      setPreferences(storedPrefs);
    }
  }, []);

  const updatePreference = (key, value) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value };
      localStorageHelper.set('freightflow_admin_prefs', newPrefs);
      return newPrefs;
    });
  };

  const value = {
    preferences,
    updatePreference
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
