import { toast } from 'react-toastify';
import { tokenHelper } from '../storage/tokenHelper';

export const responseInterceptor = (response) => {
  return response.data;
};

export const responseErrorInterceptor = (error) => {
  const status = error.response ? error.response.status : null;
  const message = error.response?.data?.messageToShow || error.response?.data?.errorMessage || error.response?.data?.message || 'Something went wrong';

  if (status === 401) {
    // Handle unauthorized - usually clear token and redirect to login
    tokenHelper.clearAll();
    toast.error('Session expired. Please login again.');
    // Optional: window.location.href = '/login';
  } else if (status === 403) {
    toast.error('You do not have permission to perform this action.');
  } else if (status >= 500) {
    toast.error('Server error. Please try again later.');
  } else if (error.message === 'Network Error') {
    toast.error('Network Error. Please check your connection.');
  } else if (status !== 404 && status !== 422) {
    toast.error(message);
  }

  error.message = message;
  return Promise.reject(error);
};
