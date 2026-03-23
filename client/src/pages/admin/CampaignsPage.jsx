import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'CMP-101', name: 'Lunar Bridal Launch', channel: 'Email', budget: 2500, status: 'running' },
  { id: 'CMP-102', name: 'Emerald Story Series', channel: 'Social', budget: 1800, status: 'planned' },
  { id: 'CMP-103', name: 'Gold Investment Week', channel: 'Onsite', budget: 1100, status: 'paused' },
];

const statusColor = {
  running: 'green',
  planned: 'blue',
  paused: '#B08A4A',
};

const columns = [
  { title: 'Campaign', dataIndex: 'name', key: 'name' },
  { title: 'Channel', dataIndex: 'channel', key: 'channel' },
  { title: 'Budget', key: 'budget', render: (_, row) => `$${row.budget.toLocaleString()}` },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color={statusColor[row.status]}>{row.status}</Tag> },
];

const CampaignsPage = () => {
  return (
    <AdminResourcePage
      title="Campaigns"
      description="Marketing campaign orchestration and rollout status."
      columns={columns}
      dataSource={rows}
      createButtonText="Create Campaign"
      cardFields={[
        { key: 'name', label: 'Campaign', dataIndex: 'name' },
        { key: 'channel', label: 'Channel', dataIndex: 'channel' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default CampaignsPage;
