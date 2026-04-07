import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const getAllOrders = async (accessToken) => {
  const response = await axiosInstance.get(`${API_URL}/orders`, {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });

  return response.data;
};

export const getOrderByCustomer = async (userId, accessToken) => {
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

export const updateOrder = async (orderId, payload, accessToken) => {
  const response = await axiosInstance.put(
    `${API_URL}/orders/${orderId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

export const checkout = async (payload, accessToken) => {
  const response = await axiosInstance.post(`${API_URL}/checkout`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const updateDeposit = async (orderId, payload, accessToken) => {
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

export const calculatePrice = async (payload, accessToken) => {
  const response = await axiosInstance.post(`${API_URL}/calculate-price`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export default {
  getAllOrders,
  getOrderByCustomer,
  updateOrder,
  checkout,
  updateDeposit,
  calculatePrice,
};
