import axiosInstance from "./axiosInstance";

const resolveAccessToken = (accessToken) => {
  if (accessToken && String(accessToken).trim()) {
    return accessToken;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.token || "";
  } catch {
    return "";
  }
};

const buildHeaders = (accessToken) => {
  const token = resolveAccessToken(accessToken);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const getRevenueByPeriod = async ({ year, month, accessToken }) => {
  try {
    const params = { year };
    if (month) params.month = month;

    const response = await axiosInstance.get("/dashboard/revenue", {
      params,
      headers: buildHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue by period:", error);
    throw error;
  }
};

export const getOrderCountByPeriod = async ({
  period,
  startDate,
  endDate,
  accessToken,
}) => {
  try {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get("/dashboard/orders/count", {
      params,
      headers: buildHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching order count by period:", error);
    throw error;
  }
};
