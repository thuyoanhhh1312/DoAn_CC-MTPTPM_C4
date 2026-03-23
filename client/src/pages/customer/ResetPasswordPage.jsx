import { useState } from 'react';
import { App, Button, Card, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';

const ResetPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      await authApi.resetPassword(values);
      message.success('Password reset successful. Please sign in.');
      navigate('/signin');
    } catch (error) {
      message.error(error.message || 'Unable to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 py-8 md:py-12">
      <Card title="Reset Password">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Reset token"
            name="token"
            rules={[{ required: true, message: 'Token is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="New password"
            name="password"
            rules={[{ required: true, message: 'New password is required' }, { min: 8 }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button block type="primary" htmlType="submit" loading={submitting}>
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
