import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { FileUpload } from 'primereact/fileupload';
import Swal from 'sweetalert2';
import PageContainer from '@/components/common/PageContainer';
import * as productApi from '@/api/productApi';
import * as categoryApi from '@/api/categoryApi';
import './styles.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { accessToken, user } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: null,
    quantity: null,
    category_id: null,
    subcategory_id: null,
    is_active: false,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check authorization
  useEffect(() => {
    if (!accessToken || (user?.role_id !== 1 && user?.role_id !== 3)) {
      navigate('/');
      Swal.fire('Error', 'Bạn không có quyền truy cập trang này', 'error');
    }
  }, [accessToken, user, navigate]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const data = await categoryApi.getSubcategoriesByCategory(categoryId);
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, is_active: value }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Tên sản phẩm không được để trống';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }
    if (formData.quantity === null || formData.quantity < 0) {
      newErrors.quantity = 'Số lượng phải >= 0';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục';
    }
    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Vui lòng chọn danh mục con';
    }
    if (images.length === 0) {
      newErrors.images = 'Vui lòng chọn ít nhất 1 ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire('Error', 'Vui lòng điền đầy đủ các trường và chọn ít nhất 1 ảnh', 'error');
      return;
    }

    setLoading(true);
    try {
      await productApi.createProduct(
        formData.product_name,
        formData.description,
        formData.price,
        formData.quantity,
        formData.category_id,
        formData.subcategory_id,
        images,
        accessToken,
        formData.is_active
      );

      Swal.fire('Success', 'Tạo sản phẩm thành công', 'success');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      Swal.fire('Error', error.response?.data?.message || 'Lỗi khi tạo sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Thêm Sản Phẩm Mới" description="Tạo sản phẩm mới">
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <InputText
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                maxLength="255"
                className={`w-full ${errors.product_name ? 'p-invalid' : ''}`}
              />
              {errors.product_name && (
                <small className="text-red-500 block mt-1">{errors.product_name}</small>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Giá <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={formData.price}
                onValueChange={(e) => handleNumberChange('price', e.value)}
                placeholder="Nhập giá"
                locale="vi-VN"
                currency="VND"
                currencyDisplay="symbol"
                className={`w-full ${errors.price ? 'p-invalid' : ''}`}
              />
              {errors.price && (
                <small className="text-red-500 block mt-1">{errors.price}</small>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Mô Tả <span className="text-red-500">*</span>
              </label>
              <InputTextarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
                className={`w-full ${errors.description ? 'p-invalid' : ''}`}
              />
              {errors.description && (
                <small className="text-red-500 block mt-1">{errors.description}</small>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Số Lượng <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={formData.quantity}
                onValueChange={(e) => handleNumberChange('quantity', e.value)}
                placeholder="Nhập số lượng"
                min={0}
                className={`w-full ${errors.quantity ? 'p-invalid' : ''}`}
              />
              {errors.quantity && (
                <small className="text-red-500 block mt-1">{errors.quantity}</small>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.category_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.value, subcategory_id: null }))}
                options={categories}
                optionLabel="category_name"
                optionValue="category_id"
                placeholder="Chọn danh mục"
                className={`w-full ${errors.category_id ? 'p-invalid' : ''}`}
              />
              {errors.category_id && (
                <small className="text-red-500 block mt-1">{errors.category_id}</small>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Danh Mục Con <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.subcategory_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, subcategory_id: e.value }))}
                options={subcategories}
                optionLabel="subcategory_name"
                optionValue="subcategory_id"
                placeholder="Chọn danh mục con"
                disabled={!formData.category_id}
                className={`w-full ${errors.subcategory_id ? 'p-invalid' : ''}`}
              />
              {errors.subcategory_id && (
                <small className="text-red-500 block mt-1">{errors.subcategory_id}</small>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn Ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className={`block w-full border-2 border-dashed rounded-lg p-4 cursor-pointer ${
                errors.images ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.images && (
              <small className="text-red-500 block mt-1">{errors.images}</small>
            )}
            <small className="text-gray-500 block mt-1">Tối đa 5 ảnh, định dạng JPG, PNG, WebP</small>
          </div>

          {/* Image Preview */}
          {imagePreviews.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Preview Ảnh</label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Đang mở bán</label>
            <InputSwitch
              checked={formData.is_active}
              onChange={(e) => handleStatusChange(e.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-center pt-6">
            <Button
              type="submit"
              label="Thêm Sản Phẩm"
              icon="pi pi-check"
              loading={loading}
              className="p-button-success"
            />
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={() => navigate('/admin/products')}
            />
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default AddProduct;
