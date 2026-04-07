import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import Swal from 'sweetalert2';
import PageContainer from '@/components/common/PageContainer';
import * as productApi from '@/api/productApi';
import './styles.css';

const ProductList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const accessToken = user?.token || localStorage.getItem("accessToken");
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [expandedRows, setExpandedRows] = useState(null);

  // Check authorization
  useEffect(() => {
    if (!accessToken || (user?.role_id !== 1 && user?.role_id !== 3)) {
      navigate('/');
      Swal.fire('Error', 'Bạn không có quyền truy cập trang này', 'error');
    }
  }, [accessToken, user, navigate]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productApi.getProducts(keyword);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire('Error', 'Lỗi khi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    fetchProducts();
  }, [keyword, fetchProducts]);

  // Image Template
  const imageBodyTemplate = (rowData) => {
    const images = rowData?.ProductImages || [];
    if (images.length === 0) {
      return <span className="text-gray-400">No Image</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {images.slice(0, 3).map((image, index) => (
          <Image
            key={index}
            src={image.image_url}
            alt={image.alt_text || `Image ${index + 1}`}
            width="80"
            height="60"
            preview
            className="object-cover rounded"
          />
        ))}
        {images.length > 3 && (
          <div className="w-20 h-15 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-sm text-gray-600">+{images.length - 3}</span>
          </div>
        )}
      </div>
    );
  };

  // Price Template
  const priceBodyTemplate = (rowData) => {
    return (rowData.price ? `₫${rowData.price.toLocaleString('vi-VN')}` : 'N/A');
  };

  // Status Template
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.is_active ? 'Active' : 'Inactive'}
        severity={rowData.is_active ? 'success' : 'danger'}
        onClick={() => handleToggleStatus(rowData.product_id, !rowData.is_active)}
        className="cursor-pointer"
        title="Click to toggle"
      />
    );
  };

  // Action Template
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => navigate(`/admin/products/edit/${rowData.product_id}`)}
          title="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.product_id, rowData.product_name)}
          title="Delete"
        />
      </div>
    );
  };

  // Toggle Status
  const handleToggleStatus = async (productId, newStatus) => {
    try {
      const product = products.find((p) => p.product_id === productId);
      if (!product) return;

      const formData = new FormData();
      formData.append('product_name', product.product_name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('quantity', product.quantity);
      formData.append('category_id', product.category_id);
      formData.append('subcategory_id', product.subcategory_id);
      formData.append('is_active', newStatus);

      await productApi.updateProduct(productId, formData, accessToken);
      
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === productId ? { ...p, is_active: newStatus } : p
        )
      );

      Swal.fire('Success', 'Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      console.error('Error toggling status:', error);
      Swal.fire('Error', 'Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  // Delete Product
  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await productApi.deleteProduct(productId, accessToken);
        setProducts((prev) => prev.filter((p) => p.product_id !== productId));
        Swal.fire('Deleted!', 'Sản phẩm đã được xóa.', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Error', 'Lỗi khi xóa sản phẩm', 'error');
      }
    }
  };

  // Search handler with debounce
  const handleSearch = (value) => {
    setKeyword(value);
  };

  return (
    <PageContainer title="Quản Lý Sản Phẩm" description="Quản lý danh sách sản phẩm">
      <div className="card">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex gap-2 flex-1">
            <InputText
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="p-inputtext-sm"
              style={{ maxWidth: '300px' }}
            />
          </div>
          <Button
            label="Thêm Sản Phẩm"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => navigate('/admin/products/add')}
          />
        </div>

        {/* DataTable */}
        <DataTable
          value={products}
          loading={loading}
          paginator
          rows={10}
          dataKey="product_id"
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          expandedRows={expandedRows}
          onExpandedRowsChange={(e) => setExpandedRows(e)}
          className="p-datatable-striped"
          stripedRows
          responsiveLayout="scroll"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />

          <Column 
            field="product_id" 
            header="ID" 
            sortable
            style={{ width: '80px' }}
          />

          <Column
            header="Ảnh"
            body={imageBodyTemplate}
            style={{ width: '250px' }}
          />

          <Column
            field="product_name"
            header="Tên Sản Phẩm"
            sortable
            style={{ width: '250px' }}
          />

          <Column
            field="price"
            header="Giá"
            body={priceBodyTemplate}
            sortable
            style={{ width: '150px' }}
          />

          <Column
            field="quantity"
            header="Số Lượng"
            sortable
            style={{ width: '120px' }}
          />

          <Column
            field="Category.category_name"
            header="Danh Mục"
            style={{ width: '150px' }}
          />

          <Column
            header="Trạng Thái"
            body={statusBodyTemplate}
            style={{ width: '120px' }}
          />

          <Column
            header="Hành Động"
            body={actionBodyTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>
    </PageContainer>
  );
};

export default ProductList;
