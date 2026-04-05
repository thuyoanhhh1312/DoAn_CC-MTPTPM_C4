import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import newsApi from '../../../api/newsApi';
import newsCategoryApi from '../../../api/newsCategoryApi';
import tagApi from '../../../api/tagApi';
import FullScreenLoader from '../../../components/ui/loading/FullScreenLoader';
import RichTextEditor from '../../../components/RichTextEditor';
import { ArrowLeft, Save, FileText, Link as LinkIcon, Folder, Image as ImageIcon, AlignLeft, LayoutList, Calendar, Tags, CheckCircle2 } from 'lucide-react';

const AddNews = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    article_category_id: '',
    status: 'draft',
    published_at: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [selectedTags, setSelectedTags] = useState([]);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Load categories và tags
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, tagsData] = await Promise.all([
          newsCategoryApi.getNewsCategories(),
          tagApi.getTags(),
        ]);
        setCategories(Array.isArray(catsData) ? catsData : catsData?.data || []);
        setTags(Array.isArray(tagsData) ? tagsData : tagsData?.data || []);
      } catch (error) {
        console.error('Lỗi tải danh mục/tags:', error);
        Swal.fire({
            title: 'Lỗi',
            text: 'Không thể tải danh mục hoặc tags.',
            icon: 'error',
            confirmButtonColor: '#c48c46'
        });
      }
    };
    loadData();
  }, []);

  // Xử lý form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thumbnail URL
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file); // ⬅️ lưu File
      setThumbnailPreview(URL.createObjectURL(file)); // preview
    }
  };

  // Auto generate slug từ title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  // Toggle tag
  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return Swal.fire({title: 'Lỗi', text: 'Vui lòng nhập tiêu đề.', icon: 'warning', confirmButtonColor: '#c48c46'});
    }
    if (!formData.slug.trim()) {
      return Swal.fire({title: 'Lỗi', text: 'Vui lòng nhập slug.', icon: 'warning', confirmButtonColor: '#c48c46'});
    }
    if (!formData.article_category_id) {
      return Swal.fire({title: 'Lỗi', text: 'Vui lòng chọn danh mục.', icon: 'warning', confirmButtonColor: '#c48c46'});
    }
    if (!formData.content.trim()) {
      return Swal.fire({title: 'Lỗi', text: 'Vui lòng nhập nội dung.', icon: 'warning', confirmButtonColor: '#c48c46'});
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        article_category_id: Number(formData.article_category_id),
        status: formData.status,
        tags: selectedTags,
      };

      if (formData.published_at) {
        payload.published_at = new Date(formData.published_at).toISOString();
      }

      await newsApi.createNews(payload, thumbnailFile, user?.token);

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Bài viết đã được tạo.',
        confirmButtonColor: '#c48c46',
      });

      navigate('/admin/news');
    } catch (error) {
      console.error('Lỗi tạo bài viết:', error);
      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: error?.response?.data?.message || 'Không thể tạo bài viết.',
        confirmButtonColor: '#c48c46',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#faf7f2] min-h-full">
      {loading && <FullScreenLoader />}

      <div className="max-w-[1000px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              to="/admin/news" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c48c46] transition-colors mb-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
            <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Tạo Bài Viết Mới</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cột trái (Nội dung chính) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] p-6 sm:p-8 space-y-6">
                
                {/* Tiêu đề */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText size={16} className="text-[#c48c46]" />
                    Tiêu Đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Nhập tiêu đề bài viết"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <LinkIcon size={16} className="text-[#c48c46]" />
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    placeholder="Slug sẽ tự động generate từ tiêu đề"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900 font-mono text-sm"
                  />
                </div>

                {/* Tóm tắt */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <AlignLeft size={16} className="text-[#c48c46]" />
                    Tóm Tắt (Excerpt)
                  </label>
                  <textarea
                    name="excerpt"
                    placeholder="Tóm tắt ngắn gọn của bài viết (tùy chọn)"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900 resize-none"
                  />
                </div>

                {/* Nội dung */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                    <LayoutList size={16} className="text-[#c48c46]" />
                    Nội Dung <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#c48c46] focus-within:ring-2 focus-within:ring-[#c48c46]/20 transition-all">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(html) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: html,
                        }))
                      }
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Cột phải (Thuộc tính) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] p-6 space-y-6">
                
                {/* Trạng thái & Xuất bản */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <CheckCircle2 size={16} className="text-[#c48c46]" />
                      Trạng Thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900"
                    >
                      <option value="draft">Nháp</option>
                      <option value="published">Đã Xuất Bản</option>
                      <option value="archived">Lưu Trữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="text-[#c48c46]" />
                      Ngày Xuất Bản
                    </label>
                    <input
                      type="datetime-local"
                      name="published_at"
                      value={formData.published_at}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Danh mục */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Folder size={16} className="text-[#c48c46]" />
                    Danh Mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="article_category_id"
                    value={formData.article_category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-transparent focus:bg-white focus:border-[#c48c46] focus:ring-2 focus:ring-[#c48c46]/20 rounded-xl outline-none transition-all duration-200 text-gray-900"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.article_category_id} value={cat.article_category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="border-gray-100" />

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Tags size={16} className="text-[#c48c46]" />
                      Tags bài viết
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.tag_id}
                          type="button"
                          onClick={() => toggleTag(tag.tag_id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag.tag_id)
                              ? 'bg-[#1a1a2e] text-white shadow-md'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-gray-100" />

                {/* Ảnh đại diện */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon size={16} className="text-[#c48c46]" />
                    Ảnh Đại Diện
                  </label>
                  <div className="mt-2 flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-[#faf7f2] hover:bg-gray-50 hover:border-[#c48c46] transition-all overflow-hidden relative group">
                      {thumbnailPreview ? (
                        <>
                          <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium text-sm flex items-center gap-2"><ImageIcon size={16}/> Đổi ảnh khác</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-[#c48c46]">Click để tải lên</span></p>
                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (Tối đa 5MB)</p>
                        </div>
                      )}
                      <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                    </label>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e8e4de] p-4 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-[#1a1a2e] hover:bg-[#c48c46] text-white font-medium rounded-xl transition-colors disabled:opacity-70 shadow-md"
                >
                  <Save size={18} />
                  {loading ? 'Đang xử lý...' : 'Đăng Bài Viết'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/news')}
                  className="w-full px-6 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy thay đổi
                </button>
              </div>

            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNews;
