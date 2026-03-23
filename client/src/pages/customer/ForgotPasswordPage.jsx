import { useState } from 'react';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';

const { Text } = Typography;

const ForgotPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      const response = await authApi.forgotPassword(values);
      message.success(response.message || 'Reset instructions sent');
    } catch (error) {
      message.error(error.message || 'Unable to send reset instructions');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 py-8 md:py-12">
      <Card title="Forgot Password">
        <Text type="secondary">
          Enter your email and we will send password reset instructions.
        </Text>

        <Form layout="vertical" onFinish={onFinish} className="mt-4">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Button block htmlType="submit" type="primary" loading={submitting}>
            Send Reset Link
          </Button>
        </Form>

        <div className="mt-4 text-right">
          <Button type="link" onClick={() => navigate('/signin')}>
            Back to sign in
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
