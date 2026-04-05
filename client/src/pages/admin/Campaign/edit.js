import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import campaignApi from '../../../api/campaignApi';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Calendar, Info, ToggleLeft, ToggleRight } from 'lucide-react';

const EditCampaign = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await campaignApi.getCampaignById(id, user?.token);
        const campaign = response.data;

        // Format dates for datetime-local input
        const formatDateForInput = (dateStr) => {
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          name: campaign.name || '',
          description: campaign.description || '',
          start_date: formatDateForInput(campaign.start_date),
          end_date: formatDateForInput(campaign.end_date),
          is_active: campaign.is_active,
        });
      } catch (error) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải thông tin chương trình',
          icon: 'error',
          confirmButtonColor: '#c48c46'
        });
        navigate('/admin/campaigns');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      is_active: !prev.is_active
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.start_date || !formData.end_date) {
      Swal.fire({
          title: 'Thông báo',
          text: 'Vui lòng nhập đầy đủ các trường bắt buộc',
          icon: 'warning',
          confirmButtonColor: '#c48c46'
      });
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      Swal.fire({
          title: 'Thông báo',
          text: 'Ngày kết thúc phải sau ngày bắt đầu',
          icon: 'warning',
          confirmButtonColor: '#c48c46'
      });
      return;
    }

    setLoading(true);
    try {
      await campaignApi.updateCampaign(
        id,
        {
          name: formData.name,
          description: formData.description,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          is_active: formData.is_active,
        },
        user.token,
      );
      await Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật chương trình thành công!',
        confirmButtonColor: '#c48c46',
      });
      navigate('/admin/campaigns');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.message || 'Không thể cập nhật chương trình. Vui lòng thử lại!',
        confirmButtonColor: '#c48c46',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gray-50/50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-full">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chỉnh sửa Khuyến mãi</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin chi tiết cho chương trình ưu đãi.</p>
          </div>
          <button 
            onClick={() => navigate('/admin/campaigns')}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Basic Info Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Info className="text-accent" size={20} />
                  Thông tin cơ bản
                </h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên Chương Trình <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Khuyến mãi sinh nhật 2024"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-700"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm về điều kiện áp dụng, đối tượng khách hàng..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all min-h-[120px] bg-gray-50/50 hover:bg-white focus:bg-white text-gray-700 resize-y"
                  />
                </div>
              </div>

              {/* Time Section */}
              <div className="space-y-5 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="text-accent" size={20} />
                  Thời gian áp dụng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="start_date"
                      name="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-5 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  Trạng thái hiển thị
                </h3>
                
                <div 
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleToggleActive}
                >
                  {formData.is_active ? 
                    <ToggleRight className="text-emerald-500 w-10 h-10 transition-colors" /> : 
                    <ToggleLeft className="text-gray-300 w-10 h-10 transition-colors" />
                  }
                  <div>
                    <p className="font-semibold text-gray-900 leading-none mb-1">Kích hoạt chương trình</p>
                    <p className="text-sm text-gray-500">Mở để cho phép khách hàng áp dụng khuyến mãi này.</p>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => navigate('/admin/campaigns')}
                className="px-6 py-2.5 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-brand-dark hover:bg-gold-500 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Lưu Thay Đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;
