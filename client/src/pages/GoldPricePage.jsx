import { Card, Space, Statistic, Table, Tag, Typography } from 'antd';
import PageContainer from '@/components/common/PageContainer';

const { Text } = Typography;

const rows = [
  { id: '1', market: 'SJC 24K', buy: 6920, sell: 6990, trend: 'up' },
  { id: '2', market: '9999 Ring Gold', buy: 6820, sell: 6910, trend: 'flat' },
  { id: '3', market: '18K Jewelry Gold', buy: 5110, sell: 5290, trend: 'down' },
];

const GoldPricePage = () => {
  const columns = [
    { title: 'Market', dataIndex: 'market', key: 'market' },
    {
      title: 'Buy (x1000 VND)',
      key: 'buy',
      render: (_, row) => row.buy.toLocaleString(),
    },
    {
      title: 'Sell (x1000 VND)',
      key: 'sell',
      render: (_, row) => row.sell.toLocaleString(),
    },
    {
      title: 'Trend',
      key: 'trend',
      render: (_, row) => {
        const color = row.trend === 'up' ? 'green' : row.trend === 'down' ? 'red' : '#B08A4A';
        return <Tag color={color}>{row.trend.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <PageContainer title="Gold Prices" subtitle="Live gold board placeholder for market-linked pricing.">
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
        <Card className="col-span-4 md:col-span-4 desktop:col-span-3">
          <Statistic title="24K Spot" value={6990} suffix="x1000 VND" />
        </Card>
        <Card className="col-span-4 md:col-span-4 desktop:col-span-3">
          <Statistic title="Daily Change" value={1.2} suffix="%" precision={2} />
        </Card>
        <Card className="col-span-4 md:col-span-8 desktop:col-span-6">
          <Space direction="vertical" size={6}>
            <Text strong>Last updated</Text>
            <Text type="secondary">22 Feb 2026, 19:00 ICT</Text>
            <Text type="secondary">Connect this module to your market feed service.</Text>
          </Space>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 700 }} />
        </Card>
      </div>
    </PageContainer>
  );
};

export default GoldPricePage;
