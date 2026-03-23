import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'NC-1', name: 'Behind the Scenes', articles: 12, status: 'active' },
  { id: 'NC-2', name: 'Market', articles: 8, status: 'active' },
  { id: 'NC-3', name: 'Style Guide', articles: 5, status: 'inactive' },
];

const columns = [
  { title: 'Category', dataIndex: 'name', key: 'name' },
  { title: 'Articles', dataIndex: 'articles', key: 'articles' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag>{row.status}</Tag> },
];

const NewsCategoriesPage = () => {
  return (
    <AdminResourcePage
      title="News Categories"
      description="Manage news taxonomy and editorial grouping."
      columns={columns}
      dataSource={rows}
      createButtonText="Add News Category"
      cardFields={[
        { key: 'name', label: 'Category', dataIndex: 'name' },
        { key: 'articles', label: 'Articles', dataIndex: 'articles' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default NewsCategoriesPage;
