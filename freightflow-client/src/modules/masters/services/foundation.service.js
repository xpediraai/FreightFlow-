import api from '../../../core/api/axios/instance';

export const foundationService = {
  // --- Country ---
  getCountries: (params) => api.get('/country', { params }),
  getCountryById: (id) => api.get(`/country/${id}`),
  createCountry: (data) => api.post('/country', data),
  updateCountry: (id, data) => api.put(`/country/${id}`, data),
  deleteCountry: (id) => api.delete(`/country/${id}`),

  // --- State ---
  getStates: (params) => api.get('/state', { params }),
  getStateById: (id) => api.get(`/state/${id}`),
  createState: (data) => api.post('/state', data),
  updateState: (id, data) => api.put(`/state/${id}`, data),
  deleteState: (id) => api.delete(`/state/${id}`),

  // --- City ---
  getCities: (params) => api.get('/city', { params }),
  getCityById: (id) => api.get(`/city/${id}`),
  createCity: (data) => api.post('/city', data),
  updateCity: (id, data) => api.put(`/city/${id}`, data),
  deleteCity: (id) => api.delete(`/city/${id}`),

  // --- Currency ---
  getCurrencies: (params) => api.get('/currency', { params }),
  getCurrencyById: (id) => api.get(`/currency/${id}`),
  createCurrency: (data) => api.post('/currency', data),
  updateCurrency: (id, data) => api.put(`/currency/${id}`, data),
  deleteCurrency: (id) => api.delete(`/currency/${id}`),

  // --- Payment Term ---
  getPaymentTerms: (params) => api.get('/payment-term', { params }),
  getPaymentTermById: (id) => api.get(`/payment-term/${id}`),
  createPaymentTerm: (data) => api.post('/payment-term', data),
  updatePaymentTerm: (id, data) => api.put(`/payment-term/${id}`, data),
  deletePaymentTerm: (id) => api.delete(`/payment-term/${id}`),
};
