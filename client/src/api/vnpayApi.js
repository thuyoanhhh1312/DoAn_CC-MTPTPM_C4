import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const createPaymentUrl = async (orderId, amount) => {
  const response = await axiosInstance.post(
    `${API_URL}/payment/create_payment_url`,
    {
      orderId,
      amount,
    },
  );

  return response.data;
};

export default {
  createPaymentUrl,
};
