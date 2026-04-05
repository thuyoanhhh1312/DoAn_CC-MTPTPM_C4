import React, { useMemo, useState } from "react";
import DashboardRevenue from "../../../components/DashboardRevenue";
import DashboardOrderCount from "../../../components/DashboardOrderCount";
import { TrendingUp, ShoppingBag, Activity } from "lucide-react";

const Dashboard = () => {
  const [revenueSummary, setRevenueSummary] = useState({
    totalRevenue: 0,
    points: 0,
    selectedYear: new Date().getFullYear(),
    selectedMonth: "",
  });
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    points: 0,
    period: "day",
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const periodLabel = useMemo(() => {
    switch (orderSummary.period) {
      case "week":
        return "Theo tuần";
      case "month":
        return "Theo tháng";
      default:
        return "Theo ngày";
    }
  }, [orderSummary.period]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#faf7f2] min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title could go here if needed, but the layout already has one. */}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#252540] rounded-2xl p-6 shadow-sm border border-transparent text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10">
              <TrendingUp size={100} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <TrendingUp className="text-[#c48c46]" size={24} />
                </div>
                <h3 className="font-medium text-white/80">Tổng doanh thu đang hiển thị</h3>
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {formatCurrency(revenueSummary.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] relative overflow-hidden group hover:border-[#c48c46]/30 transition-colors">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#faf7f2] rounded-xl group-hover:bg-[#f0ebe1] transition-colors">
                  <ShoppingBag className="text-[#1a1a2e]" size={24} />
                </div>
                <h3 className="font-medium text-gray-500">Tổng số đơn đang hiển thị</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-[#1a1a2e] tracking-tight">
                  {new Intl.NumberFormat("vi-VN").format(orderSummary.totalOrders)}
                </p>
                <span className="text-gray-500 font-medium mb-1">đơn hàng</span>
              </div>
            </div>
          </div>

          {/* Activity / Data Points Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] relative overflow-hidden group hover:border-[#c48c46]/30 transition-colors">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#faf7f2] rounded-xl group-hover:bg-[#f0ebe1] transition-colors">
                  <Activity className="text-[#1a1a2e]" size={24} />
                </div>
                <h3 className="font-medium text-gray-500">Mốc dữ liệu biểu đồ</h3>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1a1a2e] tracking-tight">
                  {revenueSummary.points + orderSummary.points}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  Doanh thu: {revenueSummary.points} • Đơn hàng: {orderSummary.points} ({periodLabel})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de]">
            <DashboardRevenue onSummaryChange={setRevenueSummary} />
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de]">
            <DashboardOrderCount onSummaryChange={setOrderSummary} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
