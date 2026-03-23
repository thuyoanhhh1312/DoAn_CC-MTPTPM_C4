import { Button, Card, Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Text, Title } = Typography;

const cartRows = [
  { id: '1', name: 'Celeste Solitaire Ring', qty: 1, unitPrice: 2200 },
  { id: '2', name: 'Muse Pearl Earrings', qty: 2, unitPrice: 980 },
];

const CartPage = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Unit Price',
      key: 'unitPrice',
      render: (_, row) => `$${row.unitPrice.toLocaleString()}`,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, row) => `$${(row.qty * row.unitPrice).toLocaleString()}`,
    },
  ];

  const subtotal = cartRows.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
  const shipping = 35;
  const total = subtotal + shipping;

  return (
    <PageContainer title="Cart" subtitle="Review selected pieces before checkout.">
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
        <Card className="col-span-4 md:col-span-8 desktop:col-span-8" title="Items in Cart">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={cartRows}
            pagination={false}
            scroll={{ x: 700 }}
          />
        </Card>

        <Card className="col-span-4 md:col-span-8 desktop:col-span-4" title="Order Summary">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="flex items-center justify-between">
              <Text>Subtotal</Text>
              <Text>${subtotal.toLocaleString()}</Text>
            </div>
            <div className="flex items-center justify-between">
              <Text>Shipping</Text>
              <Text>${shipping.toLocaleString()}</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div className="flex items-center justify-between">
              <Title level={5} style={{ margin: 0 }}>
                Total
              </Title>
              <Title level={4} className="portal-title" style={{ margin: 0 }}>
                ${total.toLocaleString()}
              </Title>
            </div>
            <Button block type="primary" size="large" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Button block onClick={() => navigate('/search')}>
              Continue Shopping
            </Button>
          </Space>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CartPage;
