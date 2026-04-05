import axiosInstance from './axiosInstance';

export const getRevenueByPeriod = async ({ year, month, accessToken }) => {
    try {
        const params = { year };
        if (month) params.month = month;

        const response = await axiosInstance.get('/dashboard/revenue', {
            params,
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching revenue by period:", error);
        throw error;
    }
};

export const getOrderCountByPeriod = async ({ period, startDate, endDate, accessToken }) => {
    try {
        const params = { period };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await axiosInstance.get('/dashboard/orders/count', {
            params,
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching order count by period:", error);
        throw error;
    }
};