import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'ORD-3301', customer: 'Emma Watson', total: 2190, status: 'paid' },
  { id: 'ORD-3302', customer: 'James Lee', total: 840, status: 'processing' },
  { id: 'ORD-3303', customer: 'Luna Hoang', total: 5020, status: 'pending' },
];

const colorMap = {
  paid: 'green',
  processing: '#B08A4A',
  pending: '#B08A4A',
};

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Customer', dataIndex: 'customer', key: 'customer' },
  { title: 'Total', key: 'total', render: (_, row) => `$${row.total.toLocaleString()}` },
  { title: 'Status', key: 'status', render: (_, row) => <Tag color={colorMap[row.status]}>{row.status}</Tag> },
];

const OrdersPage = () => {
  return (
    <AdminResourcePage
      title="Orders"
      description="Order queue with payment and fulfillment states."
      columns={columns}
      dataSource={rows}
      createButtonText="Create Manual Order"
      cardFields={[
        { key: 'id', label: 'Order ID', dataIndex: 'id' },
        { key: 'customer', label: 'Customer', dataIndex: 'customer' },
        { key: 'total', label: 'Total', dataIndex: 'total', render: (value) => `$${value}` },
      ]}
    />
  );
};

export default OrdersPage;
