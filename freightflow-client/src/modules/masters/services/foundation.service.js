import api from '../../../core/api/axios/instance';

export const foundationService = {
  // --- Country ---
  getCountries: () => api.get('/country'),
  getCountryById: (id) => api.get(`/country/${id}`),
  createCountry: (data) => api.post('/country', data),
  updateCountry: (id, data) => api.put(`/country/${id}`, data),
  deleteCountry: (id) => api.delete(`/country/${id}`),

  // --- State ---
  getStates: () => api.get('/state'),
  getStateById: (id) => api.get(`/state/${id}`),
  createState: (data) => api.post('/state', data),
  updateState: (id, data) => api.put(`/state/${id}`, data),
  deleteState: (id) => api.delete(`/state/${id}`),

  // --- City ---
  getCities: () => api.get('/city'),
  getCityById: (id) => api.get(`/city/${id}`),
  createCity: (data) => api.post('/city', data),
  updateCity: (id, data) => api.put(`/city/${id}`, data),
  deleteCity: (id) => api.delete(`/city/${id}`),

  // --- Currency ---
  getCurrencies: () => api.get('/currency'),
  getCurrencyById: (id) => api.get(`/currency/${id}`),
  createCurrency: (data) => api.post('/currency', data),
  updateCurrency: (id, data) => api.put(`/currency/${id}`, data),
  deleteCurrency: (id) => api.delete(`/currency/${id}`),

  // --- Payment Term ---
  getPaymentTerms: () => api.get('/payment-term'),
  getPaymentTermById: (id) => api.get(`/payment-term/${id}`),
  createPaymentTerm: (data) => api.post('/payment-term', data),
  updatePaymentTerm: (id, data) => api.put(`/payment-term/${id}`, data),
  deletePaymentTerm: (id) => api.delete(`/payment-term/${id}`),
};
