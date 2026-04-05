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

const checkout = async (payload, accessToken) => {
  const response = await axiosInstance.post(`${API_URL}/checkout`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

const updateDeposit = async (orderId, payload, accessToken) => {
  const response = await axiosInstance.patch(
    `${API_URL}/orders/${orderId}/deposit`,
    payload,
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
  checkout,
  updateDeposit,
  calculatePrice,
};
