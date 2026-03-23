import { Button, Card, Divider, Form, Input, Radio, Space, Steps, Typography } from 'antd';
import PageContainer from '@/components/common/PageContainer';

const { Text, Title } = Typography;

const CheckoutPage = () => {
  const [form] = Form.useForm();

  return (
    <PageContainer title="Checkout" subtitle="Protected customer route with checkout workflow scaffolding.">
      <Card className="mb-4">
        <Steps
          current={1}
          items={[
            { title: 'Cart' },
            { title: 'Shipping & Payment' },
            { title: 'Review' },
          ]}
        />
      </Card>

      <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
        <Card className="col-span-4 md:col-span-8 desktop:col-span-8" title="Shipping & Payment">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              fullName: 'Customer Demo',
              email: 'customer@jewel.local',
              paymentMethod: 'card',
            }}
          >
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
              <Form.Item
                className="col-span-4 md:col-span-4 desktop:col-span-6"
                label="Full name"
                name="fullName"
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                className="col-span-4 md:col-span-4 desktop:col-span-6"
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                className="col-span-4 md:col-span-8 desktop:col-span-12"
                label="Shipping address"
                name="address"
                rules={[{ required: true, message: 'Address is required' }]}
              >
                <Input.TextArea rows={3} placeholder="Street, ward, city" />
              </Form.Item>

              <Form.Item
                className="col-span-4 md:col-span-8 desktop:col-span-12"
                label="Payment method"
                name="paymentMethod"
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="card">Credit / Debit Card</Radio>
                    <Radio value="bank">Bank Transfer</Radio>
                    <Radio value="cod">Cash on Delivery</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>

            <Button type="primary" size="large">
              Place Order
            </Button>
          </Form>
        </Card>

        <Card className="col-span-4 md:col-span-8 desktop:col-span-4" title="Order Recap">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="flex items-center justify-between">
              <Text>Items</Text>
              <Text>$4,160</Text>
            </div>
            <div className="flex items-center justify-between">
              <Text>Shipping</Text>
              <Text>$35</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div className="flex items-center justify-between">
              <Title level={5} style={{ margin: 0 }}>
                Total
              </Title>
              <Title level={4} className="portal-title" style={{ margin: 0 }}>
                $4,195
              </Title>
            </div>
            <Text type="secondary">Secure checkout flow connected to auth-protected route guards.</Text>
          </Space>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CheckoutPage;
