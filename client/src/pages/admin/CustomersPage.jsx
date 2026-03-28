import { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Space, Table, Tag, message } from 'antd';
import { Trash2, Search } from 'lucide-react';
import PageContainer from '@/components/common/PageContainer';

// Mock customer data
const mockCustomersData = [
  {
    id: 1,
    name: 'Olivia Tran',
    email: 'olivia@mail.com',
    phone: '+84 901 234 567',
    tier: 'gold',
    orders: 14,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Noah Nguyen',
    email: 'noah@mail.com',
    phone: '+84 902 345 678',
    tier: 'silver',
    orders: 7,
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Mia Le',
    email: 'mia@mail.com',
    phone: '+84 903 456 789',
    tier: 'platinum',
    orders: 22,
    createdAt: '2024-01-05',
  },
  {
    id: 4,
    name: 'Sophia Pham',
    email: 'sophia@mail.com',
    phone: '+84 904 567 890',
    tier: 'bronze',
    orders: 2,
    createdAt: '2024-03-10',
  },
  {
    id: 5,
    name: 'Ethan Hoang',
    email: 'ethan@mail.com',
    phone: '+84 905 678 901',
    tier: 'gold',
    orders: 18,
    createdAt: '2024-01-25',
  },
];

const mockDeleteCustomer = async (customerId) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log('Mock API: Delete Customer', customerId);
  return { success: true, message: 'Customer deleted successfully' };
};

const tierColor = {
  bronze: 'default',
  silver: 'silver',
  gold: '#B08A4A',
  platinum: '#12332B',
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomersData);
      setFilteredCustomers(mockCustomersData);
      setLoading(false);
    }, 500);
  }, []);

  // Handle search filter
  useEffect(() => {
    const filtered = customers.filter((customer) => {
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
    });
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);
    try {
      const response = await mockDeleteCustomer(selectedCustomer.id);

      if (response.success) {
        message.success(response.message);
        // Remove customer from list
        const updated = customers.filter((c) => c.id !== selectedCustomer.id);
        setCustomers(updated);
        setDeleteModalVisible(false);
        setSelectedCustomer(null);
      } else {
        message.error(response.message || 'Failed to delete customer');
      }
    } catch (error) {
      message.error(error.message || 'An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedCustomer(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: '20%',
    },
    {
      title: 'Tier',
      key: 'tier',
      dataIndex: 'tier',
      width: '12%',
      render: (tier) => <Tag color={tierColor[tier]}>{tier}</Tag>,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      width: '10%',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'Action',
      key: 'action',
      width: '13%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteClick(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Customers"
      subtitle="Manage customer profiles, view loyalty tiers, and handle account moderation."
    >
      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              prefix={<Search size={16} />}
              value={searchQuery}
              onChange={handleSearchChange}
              allowClear
            />
          </div>
          <div className="text-sm text-gray-500">
            Total: <strong>{filteredCustomers.length}</strong> customers
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            total: filteredCustomers.length,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Customer"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        closable={!deleting}
      >
        <p>
          Are you sure you want to delete customer{' '}
          <strong>{selectedCustomer?.name}</strong>?
        </p>
        <p className="text-sm text-gray-500">
          Email: <code>{selectedCustomer?.email}</code>
        </p>
        <p className="mt-2 text-red-600">This action cannot be undone.</p>
      </Modal>
    </PageContainer>
  );
};

export default CustomersPage;
