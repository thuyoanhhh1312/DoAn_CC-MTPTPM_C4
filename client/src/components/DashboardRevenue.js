import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getRevenueByPeriod } from "../api/dashboardApi";
import { Calendar, Filter } from "lucide-react";

const DashboardRevenue = ({ onSummaryChange }) => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(""); // '' = tất cả tháng
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => ({ ...state }));
  const accessToken =
    user?.token ||
    JSON.parse(localStorage.getItem("user") || "null")?.token ||
    "";

  const yearOptions = [];
  for (let y = 2020; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const handleFetchData = async (
    selectedYear = year,
    selectedMonth = month,
  ) => {
    if (!selectedYear) {
      toast.error("Vui lòng chọn năm");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { year: selectedYear };
      if (selectedMonth !== "") params.month = selectedMonth;

      const response = await getRevenueByPeriod({ ...params, accessToken });

      if (response.success) {
        const formattedData = response.data.map((item) => ({
          period: item.period,
          totalRevenue: Number(item.totalRevenue),
        }));
        setData(formattedData);

        if (onSummaryChange) {
          const totalRevenue = formattedData.reduce(
            (sum, item) => sum + item.totalRevenue,
            0,
          );
          onSummaryChange({
            totalRevenue,
            points: formattedData.length,
            selectedYear,
            selectedMonth,
          });
        }
      } else {
        setError(response.message || "Lỗi không xác định");
        toast.error(response.message || "Lỗi không xác định");
        setData([]);
        if (onSummaryChange) {
          onSummaryChange({
            totalRevenue: 0,
            points: 0,
            selectedYear,
            selectedMonth,
          });
        }
      }
    } catch (err) {
      setError(err.message || "Lỗi khi gọi API");
      toast.error(err.message || "Lỗi khi gọi API");
      setData([]);
      if (onSummaryChange) {
        onSummaryChange({
          totalRevenue: 0,
          points: 0,
          selectedYear,
          selectedMonth,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Khi component mount, gọi API mặc định
  useEffect(() => {
    handleFetchData(currentYear, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            Thống kê Doanh thu
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Biểu đồ xu hướng doanh thu theo các mốc thời gian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border border-[#e8e4de]">
            <Calendar className="text-[#c48c46]" size={18} />
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                handleFetchData(e.target.value, month);
              }}
              className="bg-transparent border-none text-sm font-medium text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none pl-1"
            >
              <option value="">Chọn năm</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border border-[#e8e4de]">
            <Filter className="text-[#c48c46]" size={18} />
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                handleFetchData(year, e.target.value);
              }}
              className="bg-transparent border-none text-sm font-medium text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none pl-1"
            >
              <option value="">Tất cả các tháng</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-[#e8e4de] border-t-[#c48c46] rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-medium">Đang tải biểu đồ...</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-red-200 rounded-xl bg-red-50">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-gray-400 font-medium">
              Chưa có dữ liệu cho khoảng thời gian này
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 13 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 13 }}
                tickFormatter={(value) =>
                  value >= 1000000
                    ? `${(value / 1000000).toFixed(1)}Tr`
                    : value >= 1000
                      ? `${value / 1000}k`
                      : value
                }
                width={80}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
                cursor={{
                  stroke: "#c48c46",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#1a1a2e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#1a1a2e", strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: "#c48c46",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DashboardRevenue;
