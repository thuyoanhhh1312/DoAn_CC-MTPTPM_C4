import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getOrderByCustomer = async (userId, accessToken) => {
  const response = await axiosInstance.get(
    `${API_URL}/orders/by-customer/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

const calculatePrice = async (payload, accessToken) => {
  const response = await axiosInstance.post(`${API_URL}/calculate-price`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export default {
  getOrderByCustomer,
  calculatePrice,
};
