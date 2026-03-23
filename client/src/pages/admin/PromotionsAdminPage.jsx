import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'PM-01', name: 'Valentine 15%', type: 'percentage', startDate: '2026-02-01', status: 'active' },
  { id: 'PM-02', name: 'Gold Week Shipping', type: 'shipping', startDate: '2026-02-10', status: 'active' },
  { id: 'PM-03', name: 'VIP Upgrade Bonus', type: 'tier', startDate: '2026-03-01', status: 'scheduled' },
];

const columns = [
  { title: 'Promotion', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color="#12332B">{row.status}</Tag> },
];

const PromotionsAdminPage = () => {
  return (
    <AdminResourcePage
      title="Promotions"
      description="Promotion definitions and lifecycle states."
      columns={columns}
      dataSource={rows}
      createButtonText="Create Promotion"
      cardFields={[
        { key: 'name', label: 'Promotion', dataIndex: 'name' },
        { key: 'type', label: 'Type', dataIndex: 'type' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default PromotionsAdminPage;
