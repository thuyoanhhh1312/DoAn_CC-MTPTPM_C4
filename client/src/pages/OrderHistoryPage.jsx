import { Badge, Button, Card, Table } from 'antd';
import PageContainer from '@/components/common/PageContainer';

const rows = [
  { id: 'o-1001', date: '2026-02-03', total: 2190, status: 'delivered' },
  { id: 'o-1002', date: '2026-02-12', total: 850, status: 'processing' },
  { id: 'o-1003', date: '2026-02-16', total: 4120, status: 'confirmed' },
];

const statusColor = {
  delivered: 'success',
  processing: 'processing',
  confirmed: 'warning',
};

const OrderHistoryPage = () => {
  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Total',
      key: 'total',
      render: (_, row) => `$${row.total.toLocaleString()}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => <Badge status={statusColor[row.status]} text={row.status} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">View</Button>,
    },
  ];

  return (
    <PageContainer title="Order History" subtitle="Protected order timeline for authenticated customers.">
      <Card>
        <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 720 }} />
      </Card>
    </PageContainer>
  );
};

export default OrderHistoryPage;
