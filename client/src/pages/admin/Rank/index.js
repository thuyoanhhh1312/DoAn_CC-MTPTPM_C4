import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useState } from 'react';
import rankApi from '../../../api/rankApi';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { Chart } from 'primereact/chart';
import { Trophy, RefreshCw, Eye, History, PieChart, Crown, Medal, Award, Star, ArrowRight } from 'lucide-react';

const RankManagement = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [preview, setPreview] = useState([]);
  const [history, setHistory] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // preview, history, distribution

  useEffect(() => {
    fetchDistribution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const response = await rankApi.previewRank(user?.token);
      setPreview(response.data || []);
    } catch (error) {
      console.error('Error fetching rank preview:', error);
      Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải preview xếp hạng',
          icon: 'error',
          confirmButtonColor: '#c48c46'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await rankApi.getRankHistory({}, user?.token);
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching rank history:', error);
      Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải lịch sử xếp hạng',
          icon: 'error',
          confirmButtonColor: '#c48c46'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribution = async () => {
    try {
      const response = await rankApi.getRankDistribution(user?.token);
      setDistribution(response.data);
    } catch (error) {
      console.error('Error fetching rank distribution:', error);
    }
  };

  const handleRecalculate = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận cập nhật xếp hạng?',
      text: 'Thao tác này sẽ cập nhật xếp hạng cho tất cả khách hàng dựa trên chi tiêu tháng hiện tại.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cập nhật ngay',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#1a1a2e',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await rankApi.recalculateRank(user?.token);

        await Swal.fire({
          icon: 'success',
          title: 'Thành công',
          html: `
            <div class="text-left mt-2">
              <p class="text-gray-700">Đã cập nhật xếp hạng cho <strong class="text-[#c48c46] text-lg">${response.updated_count}</strong> khách hàng.</p>
            </div>
          `,
          confirmButtonColor: '#c48c46',
        });

        fetchDistribution();
        if (activeTab === 'history') fetchHistory();
      } catch (error) {
        Swal.fire({
            title: 'Lỗi',
            text: error.response?.data?.message || 'Không thể cập nhật xếp hạng',
            icon: 'error',
            confirmButtonColor: '#c48c46'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'preview') fetchPreview();
    else if (tab === 'history') fetchHistory();
  };

  const getRankBadge = (rank) => {
    const lowerRank = (rank || '').toLowerCase();
    switch(lowerRank) {
        case 'vip':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1a1a2e] text-[#c48c46] border border-[#c48c46]/30 shadow-sm"><Crown size={12}/> VIP</span>;
        case 'gold':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200"><Medal size={12}/> GOLD</span>;
        case 'silver':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"><Award size={12}/> SILVER</span>;
        case 'bronze':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200"><Star size={12}/> BRONZE</span>;
        default:
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{rank}</span>;
    }
  };

  const changeBodyTemplate = (rowData) => {
    if (!rowData.will_change) return <span className="text-gray-400 font-medium">-</span>;
    return (
      <div className="flex items-center gap-2">
        {getRankBadge(rowData.current_rank)}
        <ArrowRight size={14} className="text-emerald-500" />
        {getRankBadge(rowData.new_rank)}
      </div>
    );
  };

  // Modern Chart Colors matching the luxury theme
  const chartData = distribution
    ? {
        labels: ['Bronze', 'Silver', 'Gold', 'VIP'],
        datasets: [
          {
            data: [
              distribution.distribution.bronze,
              distribution.distribution.silver,
              distribution.distribution.gold,
              distribution.distribution.vip,
            ],
            backgroundColor: ['#d97706', '#94a3b8', '#eab308', '#1a1a2e'],
            hoverBackgroundColor: ['#b45309', '#64748b', '#ca8a04', '#2d2d46'],
            borderWidth: 0,
          },
        ],
      }
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#faf7f2] min-h-full">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#e8e4de]">
                        <Trophy className="text-[#c48c46] w-6 h-6" />
                    </div>
                    Quản lý Xếp hạng Khách hàng
                </h1>
                <p className="text-gray-500 mt-2 text-sm">Theo dõi và cập nhật thứ hạng thành viên dựa trên giao dịch.</p>
            </div>
            <button
                onClick={handleRecalculate}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#c48c46] transition-colors text-white px-6 py-3 rounded-xl shadow-md disabled:opacity-70 font-medium whitespace-nowrap"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                {loading ? 'Đang xử lý...' : 'Cập nhật phân hạng'}
            </button>
        </div>

        {/* Custom Luxury Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-[#e8e4de] w-fit">
            <button
                onClick={() => handleTabChange('preview')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'preview' 
                    ? 'bg-[#1a1a2e] text-[#c48c46] shadow-sm' 
                    : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-gray-50'
                }`}
            >
                <Eye size={16} /> Xem trước
            </button>
            <button
                onClick={() => handleTabChange('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'history' 
                    ? 'bg-[#1a1a2e] text-[#c48c46] shadow-sm' 
                    : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-gray-50'
                }`}
            >
                <History size={16} /> Lịch sử thay đổi
            </button>
            <button
                onClick={() => handleTabChange('distribution')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'distribution' 
                    ? 'bg-[#1a1a2e] text-[#c48c46] shadow-sm' 
                    : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-gray-50'
                }`}
            >
                <PieChart size={16} /> Phân bố hạng
            </button>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-[#e8e4de] overflow-hidden">
            
            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div className="p-6">
                <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Eye className="mt-0.5 shrink-0 text-blue-500" size={18} />
                    <p className="text-sm">
                        Danh sách <strong>Xem trước (Preview)</strong> hiển thị thứ hạng dự kiến dựa trên tổng chi tiêu trong tháng hiện tại. Dữ liệu này <strong>chưa</strong> được lưu vào hệ thống trừ khi bạn bấm nút "Cập nhật phân hạng".
                    </p>
                </div>
                
                <div className="p-datatable-custom">
                    <DataTable
                        value={preview}
                        paginator
                        rows={10}
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage={
                            <div className="text-center py-10">
                                <p className="text-gray-500">Chưa có dữ liệu xem trước</p>
                            </div>
                        }
                    >
                        <Column field="name" header="Khách hàng" sortable />
                        <Column field="email" header="Email" sortable />
                        <Column
                            field="current_rank"
                            header="Hạng hiện tại"
                            sortable
                            body={(row) => getRankBadge(row.current_rank)}
                        />
                        <Column
                            header="Thay đổi dự kiến"
                            body={changeBodyTemplate}
                        />
                        <Column
                            field="total_spent_formatted"
                            header="Tổng chi tiêu"
                            sortable
                            align="right"
                            body={(row) => <span className="font-semibold text-gray-800">{row.total_spent_formatted}</span>}
                        />
                    </DataTable>
                </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="p-6">
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                    <History className="mt-0.5 shrink-0 text-gray-400" size={18} />
                    <p className="text-sm text-gray-600">
                        Ghi nhận tất cả các lần thay đổi hạng thẻ của khách hàng trong quá khứ.
                    </p>
                </div>
                <div className="p-datatable-custom">
                    <DataTable
                        value={history}
                        paginator
                        rows={10}
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage={
                            <div className="text-center py-10">
                                <p className="text-gray-500">Chưa có lịch sử thay đổi</p>
                            </div>
                        }
                    >
                        <Column field="Customer.name" header="Khách hàng" sortable />
                        <Column field="Customer.email" header="Email" sortable />
                        <Column
                            header="Thay đổi hạng"
                            body={(row) => (
                                <div className="flex items-center gap-2">
                                    {row.old_rank ? getRankBadge(row.old_rank) : <span className="text-gray-400">-</span>}
                                    <ArrowRight size={14} className="text-gray-400" />
                                    {getRankBadge(row.new_rank)}
                                </div>
                            )}
                        />
                        <Column
                            field="total_spent_formatted"
                            header="Tổng chi tiêu"
                            sortable
                            align="right"
                            body={(row) => <span className="font-semibold text-gray-800">{row.total_spent_formatted}</span>}
                        />
                        <Column
                            header="Kỳ xét duyệt"
                            align="center"
                            body={(row) => (
                                <div className="inline-flex px-3 py-1 bg-[#faf7f2] border border-[#e8e4de] rounded text-sm text-gray-700 font-medium">
                                    Tháng {row.period_month}/{row.period_year}
                                </div>
                            )}
                        />
                    </DataTable>
                </div>
                </div>
            )}

            {/* Distribution Tab */}
            {activeTab === 'distribution' && distribution && (
                <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Biểu đồ */}
                    <div className="bg-[#faf7f2] rounded-2xl p-6 border border-[#e8e4de] flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
                            <PieChart className="text-[#c48c46]" size={20} />
                            Cơ cấu Khách hàng
                        </h3>
                        <div className="w-[300px] h-[300px]">
                            <Chart type="pie" data={chartData} options={{
                                plugins: {
                                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                                }
                            }} />
                        </div>
                    </div>
                    
                    {/* Số liệu */}
                    <div>
                        <h3 className="text-lg font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
                            <History className="text-[#c48c46]" size={20} />
                            Thống kê Chi tiết
                        </h3>
                        <div className="space-y-4">
                            
                            {/* VIP */}
                            <div className="flex justify-between items-center p-5 bg-white border-2 border-[#1a1a2e] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1a1a2e] text-[#c48c46] flex items-center justify-center">
                                        <Crown size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#1a1a2e] block leading-tight">Thành viên VIP</span>
                                        <span className="text-xs text-gray-500">Khách hàng tối thượng</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-[#1a1a2e] block leading-tight">{distribution.distribution.vip}</span>
                                    <span className="text-sm font-semibold text-[#c48c46]">{distribution.percentages.vip}</span>
                                </div>
                            </div>

                            {/* Gold */}
                            <div className="flex justify-between items-center p-4 bg-white border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                        <Medal size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">Thành viên Vàng</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-gray-800 block leading-tight">{distribution.distribution.gold}</span>
                                    <span className="text-sm text-yellow-600 font-medium">{distribution.percentages.gold}</span>
                                </div>
                            </div>

                            {/* Silver */}
                            <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                                        <Award size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">Thành viên Bạc</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-gray-800 block leading-tight">{distribution.distribution.silver}</span>
                                    <span className="text-sm text-slate-500 font-medium">{distribution.percentages.silver}</span>
                                </div>
                            </div>

                            {/* Bronze */}
                            <div className="flex justify-between items-center p-4 bg-white border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Star size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">Thành viên Thường</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-gray-800 block leading-tight">{distribution.distribution.bronze}</span>
                                    <span className="text-sm text-orange-600 font-medium">{distribution.percentages.bronze}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center p-5 bg-[#faf7f2] border border-[#e8e4de] rounded-xl mt-6">
                                <span className="font-bold text-gray-600 uppercase tracking-wider text-sm">Tổng khách hàng phân hạng</span>
                                <span className="text-3xl font-black text-[#1a1a2e]">{distribution.total}</span>
                            </div>

                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default RankManagement;
