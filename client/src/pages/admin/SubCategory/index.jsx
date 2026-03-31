import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import React, { useEffect, useState } from "react";
import SubCategoryAPI from "../../../api/subCategoryApi";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";

const SubCategory = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);

  const fetchSubCategories = async () => {
    try {
      const data = await SubCategoryAPI.getSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      Swal.fire("Lỗi", "Không thể tải danh sách nhóm sản phẩm.", "error");
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const data = await SubCategoryAPI.getSubCategories();
        if (active) {
          setSubCategories(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách nhóm sản phẩm.", "error");
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn muốn dừng bán?",
      text: "Danh mục con sẽ được giữ lại, chỉ dừng bán sản phẩm liên quan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "HỦY",
    });

    if (result.isConfirmed) {
      try {
        const response = await SubCategoryAPI.deleteSubCategory(
          id,
          accessToken,
        );
        await fetchSubCategories();
        Swal.fire(
          "Đã dừng bán!",
          response?.message || "Đã dừng bán sản phẩm thuộc danh mục con.",
          "success",
        );
      } catch (error) {
        console.error("Lỗi khi dừng bán danh mục:", error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          Swal.fire(
            "Phiên đăng nhập hết hạn",
            "Vui lòng đăng nhập lại để tiếp tục.",
            "warning",
          );
          navigate("/signin");
          return;
        }
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi dừng bán danh mục!", "error");
      }
    }
  };

  const statusTemplate = (rowData) => {
    const isStopped = Boolean(rowData.is_stopped_selling);
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          isStopped
            ? "bg-gray-200 text-gray-800"
            : "bg-green-100 text-green-700"
        }`}
      >
        {isStopped ? "Dừng bán" : "Đang bán"}
      </span>
    );
  };

  return (
    <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-md">
      {/* Tiêu đề */}
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-[32px] font-bold">SubCategory List</h1>
        <div>
          <Link to="/admin/subcategories/add">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Add New SubCategory
            </button>
          </Link>
        </div>
      </div>

      <DataTable
        value={subCategories}
        paginator
        rows={10}
        showGridlines
        paginatorTemplate="PrevPageLink PageLinks NextPageLink"
      >
        <Column
          field="subcategory_id"
          header="ID"
          sortable
          headerClassName="bg-[#d2d4d6]"
        ></Column>
        <Column
          field="subcategory_name"
          header="Tên Danh Mục Con"
          sortable
          headerClassName="bg-[#d2d4d6]"
        ></Column>
        <Column
          field="description"
          header="Mô Tả"
          sortable
          headerClassName="bg-[#d2d4d6]"
        ></Column>
        <Column
          field="Category.category_name"
          header="Danh Mục"
          sortable
          headerClassName="bg-[#d2d4d6]"
        ></Column>
        <Column
          body={statusTemplate}
          header="Trạng thái"
          headerClassName="bg-[#d2d4d6]"
        ></Column>
        <Column
          body={(rowData) => (
            <div className="flex flex-row gap-2">
              <Link to={`/admin/subcategories/edit/${rowData.subcategory_id}`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded">
                  Edit
                </button>
              </Link>
              <button
                onClick={() => handleDelete(rowData.subcategory_id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Dừng bán
              </button>
            </div>
          )}
          header="Actions"
          headerClassName="bg-[#d2d4d6]"
        ></Column>
      </DataTable>
    </div>
  );
};

export default SubCategory;
