import axios from 'axios';
import { toast } from 'react-toastify';
import { tokenHelper } from '../storage/tokenHelper';
import { API_BASE_URL } from '../constants/api';

export const responseInterceptor = (response) => {
  return response.data;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const responseErrorInterceptor = async (error) => {
  const originalRequest = error.config;
  const status = error.response ? error.response.status : null;
  const message = error.response?.data?.messageToShow || error.response?.data?.errorMessage || error.response?.data?.message || 'Something went wrong';

  if (status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest).then((res) => res.data);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenHelper.getRefreshToken();
    if (refreshToken) {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        tokenHelper.setToken(newAccessToken);
        tokenHelper.setRefreshToken(newRefreshToken);

        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);

        return axios(originalRequest).then((res) => res.data);
      } catch (err) {
        processQueue(err, null);
        tokenHelper.clearAll();
        toast.error('Session expired. Please login again.');
        // Optional: window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    } else {
      tokenHelper.clearAll();
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }
  }

  if (status === 403 && !originalRequest?.url?.includes('/refresh-token')) {
    toast.error('You do not have permission to perform this action.', { toastId: '403-error' });
  } else if (status >= 500) {
    toast.error('Server error. Please try again later.', { toastId: '500-error' });
  } else if (error.message === 'Network Error') {
    toast.error('Network Error. Please check your connection.', { toastId: 'network-error' });
  } else if (status !== 404 && status !== 422 && status !== 401) {
    toast.error(message, { toastId: message });
  }

  if (error.response && error.response.data && typeof error.response.data === 'object') {
    error.response.data.message = message;
  }

  try {
    Object.defineProperty(error, 'message', {
      value: message,
      writable: true,
      configurable: true
    });
  } catch (e) {
    error.message = message;
  }

  return Promise.reject(error);
};
