import { Button, Card, Form, Input, Space, Tag, Typography } from 'antd';
import PageContainer from '@/components/common/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

const ProfilePage = () => {
  const { user, roles } = useAuth();

  return (
    <PageContainer title="Profile" subtitle="Protected customer profile route.">
      <Card>
        <Form
          layout="vertical"
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: '+84 900 000 000',
          }}
        >
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="name"
              label="Full name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="email"
              label="Email"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="phone"
              label="Phone"
            >
              <Input />
            </Form.Item>

            <div className="col-span-4 md:col-span-4 desktop:col-span-6 flex items-end">
              <Space>
                {roles.map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
                <Text type="secondary">Role-aware UI can be extended from here.</Text>
              </Space>
            </div>
          </div>

          <Button type="primary">Save profile</Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
