import { useState } from 'react';
import { Button, Card, Form, Input, Space, Tag, Typography, message } from 'antd';
import PageContainer from '@/components/common/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

const mockUpdateProfile = async (data) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Mock success response
  console.log('Mock API: Update Profile', data);
  return {
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: 1,
      name: data.fullName,
      email: data.email,
    },
  };
};

const ProfilePage = () => {
  const { user, roles } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await mockUpdateProfile(values);
      
      if (response.success) {
        message.success(response.message);
        // Reset password fields after successful update
        form.setFieldsValue({
          password: '',
          confirmPassword: '',
        });
      } else {
        message.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      message.error(error.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Profile" subtitle="Update your profile information.">
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            fullName: user?.name || '',
            email: user?.email || '',
            password: '',
            confirmPassword: '',
          }}
        >
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="fullName"
              label="Full Name"
              rules={[
                {
                  required: true,
                  message: 'Full name is required',
                },
                {
                  min: 2,
                  message: 'Full name must be at least 2 characters',
                },
              ]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="email"
              label="Email"
            >
              <Input disabled placeholder="Email cannot be changed" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="password"
              label="Password (optional)"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value.length < 6) {
                      return Promise.reject(
                        new Error('Password must be at least 6 characters')
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Leave blank to keep current password" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="confirmPassword"
              label="Confirm Password"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue('password');
                    
                    // If no password entered, confirmPassword is not required
                    if (!password && !value) {
                      return Promise.resolve();
                    }
                    
                    // If password entered, confirmPassword is required
                    if (password && !value) {
                      return Promise.reject(
                        new Error('Please confirm your password')
                      );
                    }
                    
                    // Passwords must match
                    if (password !== value) {
                      return Promise.reject(
                        new Error('Passwords do not match')
                      );
                    }
                    
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm your password" />
            </Form.Item>

            <div className="col-span-4 md:col-span-4 desktop:col-span-6 flex items-end">
              <Space>
                {roles &&
                  roles.map((role) => (
                    <Tag key={role} color="blue">
                      {role}
                    </Tag>
                  ))}
                <Text type="secondary">Role-aware UI can be extended from here.</Text>
              </Space>
            </div>
          </div>

          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
