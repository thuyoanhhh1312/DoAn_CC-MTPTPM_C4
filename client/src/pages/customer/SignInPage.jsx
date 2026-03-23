import { useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resolveReturnUrl } from '@/utils/returnUrl';

const { Link, Text } = Typography;

const demoAccounts = [
  { label: 'Admin', email: 'admin@jewel.local', password: 'Admin@123' },
  { label: 'Staff', email: 'staff@jewel.local', password: 'Staff@123' },
  { label: 'Customer', email: 'customer@jewel.local', password: 'Customer@123' },
];

const SignInPage = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { signIn } = useAuth();

  const returnUrl = resolveReturnUrl(searchParams.get('returnUrl'));

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      await signIn(values);
      message.success('Signed in successfully');
      navigate(returnUrl, { replace: true });
    } catch (error) {
      message.error(error.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (account) => {
    form.setFieldsValue({
      email: account.email,
      password: account.password,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <Card title="Sign In" extra={<Text type="secondary">Return URL: {returnUrl}</Text>}>
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Demo auth accounts"
            description="Use quick-fill buttons below when VITE_USE_MOCK_AUTH=true"
          />

          <Space wrap>
            {demoAccounts.map((account) => (
              <Button key={account.email} size="small" onClick={() => fillDemoCredentials(account)}>
                {account.label}
              </Button>
            ))}
          </Space>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
            >
              <Input placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Button block type="primary" htmlType="submit" loading={submitting}>
              Sign In
            </Button>
          </Form>

          <div className="flex items-center justify-between">
            <Link onClick={() => navigate('/forgot-password')}>Forgot password?</Link>
            <Link onClick={() => navigate('/signup')}>Create account</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignInPage;
