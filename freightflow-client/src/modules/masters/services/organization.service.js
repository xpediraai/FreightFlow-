import api from '../../../core/api/axios/instance';

export const organizationService = {
  // --- Department ---
  getDepartments: () => api.get('/department'),
  getDepartmentById: (id) => api.get(`/department/${id}`),
  createDepartment: (data) => api.post('/department', data),
  updateDepartment: (id, data) => api.put(`/department/${id}`, data),
  deleteDepartment: (id) => api.delete(`/department/${id}`),

  // --- Designation ---
  getDesignations: () => api.get('/designation'),
  getDesignationById: (id) => api.get(`/designation/${id}`),
  createDesignation: (data) => api.post('/designation', data),
  updateDesignation: (id, data) => api.put(`/designation/${id}`, data),
  deleteDesignation: (id) => api.delete(`/designation/${id}`),

  // --- Employee ---
  getEmployees: () => api.get('/employee'),
  getEmployeeById: (id) => api.get(`/employee/${id}`),
  createEmployee: (data) => api.post('/employee', data),
  updateEmployee: (id, data) => api.put(`/employee/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employee/${id}`),
};
