import { localStorageHelper } from './localStorage';

const TOKEN_KEY = 'freightflow_auth_token';
const REFRESH_TOKEN_KEY = 'freightflow_refresh_token';

export const tokenHelper = {
  getToken: () => localStorageHelper.get(TOKEN_KEY),
  setToken: (token) => localStorageHelper.set(TOKEN_KEY, token),
  removeToken: () => localStorageHelper.remove(TOKEN_KEY),
  
  getRefreshToken: () => localStorageHelper.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorageHelper.set(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorageHelper.remove(REFRESH_TOKEN_KEY),
  
  clearAll: () => {
    localStorageHelper.remove(TOKEN_KEY);
    localStorageHelper.remove(REFRESH_TOKEN_KEY);
  }
};
