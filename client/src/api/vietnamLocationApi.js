import axios from "axios";

const LOCATION_API_URL = "https://provinces.open-api.vn/api";

export async function getProvinces() {
  try {
    const response = await axios.get(`${LOCATION_API_URL}/?depth=1`);
    return response.data || [];
  } catch (error) {
    console.error("Lấy tỉnh/thành thất bại:", error);
    throw error;
  }
}

export async function getDistricts(provinceCode) {
  if (!provinceCode) return [];
  try {
    const response = await axios.get(
      `${LOCATION_API_URL}/p/${provinceCode}?depth=2`,
    );
    return response.data?.districts || [];
  } catch (error) {
    console.error("Lấy quận/huyện thất bại:", error);
    throw error;
  }
}

export async function getWards(districtCode) {
  if (!districtCode) return [];
  try {
    const response = await axios.get(
      `${LOCATION_API_URL}/d/${districtCode}?depth=2`,
    );
    return response.data?.wards || [];
  } catch (error) {
    console.error("Lấy phường/xã thất bại:", error);
    throw error;
  }
}
