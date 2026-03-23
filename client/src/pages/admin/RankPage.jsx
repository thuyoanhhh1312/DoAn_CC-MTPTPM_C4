import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'RANK-1', name: 'Silver', minSpend: 0, perks: 'Early access', status: 'active' },
  { id: 'RANK-2', name: 'Gold', minSpend: 3000, perks: 'Free cleaning + concierge', status: 'active' },
  { id: 'RANK-3', name: 'Platinum', minSpend: 8000, perks: 'Private appointments + priority support', status: 'active' },
];

const columns = [
  { title: 'Rank', dataIndex: 'name', key: 'name' },
  { title: 'Min Spend', key: 'minSpend', render: (_, row) => `$${row.minSpend.toLocaleString()}` },
  { title: 'Perks', dataIndex: 'perks', key: 'perks' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color="green">{row.status}</Tag> },
];

const RankPage = () => {
  return (
    <AdminResourcePage
      title="Rank"
      description="Loyalty rank rules and customer benefit structure."
      columns={columns}
      dataSource={rows}
      createButtonText="Create Rank"
      cardFields={[
        { key: 'name', label: 'Rank', dataIndex: 'name' },
        { key: 'minSpend', label: 'Min Spend', dataIndex: 'minSpend', render: (value) => `$${value}` },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default RankPage;
