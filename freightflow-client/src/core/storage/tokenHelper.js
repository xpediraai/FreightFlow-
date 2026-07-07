import Cookies from 'js-cookie';

const TOKEN_KEY = 'freightflow_auth_token';
const REFRESH_TOKEN_KEY = 'freightflow_refresh_token';

// Configure default cookie options (secure if on HTTPS)
const cookieOptions = {
  expires: 7, // 7 days
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'lax'
};

export const tokenHelper = {
  getToken: () => Cookies.get(TOKEN_KEY),
  setToken: (token) => Cookies.set(TOKEN_KEY, token, cookieOptions),
  removeToken: () => Cookies.remove(TOKEN_KEY),
  
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => Cookies.set(REFRESH_TOKEN_KEY, token, cookieOptions),
  removeRefreshToken: () => Cookies.remove(REFRESH_TOKEN_KEY),
  
  clearAll: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }
};
