import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';
import { requestInterceptor, requestErrorInterceptor } from '../../interceptors/request';
import { responseInterceptor, responseErrorInterceptor } from '../../interceptors/response';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptors
axiosInstance.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

// Response Interceptors
axiosInstance.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export default axiosInstance;
