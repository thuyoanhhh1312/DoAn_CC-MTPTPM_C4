import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import newsCategoryApi from "../../../api/newsCategoryApi";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Layers,
  FileText,
  ArrowLeft,
} from "lucide-react";

const NewsCategory = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Load danh sách danh mục
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await newsCategoryApi.getNewsCategories();
      const data = Array.isArray(response) ? response : response?.data || [];
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục tin tức:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể tải danh mục tin tức.",
        icon: "error",
        confirmButtonColor: "#c48c46",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter local for search
  const filteredCategories = categories.filter((cat) =>
    cat.category_name?.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  // Xóa danh mục
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa danh mục?",
      text: "Bạn có chắc chắn muốn xóa danh mục này không? Các bài viết thuộc danh mục này có thể bị ảnh hưởng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Xóa danh mục",
      cancelButtonText: "Hủy bỏ",
    });

    if (result.isConfirmed) {
      try {
        await newsCategoryApi.deleteNewsCategory(id, user?.token);
        Swal.fire({
          title: "Đã xóa!",
          text: "Danh mục đã được xóa thành công.",
          icon: "success",
          confirmButtonColor: "#c48c46",
        });
        setCategories(
          categories.filter((cat) => cat.article_category_id !== id),
        );
      } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
        const statusCode = error?.response?.status;
        const backendMessage = error?.response?.data?.message;

        const userMessage =
          statusCode === 409
            ? backendMessage ||
              "Danh mục này đang có bài viết liên kết, vui lòng chuyển bài viết sang danh mục khác trước khi xóa."
            : backendMessage || "Không thể xóa danh mục.";

        Swal.fire({
          title: "Lỗi",
          text: userMessage,
          icon: "error",
          confirmButtonColor: "#c48c46",
        });
      }
    }
  };

  const nameBodyTemplate = (rowData) => {
    return (
      <span className="font-semibold text-gray-900">
        {rowData.category_name}
      </span>
    );
  };

  const slugBodyTemplate = (rowData) => {
    return (
      <span className="text-gray-500 font-mono text-sm bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">
        {rowData.slug}
      </span>
    );
  };

  const descBodyTemplate = (rowData) => {
    return (
      <span className="text-gray-500 text-sm line-clamp-2">
        {rowData.description || (
          <span className="text-gray-300 italic">Không có mô tả</span>
        )}
      </span>
    );
  };

  // Template actions
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex items-center gap-2">
        <Link to={`/admin/news-categories/edit/${rowData.article_category_id}`}>
          <button
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Chỉnh sửa danh mục"
          >
            <Edit size={18} />
          </button>
        </Link>
        <button
          onClick={() => handleDelete(rowData.article_category_id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          title="Xóa danh mục"
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
        <Layers size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Không tìm thấy danh mục nào
      </h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Chưa có danh mục tin tức nào trong danh sách. Hãy thêm danh mục mới để
        phân loại nội dung biểu đạt.
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

      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Danh Mục Tin Tức
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Phân loại và quản lý các chuyên mục bài viết.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/news">
              <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm">
                <ArrowLeft size={18} />
                <span>Quay lại trang Tin tức</span>
              </button>
            </Link>
            <Link to="/admin/news-categories/add">
              <button className="inline-flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#c48c46] text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm shadow-sm">
                <Plus size={18} />
                <span>Thêm Danh Mục</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c48c46]/50 focus:border-[#c48c46] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
            />
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
            value={filteredCategories}
            paginator
            rows={10}
            emptyMessage={emptyTemplate}
            paginatorTemplate="PrevPageLink PageLinks NextPageLink"
            responsiveLayout="scroll"
            className="border-none"
            rowHover
          >
            <Column
              field="article_category_id"
              header="ID"
              width="100px"
              sortable
            />
            <Column
              field="category_name"
              header="Tên Danh Mục"
              body={nameBodyTemplate}
              sortable
            />
            <Column
              field="slug"
              header="Slug / Đường dẫn"
              body={slugBodyTemplate}
              sortable
            />
            <Column
              field="description"
              header="Mô Tả Danh Mục"
              body={descBodyTemplate}
            />
            <Column
              header="Thao Tác"
              body={actionBodyTemplate}
              align="right"
              width="140px"
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default NewsCategory;
