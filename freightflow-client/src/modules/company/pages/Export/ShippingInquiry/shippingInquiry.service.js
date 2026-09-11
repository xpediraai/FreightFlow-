import api from "../../../../../core/api/axios/instance";

export const shippingInquiryService = {
  getInquiries: (params) => api.get('/shipping-inquiry', { params }),
  getInquiryById: (id) => api.get(`/shipping-inquiry/${id}`),
  createInquiry: (data) => api.post('/shipping-inquiry', data),
  updateInquiry: (id, data) => api.put(`/shipping-inquiry/${id}`, data),
  updateStatus: (id, status) => api.patch(`/shipping-inquiry/${id}/status`, { status }),
  deleteInquiry: (id) => api.delete(`/shipping-inquiry/${id}`),
};
