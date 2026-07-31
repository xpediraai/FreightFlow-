import api from '../../../core/api/axios/instance';

export const operationsService = {
  // --- Shipment Management ---
  getShipments: (params) => api.get('/shipment', { params }),
  getShipmentById: (id) => api.get(`/shipment/${id}`),
  createShipment: (data) => api.post('/shipment', data),
  updateShipment: (id, data) => api.put(`/shipment/${id}`, data),
  updateShipmentStatus: (id, status) => api.patch(`/shipment/${id}/status`, { status }),
  deleteShipment: (id) => api.delete(`/shipment/${id}`),

  // --- Job Management ---
  getJobs: (params) => api.get('/job', { params }),
  getJobById: (id) => api.get(`/job/${id}`),
  createJob: (data) => api.post('/job', data),
  updateJob: (id, data) => api.put(`/job/${id}`, data),
  updateJobStatus: (id, status) => api.patch(`/job/${id}/status`, { status }),
  deleteJob: (id) => api.delete(`/job/${id}`),
};
