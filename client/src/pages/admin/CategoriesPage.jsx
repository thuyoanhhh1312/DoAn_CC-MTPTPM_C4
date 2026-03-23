import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'CAT-01', name: 'Rings', subcategories: 8, products: 124, status: 'active' },
  { id: 'CAT-02', name: 'Necklaces', subcategories: 5, products: 83, status: 'active' },
  { id: 'CAT-03', name: 'Bracelets', subcategories: 4, products: 47, status: 'inactive' },
];

const columns = [
  { title: 'Category', dataIndex: 'name', key: 'name' },
  { title: 'Subcategories', dataIndex: 'subcategories', key: 'subcategories' },
  { title: 'Products', dataIndex: 'products', key: 'products' },
  {
    title: 'Status',
    key: 'status',
    render: (_, row) => <Tag color={row.status === 'active' ? 'green' : 'default'}>{row.status}</Tag>,
  },
];

const CategoriesPage = () => {
  return (
    <AdminResourcePage
      title="Categories"
      description="Top-level taxonomy and storefront grouping."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Category"
      cardFields={[
        { key: 'name', label: 'Category', dataIndex: 'name' },
        { key: 'subcategories', label: 'Subcategories', dataIndex: 'subcategories' },
        { key: 'products', label: 'Products', dataIndex: 'products' },
      ]}
    />
  );
};

export default CategoriesPage;
