import api from "../../../core/api/axios/instance";

const BASE_URL = "/tracking";

export const trackingService = {
  /**
   * Fetches live multi-source preview for a given BL and Shipping Line
   */
  fetchLiveTracking: async (shippingLineName, blNumber, shippingLineId = null) => {
    const response = await api.post(`${BASE_URL}/fetch`, {
      shipping_line_name: shippingLineName,
      bl_number: blNumber,
      shipping_line_id: shippingLineId,
    });
    return response?.data || response;
  },

  /**
   * Confirms a tracking result and activates automated background monitoring
   */
  confirmTracking: async (payload) => {
    const response = await api.post(`${BASE_URL}/confirm`, payload);
    return response?.data || response;
  },

  /**
   * Retrieves list of monitored shipments with filters and pagination
   */
  getTrackedShipments: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response?.data || response;
  },

  /**
   * Retrieves full tracking record with containers and timeline history
   */
  getTrackingById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response?.data || response;
  },

  /**
   * Triggers an on-demand re-scan / refresh of external sources
   */
  refreshTracking: async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/refresh`);
    return response?.data || response;
  },

  /**
   * Manually overrides milestone/status for a tracked shipment
   */
  overrideStatus: async (id, payload) => {
    const response = await api.patch(`${BASE_URL}/${id}/override`, payload);
    return response?.data || response;
  },
};
