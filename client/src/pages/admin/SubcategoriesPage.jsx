import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'SUB-10', name: 'Engagement Rings', parent: 'Rings', products: 54, status: 'active' },
  { id: 'SUB-11', name: 'Cocktail Rings', parent: 'Rings', products: 25, status: 'active' },
  { id: 'SUB-20', name: 'Layered Necklaces', parent: 'Necklaces', products: 19, status: 'inactive' },
];

const columns = [
  { title: 'Subcategory', dataIndex: 'name', key: 'name' },
  { title: 'Parent Category', dataIndex: 'parent', key: 'parent' },
  { title: 'Products', dataIndex: 'products', key: 'products' },
  {
    title: 'Status',
    key: 'status',
    render: (_, row) => <Tag color={row.status === 'active' ? 'green' : 'default'}>{row.status}</Tag>,
  },
];

const SubcategoriesPage = () => {
  return (
    <AdminResourcePage
      title="Subcategories"
      description="Nested category segments with visibility controls."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Subcategory"
      cardFields={[
        { key: 'name', label: 'Subcategory', dataIndex: 'name' },
        { key: 'parent', label: 'Parent', dataIndex: 'parent' },
        { key: 'products', label: 'Products', dataIndex: 'products' },
      ]}
    />
  );
};

export default SubcategoriesPage;
