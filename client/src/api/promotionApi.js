import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Lấy tất cả khuyến mãi (có phân trang và filters)
 * @param {Object} params - Query parameters (page, limit, segment_target, campaign_id, sort)
 * @param {string} accessToken - JWT token (optional)
 */
const getAllPromotions = async (params = {}, accessToken) => {
  try {
    const config = {};
    if (accessToken) {
      config.headers = {
        Authorization: `Bearer ${accessToken}`,
      };
    }
    const response = await axiosInstance.get(`${API_URL}/promotions`, {
      params,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};

/**
 * Lấy khuyến mãi theo ID
 * @param {number} id - Promotion ID
 * @param {string} accessToken - JWT token (optional)
 */
const getPromotionById = async (id, accessToken) => {
  try {
    const config = {};
    if (accessToken) {
      config.headers = {
        Authorization: `Bearer ${accessToken}`,
      };
    }
    const response = await axiosInstance.get(`${API_URL}/promotions/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion by ID:", error);
    throw error;
  }
};

/**
 * Tạo khuyến mãi mới
 * @param {Object} data - Promotion data
 * @param {string} accessToken - JWT token
 */
const createPromotion = async (data, accessToken) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/promotions`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
};

/**
 * Cập nhật khuyến mãi
 * @param {number} id - Promotion ID
 * @param {Object} data - Updated promotion data
 * @param {string} accessToken - JWT token
 */
const updatePromotion = async (id, data, accessToken) => {
  try {
    const response = await axiosInstance.put(
      `${API_URL}/promotions/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating promotion:", error);
    throw error;
  }
};

/**
 * Xóa khuyến mãi
 * @param {number} id - Promotion ID
 * @param {string} accessToken - JWT token
 */
const deletePromotion = async (id, accessToken) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/promotions/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion:", error);
    throw error;
  }
};

export default {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
