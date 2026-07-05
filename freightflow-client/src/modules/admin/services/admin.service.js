import axiosInstance from '../../../core/api/axios/instance';

export const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/company/dashboard-stats');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },

  getCompanies: async () => {
    try {
      const response = await axiosInstance.get('/company');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      const response = await axiosInstance.post('/company', companyData);
      return response.data || response;
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      const response = await axiosInstance.put(`/company/${id}`, companyData);
      return response.data || response;
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  },

  createCompanyOwner: async (ownerData) => {
    try {
      const response = await axiosInstance.post('/auth/register', ownerData);
      return response.data || response;
    } catch (error) {
      console.error('Failed to create company owner:', error);
      throw error;
    }
  },

  getEmployeeStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'dep1', name: 'Sales', active: 45, inactive: 2, total: 47 },
          { id: 'dep2', name: 'Operations', active: 120, inactive: 5, total: 125 },
          { id: 'dep3', name: 'Finance', active: 15, inactive: 0, total: 15 },
          { id: 'dep4', name: 'HR', active: 8, inactive: 1, total: 9 },
          { id: 'dep5', name: 'IT Support', active: 22, inactive: 0, total: 22 },
        ]);
      }, 500);
    });
  }
};
