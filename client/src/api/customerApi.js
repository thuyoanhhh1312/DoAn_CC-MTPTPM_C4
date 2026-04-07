import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthHeaders = (accessToken) =>
  accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};

const getCustomerEmails = async (keyword = "", accessToken) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/customers/emails`, {
      params: { keyword },
      headers: getAuthHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer emails:", error);
    throw error;
  }
};

const getAllCustomers = async ({ keyword = "", accessToken } = {}) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/customers`, {
      params: { keyword },
      headers: getAuthHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

const deleteCustomer = async (customerId, accessToken) => {
  try {
    const response = await axiosInstance.delete(
      `${API_URL}/customers/${customerId}`,
      {
        headers: getAuthHeaders(accessToken),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

export default {
  getCustomerEmails,
  getAllCustomers,
  deleteCustomer,
};
