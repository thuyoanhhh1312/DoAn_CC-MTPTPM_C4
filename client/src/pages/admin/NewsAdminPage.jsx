import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'NEWS-1', title: 'Inside the Atelier', author: 'Editorial Team', status: 'published', category: 'Behind the Scenes' },
  { id: 'NEWS-2', title: 'Gold Demand Outlook', author: 'Market Desk', status: 'draft', category: 'Market' },
  { id: 'NEWS-3', title: 'Wedding Styling Guide', author: 'Styling', status: 'review', category: 'Style Guide' },
];

const statusColor = {
  published: 'green',
  draft: 'default',
  review: '#B08A4A',
};

const columns = [
  { title: 'Title', dataIndex: 'title', key: 'title' },
  { title: 'Author', dataIndex: 'author', key: 'author' },
  { title: 'Category', dataIndex: 'category', key: 'category' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color={statusColor[row.status]}>{row.status}</Tag> },
];

const NewsAdminPage = () => {
  return (
    <AdminResourcePage
      title="News"
      description="News CMS management for customer editorial portal."
      columns={columns}
      dataSource={rows}
      createButtonText="Create Article"
      cardFields={[
        { key: 'title', label: 'Title', dataIndex: 'title' },
        { key: 'author', label: 'Author', dataIndex: 'author' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default NewsAdminPage;
