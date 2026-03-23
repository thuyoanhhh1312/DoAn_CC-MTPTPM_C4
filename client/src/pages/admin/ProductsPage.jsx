import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'P-001', name: 'Celeste Solitaire Ring', sku: 'RNG-1001', price: 2200, status: 'active' },
  { id: 'P-002', name: 'Noir Diamond Choker', sku: 'NCK-1020', price: 4800, status: 'active' },
  { id: 'P-003', name: 'Aster Pendant', sku: 'PND-1090', price: 1320, status: 'inactive' },
];

const columns = [
  { title: 'Product', dataIndex: 'name', key: 'name' },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Price', key: 'price', render: (_, row) => `$${row.price.toLocaleString()}` },
  {
    title: 'Status',
    key: 'status',
    render: (_, row) => <Tag color={row.status === 'active' ? 'green' : 'default'}>{row.status}</Tag>,
  },
];

const ProductsPage = () => {
  return (
    <AdminResourcePage
      title="Products"
      description="Manage product catalog entries, stock metadata, and publication state."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Product"
      cardFields={[
        { key: 'name', label: 'Product', dataIndex: 'name' },
        { key: 'sku', label: 'SKU', dataIndex: 'sku' },
        { key: 'price', label: 'Price', dataIndex: 'price', render: (value) => `$${value}` },
      ]}
    />
  );
};

export default ProductsPage;
