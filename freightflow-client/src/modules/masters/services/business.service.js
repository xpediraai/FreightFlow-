import api from "../../../core/api/axios/instance";

export const businessService = {
	// --- Customer ---
	getCustomers: (params) => api.get('/customer', { params }),
	getCustomerById: (id) => api.get(`/customer/${id}`),
	createCustomer: (data) => api.post('/customer', data),
	updateCustomer: (id, data) => api.put(`/customer/${id}`, data),
	deleteCustomer: (id) => api.delete(`/customer/${id}`),
	uploadDocument: (formData) => api.post('/customer/upload', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),

	// --- Vendor ---
	getVendors: (params) => api.get('/vendor', { params }),
	getVendorById: (id) => api.get(`/vendor/${id}`),
	createVendor: (data) => api.post('/vendor', data),
	updateVendor: (id, data) => api.put(`/vendor/${id}`, data),
	deleteVendor: (id) => api.delete(`/vendor/${id}`),
	
	// --- Commodity (Placeholder) ---
	getCommodities: (params) => api.get('/commodity', { params }),
	getCommodityById: (id) => api.get(`/commodity/${id}`),
	createCommodity: (data) => api.post('/commodity', data),
	updateCommodity: (id, data) => api.put(`/commodity/${id}`, data),
	deleteCommodity: (id) => api.delete(`/commodity/${id}`),
	
	// --- Charge (Placeholder) ---
	getCharges: (params) => api.get('/charge', { params }),
	getChargeById: (id) => api.get(`/charge/${id}`),
	createCharge: (data) => api.post('/charge', data),
	updateCharge: (id, data) => api.put(`/charge/${id}`, data),
	deleteCharge: (id) => api.delete(`/charge/${id}`),
};
