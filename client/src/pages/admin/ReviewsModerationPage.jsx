import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'RV-501', product: 'Celeste Solitaire Ring', author: 'Olivia T.', rating: 5, status: 'pending' },
  { id: 'RV-502', product: 'Aster Pendant', author: 'Nora P.', rating: 3, status: 'flagged' },
  { id: 'RV-503', product: 'Noir Diamond Choker', author: 'Emma W.', rating: 4, status: 'approved' },
];

const statusColor = {
  pending: '#B08A4A',
  flagged: 'red',
  approved: 'green',
};

const columns = [
  { title: 'Review ID', dataIndex: 'id', key: 'id' },
  { title: 'Product', dataIndex: 'product', key: 'product' },
  { title: 'Author', dataIndex: 'author', key: 'author' },
  { title: 'Rating', dataIndex: 'rating', key: 'rating' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color={statusColor[row.status]}>{row.status}</Tag> },
];

const ReviewsModerationPage = () => {
  return (
    <AdminResourcePage
      title="Reviews Moderation"
      description="Moderate customer reviews and flagged content."
      columns={columns}
      dataSource={rows}
      createButtonText="Bulk Action"
      cardFields={[
        { key: 'id', label: 'Review ID', dataIndex: 'id' },
        { key: 'product', label: 'Product', dataIndex: 'product' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default ReviewsModerationPage;
