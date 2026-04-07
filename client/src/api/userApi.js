import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthHeaders = (accessToken) =>
  accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};

export const getAdminStaffUsers = async ({
  keyword = "",
  role = "",
  status = "",
  accessToken,
} = {}) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/users`, {
      params: { keyword, role, status },
      headers: getAuthHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin/staff users:", error);
    throw error;
  }
};

export const updateAdminStaffUserRole = async (userId, role_id, accessToken) => {
  try {
    const response = await axiosInstance.patch(
      `${API_URL}/users/${userId}/role`,
      { role_id },
      {
        headers: getAuthHeaders(accessToken),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating admin/staff user role:", error);
    throw error;
  }
};

export default {
  getAdminStaffUsers,
  updateAdminStaffUserRole,
};
