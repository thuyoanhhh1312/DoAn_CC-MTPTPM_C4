import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import newsCategoryApi from '../../../api/newsCategoryApi';
import FullScreenLoader from '../../../components/ui/loading/FullScreenLoader';
import { ArrowLeft, Save, LayoutGrid, Link as LinkIcon, AlignLeft } from 'lucide-react';

const EditNewsCategory = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category_name: '',
    slug: '',
    description: '',
  });

  // Load danh mục
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const data = await newsCategoryApi.getNewsCategoryById(id, user?.token);
        setFormData({
          category_name: data.category_name || '',
          slug: data.slug || '',
          description: data.description || '',
        });
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
        Swal.fire({
            title: 'Lỗi',
            text: 'Không thể tải thông tin danh mục.',
            icon: 'error',
            confirmButtonColor: '#c48c46'
        });
        navigate('/admin/news-categories');
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [id, navigate, user?.token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto generate slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category_name: name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name.trim()) {
      return Swal.fire({
          title: 'Thiếu thông tin',
          text: 'Vui lòng nhập tên danh mục.',
          icon: 'warning',
          confirmButtonColor: '#c48c46'
      });
    }
    if (!formData.slug.trim()) {
      return Swal.fire({
          title: 'Thiếu thông tin',
          text: 'Vui lòng nhập slug.',
          icon: 'warning',
          confirmButtonColor: '#c48c46'
      });
    }

    setSubmitting(true);

    try {
      await newsCategoryApi.updateNewsCategory(
        id,
        {
          category_name: formData.category_name,
          slug: formData.slug,
          description: formData.description,
        },
        user?.token,
      );

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Danh mục đã được cập nhật.',
        confirmButtonColor: '#c48c46',
      });

      navigate('/admin/news-categories');
    } catch (error) {
      console.error('Lỗi cập nhật danh mục:', error);
      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: error?.response?.data?.message || 'Không thể cập nhật danh mục.',
        confirmButtonColor: '#c48c46',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#faf7f2] min-h-full flex justify-center">
      {submitting && <FullScreenLoader />}

      <div className="max-w-2xl w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              to="/admin/news-categories" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c48c46] transition-colors mb-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
            <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Chỉnh Sửa Danh Mục Tin Tức</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <div className="space-y-6">
              
              {/* Tên danh mục */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <LayoutGrid size={16} className="text-[#c48c46]" />
                  Tên Danh Mục <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="category_name"
                    placeholder="VD: Tin tức thị trường"
                    value={formData.category_name}
                    onChange={handleNameChange}
                    className="w-full px-4 py-3 bg-[#faf7f2] group-hover:bg-[#f0ebe1] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <LinkIcon size={16} className="text-[#c48c46]" />
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="slug"
                    placeholder="VD: tin-tuc-thi-truong"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-[#faf7f2] group-hover:bg-[#f0ebe1] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">Đường dẫn này được tạo tự động và hiển thị trên URL của trang web.</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <AlignLeft size={16} className="text-[#c48c46]" />
                  Mô Tả
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    placeholder="Mô tả danh mục (tùy chọn)"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-[#faf7f2] group-hover:bg-[#f0ebe1] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900 resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/admin/news-categories')}
                className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a2e] hover:bg-[#c48c46] text-white font-medium rounded-xl transition-colors disabled:opacity-70 flex-1 sm:flex-none"
              >
                <Save size={18} />
                {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditNewsCategory;
