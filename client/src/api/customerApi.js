import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getCustomerEmails = async (keyword = "", accessToken) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/customers/emails`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer emails:", error);
    throw error;
  }
};

export default {
  getCustomerEmails,
};
