import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const buildAuthHeaders = (accessToken) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const getAllPromotionLogs = async (params = {}, accessToken) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/promotion-logs`, {
      ...buildAuthHeaders(accessToken),
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion logs:", error);
    throw error;
  }
};

const sendPromotionManually = async (data, accessToken) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/promotion-logs/send`,
      data,
      buildAuthHeaders(accessToken),
    );
    return response.data;
  } catch (error) {
    console.error("Error sending promotion manually:", error);
    throw error;
  }
};

const deletePromotionLogs = async (logIds, accessToken) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/promotion-logs`, {
      ...buildAuthHeaders(accessToken),
      data: { log_ids: logIds },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion logs:", error);
    throw error;
  }
};

export default {
  getAllPromotionLogs,
  sendPromotionManually,
  deletePromotionLogs,
};
