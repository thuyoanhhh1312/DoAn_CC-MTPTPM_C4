import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'CUS-100', name: 'Olivia Tran', email: 'olivia@mail.com', tier: 'gold', orders: 14 },
  { id: 'CUS-101', name: 'Noah Nguyen', email: 'noah@mail.com', tier: 'silver', orders: 7 },
  { id: 'CUS-102', name: 'Mia Le', email: 'mia@mail.com', tier: 'platinum', orders: 22 },
];

const tierColor = {
  silver: 'default',
  gold: '#B08A4A',
  platinum: '#12332B',
};

const columns = [
  { title: 'Customer', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Orders', dataIndex: 'orders', key: 'orders' },
  { title: 'Tier', key: 'tier', render: (_, row) => <Tag color={tierColor[row.tier]}>{row.tier}</Tag> },
];

const CustomersPage = () => {
  return (
    <AdminResourcePage
      title="Customers"
      description="Customer profiles, loyalty tiering, and account moderation."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Customer"
      cardFields={[
        { key: 'name', label: 'Customer', dataIndex: 'name' },
        { key: 'email', label: 'Email', dataIndex: 'email' },
        { key: 'tier', label: 'Tier', dataIndex: 'tier' },
      ]}
    />
  );
};

export default CustomersPage;
