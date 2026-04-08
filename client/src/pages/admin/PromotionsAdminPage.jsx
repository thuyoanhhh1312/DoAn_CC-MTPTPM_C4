import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import Swal from 'sweetalert2';
import PageContainer from '@/components/common/PageContainer';
import promotionApi from '@/api/promotionApi';
import campaignApi from '@/api/campaignApi';

const SEGMENT_OPTIONS = [
  { label: 'Tất cả khách hàng', value: null },
  { label: 'Sinh nhật', value: 'birthday' },
  { label: 'VIP', value: 'vip' },
  { label: 'Gold', value: 'gold' },
  { label: 'Silver', value: 'silver' },
  { label: 'Bronze', value: 'bronze' },
];

const PromotionsAdminPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const accessToken = user?.token;

  // State management
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    promotion_code: '',
    discount: 0,
    description: '',
    segment_target: null,
    campaign_id: null,
    usage_limit: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Authorization check
  useEffect(() => {
    if (!accessToken || ![1, 3].includes(Number(user?.role_id))) {
      navigate('/');
      Swal.fire('Lỗi', 'Bạn không có quyền truy cập trang này', 'error');
    }
  }, [accessToken, user, navigate]);

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: Math.floor(first / rows) + 1,
        limit: rows,
      };
      if (keyword) params.search = keyword;
      if (selectedSegment) params.segment_target = selectedSegment;

      const response = await promotionApi.getAllPromotions(params, accessToken);
      setPromotions(response.data || []);
      setTotalRecords(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách khuyến mãi', 'error');
    } finally {
      setLoading(false);
    }
  }, [first, rows, keyword, selectedSegment, accessToken]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const fetchCampaigns = useCallback(async () => {
    if (!accessToken) return;

    setLoadingCampaigns(true);
    try {
      const response = await campaignApi.getAllCampaigns({}, accessToken);
      setCampaigns(response?.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách chiến dịch', 'error');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Reset filters
  const handleReset = () => {
    setKeyword('');
    setSelectedSegment('');
    setFirst(0);
  };

  // Open Create Dialog
  const openCreateDialog = () => {
    setIsEditMode(false);
    setFormData({
      promotion_code: '',
      discount: 0,
      description: '',
      segment_target: null,
      campaign_id: null,
      usage_limit: null,
    });
    setDisplayDialog(true);
  };

  // Open Edit Dialog
  const openEditDialog = async (id) => {
    try {
      const response = await promotionApi.getPromotionById(id, accessToken);
      setFormData(response.data);
      setIsEditMode(true);
      setDisplayDialog(true);
    } catch (error) {
      console.error('Error loading promotion:', error);
      Swal.fire('Lỗi', 'Không thể tải thông tin khuyến mãi', 'error');
    }
  };

  // Close Dialog
  const handleDialogHide = () => {
    setDisplayDialog(false);
    setFormData({
      promotion_code: '',
      discount: 0,
      description: '',
      segment_target: null,
      campaign_id: null,
      usage_limit: null,
    });
  };

  // Submit Form
  const handleSubmit = async () => {
    // Validation
    if (!formData.promotion_code?.trim()) {
      Swal.fire('Cảnh báo', 'Vui lòng nhập mã khuyến mãi', 'warning');
      return;
    }
    if (formData.discount == null || formData.discount < 0 || formData.discount > 100) {
      Swal.fire('Cảnh báo', 'Discount phải là số từ 0 đến 100', 'warning');
      return;
    }
    if (formData.usage_limit != null && formData.usage_limit < 0) {
      Swal.fire('Cảnh báo', 'Giới hạn sử dụng phải >= 0', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        promotion_code: formData.promotion_code?.toUpperCase(),
        discount: formData.discount,
        description: formData.description || null,
        segment_target: formData.segment_target || null,
        campaign_id: formData.campaign_id || null,
        usage_limit: formData.usage_limit || null,
      };

      if (isEditMode) {
        // Update
        await promotionApi.updatePromotion(formData.promotion_id, payload, accessToken);
        Swal.fire('Thành công', 'Khuyến mãi đã được cập nhật', 'success');
      } else {
        // Create
        await promotionApi.createPromotion(payload, accessToken);
        Swal.fire('Thành công', 'Khuyến mãi đã được tạo', 'success');
      }

      handleDialogHide();
      fetchPromotions();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || 'Có lỗi xảy ra khi lưu khuyến mãi';
      Swal.fire('Lỗi', errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete promotion
  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: 'Xóa khuyến mãi',
      text: `Bạn chắc chắn muốn xóa khuyến mãi "${code}"? Thao tác này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await promotionApi.deletePromotion(id, accessToken);
        setPromotions(promotions.filter((p) => p.promotion_id !== id));
        Swal.fire('Đã xóa!', 'Khuyến mãi đã được xóa thành công.', 'success');
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        Swal.fire('Lỗi', 'Không thể xóa khuyến mãi', 'error');
      }
    }
  };

  // Action template
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => openEditDialog(rowData.promotion_id)}
          title="Chỉnh sửa"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.promotion_id, rowData.promotion_code)}
          title="Xóa"
        />
      </div>
    );
  };

  // Code template
  const codeBodyTemplate = (rowData) => {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        {rowData.promotion_code}
      </span>
    );
  };

  // Discount template
  const discountBodyTemplate = (rowData) => {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
        {rowData.discount}%
      </span>
    );
  };

  // Segment template
  const segmentBodyTemplate = (rowData) => {
    const segmentMap = {
      birthday: { label: 'Sinh nhật', color: 'info' },
      vip: { label: 'VIP', color: 'warning' },
      gold: { label: 'Gold', color: 'success' },
      silver: { label: 'Silver', color: 'secondary' },
      bronze: { label: 'Bronze', color: 'secondary' },
    };
    const segment = segmentMap[rowData.segment_target];
    if (!segment) {
      return <span className="text-gray-500">Tất cả</span>;
    }
    return <Tag value={segment.label} severity={segment.color} />;
  };

  // Usage template
  const usageBodyTemplate = (rowData) => {
    const limit = rowData.usage_limit;
    const count = rowData.usage_count;
    if (!limit) return <span className="text-gray-500">Không giới hạn</span>;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {count}/{limit}
        </span>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-colors ${
              count >= limit ? 'bg-red-500' : count >= limit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((count / limit) * 100, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Date template
  const dateBodyTemplate = (rowData) => {
    if (!rowData.created_at) return '-';
    return new Date(rowData.created_at).toLocaleDateString('vi-VN');
  };

  return (
    <PageContainer title="Quản lý khuyến mãi" subtitle="Tạo, chỉnh sửa, và xóa các chương trình khuyến mãi">
      {/* Filter Section */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm mã
            </label>
            <InputText
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập mã khuyến mãi..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng mục tiêu
            </label>
            <Dropdown
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.value)}
              options={SEGMENT_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn đối tượng..."
              className="w-full"
            />
          </div>

          <div className="flex gap-2 items-end">
            <Button
              label="Đặt lại"
              icon="pi pi-refresh"
              onClick={handleReset}
              className="p-button-secondary w-full"
            />
          </div>

          <div className="flex gap-2 items-end">
            <Button
              label="Thêm mới"
              icon="pi pi-plus"
              onClick={openCreateDialog}
              className="p-button-primary w-full"
            />
          </div>
        </div>
      </div>

      {/* DataTable Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          value={promotions}
          loading={loading}
          paginator
          rows={rows}
          first={first}
          totalRecords={totalRecords}
          onPage={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate={`Hiển thị {first} đến {last} trên {totalRecords} khuyến mãi`}
          responsiveLayout="scroll"
          emptyMessage="Không có khuyến mãi nào"
          className="w-full"
        >
          <Column field="promotion_code" header="Mã khuyến mãi" body={codeBodyTemplate} style={{ width: '150px' }} />
          <Column field="discount" header="Giảm giá" body={discountBodyTemplate} style={{ width: '100px' }} />
          <Column field="segment_target" header="Đối tượng" body={segmentBodyTemplate} style={{ width: '120px' }} />
          <Column field="usage_count" header="Sử dụng" body={usageBodyTemplate} style={{ width: '180px' }} />
          <Column field="description" header="Mô tả" style={{ width: '200px' }} />
          <Column field="created_at" header="Ngày tạo" body={dateBodyTemplate} style={{ width: '120px' }} />
          <Column
            header="Hành động"
            body={actionBodyTemplate}
            style={{ width: '100px' }}
            className="text-center"
          />
        </DataTable>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        visible={displayDialog}
        style={{ width: '50vw', minWidth: '300px' }}
        header={isEditMode ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
        modal
        onHide={handleDialogHide}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Hủy"
              icon="pi pi-times"
              onClick={handleDialogHide}
              className="p-button-secondary"
            />
            <Button
              label={isEditMode ? 'Cập nhật' : 'Tạo'}
              icon="pi pi-check"
              onClick={handleSubmit}
              loading={submitting}
              className="p-button-primary"
            />
          </div>
        }
      >
        <div className="space-y-4">
          {/* Promotion Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã khuyến mãi <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.promotion_code}
              onChange={(e) =>
                setFormData({ ...formData, promotion_code: e.target.value })
              }
              placeholder="VD: SUMMER2024"
              className="w-full"
              disabled={isEditMode}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode ? 'Mã khuyến mãi không thể thay đổi' : 'Nhập mã duy nhất (sẽ được chuyển thành chữ hoa)'}
            </p>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức giảm giá (%) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={formData.discount}
              onValueChange={(e) =>
                setFormData({ ...formData, discount: e.value })
              }
              min={0}
              max={100}
              suffix=" %"
              className="w-full"
            />
          </div>

          {/* Segment Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng mục tiêu
            </label>
            <Dropdown
              value={formData.segment_target}
              onChange={(e) =>
                setFormData({ ...formData, segment_target: e.value })
              }
              options={SEGMENT_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn đối tượng..."
              className="w-full"
            />
          </div>

          {/* Campaign ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID chiến dịch
            </label>
            <Dropdown
              value={formData.campaign_id}
              onChange={(e) =>
                setFormData({ ...formData, campaign_id: e.value })
              }
              placeholder="Tùy chọn"
              options={[
                { label: 'Không gán campaign', value: null },
                ...campaigns.map((campaign) => ({
                  label: campaign.name,
                  value: campaign.campaign_id,
                })),
              ]}
              optionLabel="label"
              optionValue="value"
              className="w-full"
              filter
              showClear
              loading={loadingCampaigns}
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới hạn sử dụng
            </label>
            <InputNumber
              value={formData.usage_limit}
              onValueChange={(e) =>
                setFormData({ ...formData, usage_limit: e.value })
              }
              placeholder="Để trống nếu không giới hạn"
              className="w-full"
              useGrouping={false}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <InputTextarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả chi tiết..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Display Usage Info in Edit Mode */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Thống kê sử dụng:</strong> {formData.usage_count}/
                {formData.usage_limit || 'Không giới hạn'} lần
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </PageContainer>
  );
};

export default PromotionsAdminPage;
