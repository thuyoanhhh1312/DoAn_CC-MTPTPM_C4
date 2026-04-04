import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useState } from 'react';
import campaignApi from '../../../api/campaignApi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { Plus, Search, Edit2, Trash2, Calendar, Filter } from 'lucide-react';

const CampaignList = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
  });

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.is_active !== '') params.is_active = filters.is_active;

      const response = await campaignApi.getAllCampaigns(params, user?.token);
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể tải danh sách chương trình',
        icon: 'error',
        confirmButtonColor: '#c48c46'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn xóa?',
      text: 'Thao tác này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await campaignApi.deleteCampaign(id, user?.token);
        setCampaigns(campaigns.filter((campaign) => campaign.campaign_id !== id));
        Swal.fire({
          title: 'Đã xóa!',
          text: 'Chương trình đã được xóa thành công.',
          icon: 'success',
          confirmButtonColor: '#c48c46'
        });
      } catch (error) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể xóa chương trình',
          icon: 'error',
          confirmButtonColor: '#c48c46'
        });
      }
    }
  };

  const dateBodyTemplate = (rowData, field) => {
    const dateStr = rowData[field];
    return (
      <div className="flex items-center gap-2 text-gray-600 font-medium">
        <Calendar size={16} className="text-gray-400" />
        <span>{dateStr ? dayjs(dateStr).format('DD/MM/YYYY') : '-'}</span>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return rowData.is_active ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
        Đang hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 shadow-sm"></span>
        Tạm dừng
      </span>
    );
  };

  const promotionCountBodyTemplate = (rowData) => {
    const count = rowData.promotions?.length || 0;
    return (
      <span className="text-gray-600 text-sm">
        {count}
      </span>
    );
  };

  const nameBodyTemplate = (rowData) => {
    return (
      <div className="font-semibold text-gray-900">
        {rowData.name}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Khuyến mãi</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách và công cụ quản trị các đợt ưu đãi.</p>
        </div>
        <Link to="/admin/campaigns/add">
          <button className="inline-flex items-center justify-center gap-2 bg-brand-dark hover:bg-gold-500 text-white px-6 py-2.5 rounded-xl transition-all font-medium text-sm shadow-md hover:shadow-lg">
            <Plus size={18} />
            <span>Thêm Chương Trình</span>
          </button>
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Section */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row gap-4 lg:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên chương trình..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm transition-all outline-none bg-gray-50/50 hover:bg-gray-50 focus:bg-white h-[42px]"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="w-full md:w-56 relative border-l border-gray-100 pl-4 md:pl-0 md:border-l-0">
              <div className="absolute inset-y-0 left-0 md:left-2 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 md:pl-11 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm transition-all outline-none bg-gray-50/50 hover:bg-gray-50 focus:bg-white h-[42px] appearance-none font-medium text-gray-700"
                value={filters.is_active}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Tạm dừng</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <button
              onClick={fetchCampaigns}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm h-[42px] whitespace-nowrap shadow-sm border border-gray-200/50"
            >
              Áp dụng
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0">
          <style dangerouslySetInnerHTML={{__html: `
            .custom-p-table .p-datatable-thead > tr > th {
              background-color: #f9fafb !important;
              color: #4b5563 !important;
              font-weight: 600 !important;
              text-transform: uppercase;
              font-size: 0.75rem;
              letter-spacing: 0.05em;
              padding: 1rem 1.5rem !important;
              border-bottom: 1px solid #f3f4f6 !important;
              border-width: 0 0 1px 0 !important;
            }
            .custom-p-table .p-datatable-tbody > tr > td {
              padding: 1rem 1.5rem !important;
              border-bottom: 1px solid #f3f4f6 !important;
              border-width: 0 0 1px 0 !important;
              color: #374151;
            }
            .custom-p-table .p-datatable-wrapper {
              border-radius: 0 0 1rem 1rem;
            }
            .custom-p-table .p-paginator {
              padding: 1rem !important;
              border-top: 1px solid #f3f4f6 !important;
              background-color: #ffffff !important;
            }
          `}} />
          <DataTable
            value={campaigns}
            paginator
            rows={10}
            loading={loading}
            responsiveLayout="scroll"
            className="custom-p-table"
            emptyMessage={
              <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700">Không tìm thấy chương trình nào</p>
                <p className="text-sm mt-1">Hãy thử thay đổi điều kiện lọc hoặc thêm chương trình mới.</p>
              </div>
            }
          >
            <Column
              field="name"
              header="Tên Chương trình"
              sortable
              body={nameBodyTemplate}
              style={{ minWidth: '240px' }}
            />
            <Column
              field="description"
              header="Mô tả chi tiết"
              body={(row) => (
                <div className="max-w-[280px] text-gray-500 text-sm truncate" title={row.description}>
                  {row.description || '-'}
                </div>
              )}
            />
            <Column
              field="start_date"
              header="Bắt đầu"
              sortable
              body={(row) => dateBodyTemplate(row, 'start_date')}
              style={{ minWidth: '150px' }}
            />
            <Column
              field="end_date"
              header="Kết thúc"
              sortable
              body={(row) => dateBodyTemplate(row, 'end_date')}
              style={{ minWidth: '150px' }}
            />
            <Column
              field="is_active"
              header="Trạng thái"
              body={statusBodyTemplate}
              sortable
              style={{ minWidth: '160px' }}
            />
            <Column
              header="SL"
              body={promotionCountBodyTemplate}
              style={{ minWidth: '100px' }}
            />
            <Column
              header="Thao tác"
              body={(rowData) => (
                <div className="flex gap-2">
                  <Link to={`/admin/campaigns/edit/${rowData.campaign_id}`}>
                    <button className="p-2 text-gray-400 hover:text-accent hover:bg-gold-50 rounded-lg transition-all" title="Sửa">
                      <Edit2 size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(rowData.campaign_id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              style={{ minWidth: '100px' }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;

