import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import newsApi from '../../../api/newsApi';
import newsCategoryApi from '../../../api/newsCategoryApi';
import { Edit, Trash2, Plus, Filter, Search, Tag, FileText, ChevronRight, CheckCircle2, Clock, Archive } from 'lucide-react';

const News = () => {
  const user = useSelector((state) => state?.user);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState([]);

  // Load danh sách bài viết
  const fetchNews = async (status = '', categoryId = '') => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
      };
      if (status) {
        params.status = status;
      } else {
        params.status = 'all'; 
      }
      if (categoryId) {
        params.article_category_id = categoryId;
      }
      const response = await newsApi.getAdminNews(params, user?.token);
      const data = Array.isArray(response?.data) ? response.data : [];
      setNews(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách bài viết:', error);
      Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải danh sách bài viết.',
          icon: 'error',
          confirmButtonColor: '#c48c46'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const data = await newsCategoryApi.getNewsCategories();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh mục:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    fetchNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    fetchNews(status, categoryFilter);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    const categoryId = e.target.value;
    setCategoryFilter(categoryId);
    fetchNews(statusFilter, categoryId);
  };

  // Lọc theo từ khóa tìm kiếm (Client-side)
  const filteredNews = news.filter(item => 
    item.title?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Xóa bài viết
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa bài viết?',
      text: 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Xóa bài viết',
      cancelButtonText: 'Hủy bỏ',
    });

    if (result.isConfirmed) {
      try {
        await newsApi.deleteNews(id, user?.token);
        Swal.fire({
            title: 'Đã xóa!',
            text: 'Bài viết đã được xóa thành công.',
            icon: 'success',
            confirmButtonColor: '#c48c46'
        });
        setNews(news.filter((item) => item.article_id !== id));
      } catch (error) {
        console.error('Lỗi xóa bài viết:', error);
        Swal.fire({
            title: 'Lỗi',
            text: 'Không thể xóa bài viết.',
            icon: 'error',
            confirmButtonColor: '#c48c46'
        });
      }
    }
  };

  // Template hiển thị ngày
  const dateBodyTemplate = (rowData) => {
    return (
        <span className="flex items-center gap-2 text-gray-500">
            <Clock size={14} className="text-gray-400" />
            {rowData.published_at ? dayjs(rowData.published_at).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
    );
  };

  // Template hiển thị category 
  const categoryBodyTemplate = (rowData) => {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          <Tag size={12} />
          {rowData.category?.category_name || 'Không có'}
        </span>
      );
  }

  // Template hiển thị status
  const statusBodyTemplate = (rowData) => {
    if (rowData.status === 'draft') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Nháp
            </span>
        )
    }
    if (rowData.status === 'published') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã xuất bản
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm leading-none">
            <Archive size={12} /> Lưu trữ
        </span>
    );
  };

  const titleBodyTemplate = (rowData) => {
      return (
          <span className="font-semibold text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
              {rowData.title}
          </span>
      )
  }

  // Template hiển thị nội dung preview
  const contentBodyTemplate = (rowData) => {
    const excerpt = rowData.excerpt || rowData.content || '';
    let text = (excerpt || '').replace(/<[^>]*>/g, '').substring(0, 100);
    return <span className="text-gray-500 text-sm line-clamp-2">{text}{text.length >= 100 ? '...' : ''}</span>;
  };

  // Template actions
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex items-center gap-2">
        <Link to={`/admin/news/edit/${rowData.article_id}`}>
          <button 
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Chỉnh sửa bài viết"
          >
            <Edit size={18} />
          </button>
        </Link>
        <button
          onClick={() => handleDelete(rowData.article_id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          title="Xóa bài viết"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  // Custom empty block
  const emptyTemplate = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FileText size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy bài viết nào</h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Chưa có bài viết nào trong danh sách. Hãy thêm bài viết mới để cung cấp nội dung cho cửa hàng.
      </p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#faf7f2] min-h-full">
      <style>{`
        .custom-p-table .p-datatable-wrapper {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #f3f4f6;
        }
        .custom-p-table .p-datatable-thead > tr > th {
          background-color: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .custom-p-table .p-datatable-tbody > tr {
          transition: background-color 0.2s;
        }
        .custom-p-table .p-datatable-tbody > tr:hover {
          background-color: #f8fafc;
        }
        .custom-p-table .p-datatable-tbody > tr > td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          vertical-align: middle;
        }
        /* Pagination Styling */
        .custom-p-table .p-paginator {
          background-color: transparent;
          border: none;
          padding: 1.5rem 0 0 0;
          justify-content: flex-end;
        }
        .custom-p-table .p-paginator .p-paginator-pages .p-paginator-page {
          border-radius: 0.5rem;
          min-width: 2.5rem;
          height: 2.5rem;
          color: #6b7280;
          margin: 0 0.125rem;
        }
        .custom-p-table .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background-color: #1a1a2e;
          color: #ffffff;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Tin Tức</h1>
            <p className="text-sm text-gray-500 mt-1">Danh sách tin tức, bài biết blog kiến thức và SEO.</p>
          </div>
          <div className="flex gap-3">
             <Link to="/admin/news-categories">
              <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm">
                <Tag size={18} />
                <span>Quản Lý Danh Mục</span>
              </button>
            </Link>
            <Link to="/admin/news/add">
              <button className="inline-flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#c48c46] text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm">
                <Plus size={18} />
                <span>Thêm Bài Viết</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c48c46]/50 focus:border-[#c48c46] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
             <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-[#c48c46] transition-colors shrink-0">
              <Filter className="text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer py-1 !ring-0"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-[#c48c46] transition-colors shrink-0">
              <Tag className="text-gray-400" size={16} />
              <select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer py-1 !ring-0 max-w-[150px] truncate"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.article_category_id} value={cat.article_category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative custom-p-table">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-2xl">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#c48c46] rounded-full animate-spin mb-3"></div>
              </div>
            </div>
          ) : null}

          <DataTable
            value={filteredNews}
            paginator
            rows={10}
            emptyMessage={emptyTemplate}
            paginatorTemplate="PrevPageLink PageLinks NextPageLink"
            responsiveLayout="scroll"
            className="border-none"
            rowHover
          >
            <Column field="article_id" header="ID" width="80px" sortable />
            <Column field="title" header="Tiêu Đề Bài Viết" body={titleBodyTemplate} sortable />
            <Column field="category.category_name" header="Danh Mục" body={categoryBodyTemplate} width="160px" />
            <Column header="Nội Dung Tóm Tắt" body={contentBodyTemplate} style={{ minWidth: '300px' }} />
            <Column header="Trạng Thái" body={statusBodyTemplate} width="140px" />
            <Column header="Ngày Xuất Bản" body={dateBodyTemplate} width="180px" sortable />
            <Column header="Thao Tác" body={actionBodyTemplate} align="right" width="120px" />
          </DataTable>
        </div>

      </div>
    </div>
  );
};

export default News;
