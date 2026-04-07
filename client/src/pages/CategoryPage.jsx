import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Pagination, Spin, Empty, Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productApi from '@/api/productApi';
import categoryApi from '@/api/categoryApi';
import ProductCard from '@/components/ui/product/productCard';
import PageContainer from '@/components/common/PageContainer';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
  });

  // Fetch products by category
  const fetchProductsByCategory = async (catId, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productApi.getProductsByCategoryWithPagination(
        catId,
        page,
        limit
      );

      // New API returns { code: 200, data: { items, total, page, limit } }
      if (response.code === 200 && response.data) {
        setProducts(response.data.items || []);
        setPagination({
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Lỗi khi tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category name
  const fetchCategoryName = async (catId) => {
    try {
      const response = await categoryApi.getCategoryById(catId);
      if (response) {
        setCategoryName(response.category_name || 'Danh mục');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setCategoryName('Danh mục');
    }
  };

  // Load products when categoryId or page changes
  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory(categoryId, pagination.page, pagination.limit);
      fetchCategoryName(categoryId);
    }
  }, [categoryId]);

  // Handle page change
  const handlePageChange = (page) => {
    if (categoryId) {
      setPagination((prev) => ({ ...prev, page }));
      fetchProductsByCategory(categoryId, page, pagination.limit);
      setSearchParams({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle limit change
  const handleLimitChange = (page, pageSize) => {
    if (categoryId) {
      setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));
      fetchProductsByCategory(categoryId, 1, pageSize);
      setSearchParams({ page: 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Error UI
  if (error && !loading) {
    return (
      <PageContainer title={categoryName || 'Danh mục'}>
        <div className="flex flex-col items-center justify-center py-12">
          <Empty
            description="Lỗi khi tải sản phẩm"
            style={{ marginBottom: '20px' }}
          />
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            type="primary"
            onClick={() => navigate('/')}
            icon={<ArrowLeftOutlined />}
          >
            Quay lại trang chủ
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Loading UI
  if (loading && products.length === 0) {
    return (
      <PageContainer title={categoryName || 'Danh mục'}>
        <div className="flex items-center justify-center py-12">
          <Spin size="large" tip="Đang tải sản phẩm..." />
        </div>
      </PageContainer>
    );
  }

  // Empty UI
  if (!loading && products.length === 0) {
    return (
      <PageContainer title={categoryName || 'Danh mục'}>
        <div className="flex flex-col items-center justify-center py-12">
          <Empty
            description="Không có sản phẩm nào trong danh mục này"
            style={{ marginBottom: '20px' }}
          />
          <Button
            type="primary"
            onClick={() => navigate('/')}
            icon={<ArrowLeftOutlined />}
          >
            Quay lại trang chủ
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <PageContainer
      title={categoryName || 'Danh mục'}
      subtitle={`${pagination.total} sản phẩm`}
      breadcrumbItems={[
        { title: 'Trang chủ', href: '/' },
        { title: categoryName || 'Danh mục' },
      ]}
    >
      <div className="space-y-6">
        {/* Products Grid - Responsive Layout */}
        <div>
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col
                key={product.product_id}
                xs={{ span: 24 }} // Mobile: 1 column
                sm={{ span: 12 }} // Tablet: 2 columns
                md={{ span: 8 }} // Laptop: 3 columns
                lg={{ span: 6 }} // Desktop: 4 columns
              >
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Loading overlay during pagination */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40 rounded-lg">
              <Spin size="large" />
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 pt-6 border-t">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={handlePageChange}
              onShowSizeChange={handleLimitChange}
              showSizeChanger
              showTotal={(total, range) =>
                `Hiển thị ${range[0]} - ${range[1]} trên ${total} sản phẩm`
              }
              pageSizeOptions={['10', '20', '30', '40']}
              style={{ marginTop: '16px' }}
            />
          </div>
        )}

        {/* Additional info */}
        {products.length > 0 && (
          <div className="text-center text-gray-500 text-sm pt-4">
            Trang {pagination.page} / {totalPages}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CategoryPage;
