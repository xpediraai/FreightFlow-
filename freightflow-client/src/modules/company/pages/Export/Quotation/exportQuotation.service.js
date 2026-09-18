import api from "../../../../../core/api/axios/instance";

export const exportQuotationService = {
  getQuotations: (params) => api.get('/export-quotation', { params }),
  getQuotationById: (id) => api.get(`/export-quotation/${id}`),
  createQuotation: (data) => api.post('/export-quotation', data),
  updateQuotation: (id, data) => api.put(`/export-quotation/${id}`, data),
  updateStatus: (id, status) => api.patch(`/export-quotation/${id}/status`, { status }),
  deleteQuotation: (id) => api.delete(`/export-quotation/${id}`),
};
