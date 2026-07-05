import api from '../../../core/api/axios/instance';

export const logisticsService = {
  // --- Port ---
  getPorts: (params) => api.get('/port', { params }),
  getPortById: (id) => api.get(`/port/${id}`),
  createPort: (data) => api.post('/port', data),
  updatePort: (id, data) => api.put(`/port/${id}`, data),
  deletePort: (id) => api.delete(`/port/${id}`),

  // --- Shipping Line ---
  getShippingLines: (params) => api.get('/shipping-line', { params }),
  getShippingLineById: (id) => api.get(`/shipping-line/${id}`),
  createShippingLine: (data) => api.post('/shipping-line', data),
  updateShippingLine: (id, data) => api.put(`/shipping-line/${id}`, data),
  deleteShippingLine: (id) => api.delete(`/shipping-line/${id}`),

  // --- Warehouse ---
  getWarehouses: (params) => api.get('/warehouse', { params }),
  getWarehouseById: (id) => api.get(`/warehouse/${id}`),
  createWarehouse: (data) => api.post('/warehouse', data),
  updateWarehouse: (id, data) => api.put(`/warehouse/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouse/${id}`),

  // --- Vehicle ---
  getVehicles: (params) => api.get('/vehicle', { params }),
  getVehicleById: (id) => api.get(`/vehicle/${id}`),
  createVehicle: (data) => api.post('/vehicle', data),
  updateVehicle: (id, data) => api.put(`/vehicle/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicle/${id}`),

  // --- Driver ---
  getDrivers: (params) => api.get('/driver', { params }),
  getDriverById: (id) => api.get(`/driver/${id}`),
  createDriver: (data) => api.post('/driver', data),
  updateDriver: (id, data) => api.put(`/driver/${id}`, data),
  deleteDriver: (id) => api.delete(`/driver/${id}`),
};
