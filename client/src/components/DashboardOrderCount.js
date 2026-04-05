import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getOrderCountByPeriod } from "../api/dashboardApi";
import { Calendar, Filter, CalendarDays } from "lucide-react";

const DashboardOrderCount = ({ onSummaryChange }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const accessToken = user?.token || "";

  const periodOptions = [
    { label: "Ngày (7 ngày gần nhất)", value: "day" },
    { label: "Tuần (6 tuần gần nhất)", value: "week" },
    { label: "Tháng (6 tháng gần nhất)", value: "month" },
  ];

  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorDate, setErrorDate] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderCount = async (periodValue, start, end) => {
    if (!periodValue) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getOrderCountByPeriod({
        period: periodValue,
        startDate: start || null,
        endDate: end || null,
        accessToken,
      });

      if (res.success) {
        setData(res.data);
        if (onSummaryChange) {
          const totalOrders = res.data.reduce(
            (sum, item) => sum + Number(item.count || 0),
            0,
          );
          onSummaryChange({
            totalOrders,
            points: res.data.length,
            period: periodValue,
          });
        }
      } else {
        setError(res.message || "Lỗi không xác định");
        toast.error(res.message || "Lỗi không xác định");
        setData([]);
        if (onSummaryChange) {
          onSummaryChange({ totalOrders: 0, points: 0, period: periodValue });
        }
      }
    } catch (err) {
      setError(err.message || "Lỗi khi gọi API");
      toast.error(err.message || "Lỗi khi gọi API");
      setData([]);
      if (onSummaryChange) {
        onSummaryChange({ totalOrders: 0, points: 0, period: periodValue });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setErrorDate(null);
    setStartDate(val);
    if (endDate && val && new Date(endDate) < new Date(val)) {
      setEndDate("");
      toast.info("Ngày kết thúc đã bị đặt lại do trước ngày bắt đầu");
    }
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setErrorDate(null);
    if (startDate && val && new Date(val) < new Date(startDate)) {
      setErrorDate("Ngày kết thúc không thể trước ngày bắt đầu");
      toast.error("Ngày kết thúc không thể trước ngày bắt đầu");
      return;
    }
    setEndDate(val);
  };

  useEffect(() => {
    fetchOrderCount(period, startDate, endDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate]);

  const formatNumber = (num) => num.toLocaleString();

  return (
    <div className="w-full mt-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e]">Thống kê Đơn hàng</h2>
          <p className="text-sm text-gray-500 mt-1">
            Biểu đồ số lượng đơn hàng bán ra theo thời gian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border border-[#e8e4de]">
            <Filter className="text-[#c48c46]" size={18} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none pl-1"
            >
              {periodOptions.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border border-[#e8e4de]">
            <Calendar className="text-[#c48c46]" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={new Date().toISOString().split("T")[0]}
              className="bg-transparent border-none text-sm font-medium text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none w-[110px]"
              title="Ngày bắt đầu"
            />
          </div>
          
          <span className="text-gray-400">-</span>

          <div className={`flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border transition-colors ${errorDate ? 'border-red-400 bg-red-50' : 'border-[#e8e4de]'}`}>
            <CalendarDays className="text-[#c48c46]" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              max={new Date().toISOString().split("T")[0]}
              className="bg-transparent border-none text-sm font-medium text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none w-[110px]"
              title="Ngày kết thúc"
            />
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-[#e8e4de] border-t-[#c48c46] rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-medium">Đang tải cấu trúc dữ liệu...</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-red-200 rounded-xl bg-red-50">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-gray-400 font-medium">Chưa có dữ liệu cho khoảng thời gian này</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13 }}
                dy={10}
              />
              <YAxis 
                tickFormatter={formatNumber} 
                width={80} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13 }}
              />
              <Tooltip 
                formatter={(value) => [formatNumber(value), "Số đơn hàng"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                cursor={{ fill: '#f5f6f7' }}
              />
              <Bar 
                dataKey="count" 
                fill="#c48c46" 
                radius={[4, 4, 0, 0]} 
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DashboardOrderCount;
