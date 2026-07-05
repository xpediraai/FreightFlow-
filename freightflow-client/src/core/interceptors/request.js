import { tokenHelper } from '../storage/tokenHelper';

export const requestInterceptor = (config) => {
  const token = tokenHelper.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // You can add more headers or transform request data here
  
  return config;
};

export const requestErrorInterceptor = (error) => {
  return Promise.reject(error);
};
