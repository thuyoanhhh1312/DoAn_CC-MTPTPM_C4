import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';
import PageContainer from '@/components/common/PageContainer';
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable';

const { Text } = Typography;

const summaryCards = [
  { key: 'revenue', title: 'Revenue Today', value: 24890, prefix: '$' },
  { key: 'orders', title: 'Orders Today', value: 38 },
  { key: 'pending', title: 'Pending Reviews', value: 12 },
  { key: 'lowStock', title: 'Low Stock SKUs', value: 7 },
];

const recentOrders = [
  { id: 'ODR-2201', customer: 'Liam Howard', amount: 2180, status: 'paid' },
  { id: 'ODR-2202', customer: 'Olivia Tran', amount: 940, status: 'processing' },
  { id: 'ODR-2203', customer: 'Noah Bui', amount: 3310, status: 'pending' },
  { id: 'ODR-2204', customer: 'Mia Pham', amount: 1290, status: 'paid' },
];

const statusColor = {
  paid: 'green',
  processing: '#B08A4A',
  pending: '#B08A4A',
};

const DashboardPage = () => {
  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, row) => `$${row.amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => <Tag color={statusColor[row.status]}>{row.status.toUpperCase()}</Tag>,
    },
  ];

  return (
    <PageContainer title="Dashboard" subtitle="Operations overview with order and catalog KPIs.">
      <Row gutter={[16, 16]}>
        {summaryCards.map((card) => (
          <Col key={card.key} xs={24} md={12} xl={6}>
            <Card>
              <Statistic title={card.title} value={card.value} prefix={card.prefix} />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="mt-4">
        <Card title="Recent Orders">
          <ResponsiveDataTable
            columns={columns}
            dataSource={recentOrders}
            rowKey="id"
            cardFields={[
              { key: 'id', label: 'Order', dataIndex: 'id' },
              { key: 'customer', label: 'Customer', dataIndex: 'customer' },
              {
                key: 'amount',
                label: 'Amount',
                dataIndex: 'amount',
                render: (value) => `$${value.toLocaleString()}`,
              },
              {
                key: 'status',
                label: 'Status',
                dataIndex: 'status',
                render: (value) => <Tag color={statusColor[value]}>{value.toUpperCase()}</Tag>,
              },
            ]}
          />

          <Space style={{ marginTop: 12 }}>
            <Text type="secondary">Data source and charting integrations can be connected here.</Text>
          </Space>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
