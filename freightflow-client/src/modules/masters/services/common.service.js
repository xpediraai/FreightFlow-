import api from '../../../core/api/axios/instance';

export const commonService = {
  // --- UOM ---
  getUOMs: (params) => api.get('/uom', { params }),
  getUOMById: (id) => api.get(`/uom/${id}`),
  createUOM: (data) => api.post('/uom', data),
  updateUOM: (id, data) => api.put(`/uom/${id}`, data),
  deleteUOM: (id) => api.delete(`/uom/${id}`),

  // --- Package Type ---
  getPackageTypes: (params) => api.get('/package-type', { params }),
  getPackageTypeById: (id) => api.get(`/package-type/${id}`),
  createPackageType: (data) => api.post('/package-type', data),
  updatePackageType: (id, data) => api.put(`/package-type/${id}`, data),
  deletePackageType: (id) => api.delete(`/package-type/${id}`),

  // --- Incoterm ---
  getIncoterms: (params) => api.get('/incoterm', { params }),
  getIncotermById: (id) => api.get(`/incoterm/${id}`),
  createIncoterm: (data) => api.post('/incoterm', data),
  updateIncoterm: (id, data) => api.put(`/incoterm/${id}`, data),
  deleteIncoterm: (id) => api.delete(`/incoterm/${id}`),

  // --- Transport Mode ---
  getTransportModes: (params) => api.get('/transport-mode', { params }),
  getTransportModeById: (id) => api.get(`/transport-mode/${id}`),
  createTransportMode: (data) => api.post('/transport-mode', data),
  updateTransportMode: (id, data) => api.put(`/transport-mode/${id}`, data),
  deleteTransportMode: (id) => api.delete(`/transport-mode/${id}`),

  // --- Container Type ---
  getContainerTypes: (params) => api.get('/container-type', { params }),
  getContainerTypeById: (id) => api.get(`/container-type/${id}`),
  createContainerType: (data) => api.post('/container-type', data),
  updateContainerType: (id, data) => api.put(`/container-type/${id}`, data),
  deleteContainerType: (id) => api.delete(`/container-type/${id}`),
};
