import { useState } from 'react';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';

const { Link } = Typography;

const SignUpPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      await authApi.signUp(values);
      message.success('Sign-up request submitted. Please sign in.');
      navigate('/signin');
    } catch (error) {
      message.error(error.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <Card title="Create Account">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }, { min: 8 }]}
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
            Sign Up
          </Button>
        </Form>

        <div className="mt-4 text-right">
          <Link onClick={() => navigate('/signin')}>Already have an account?</Link>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
