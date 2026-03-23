import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'USR-1', name: 'Admin Operator', email: 'admin@jewel.local', role: 'admin', status: 'active' },
  { id: 'USR-2', name: 'Staff Operator', email: 'staff@jewel.local', role: 'staff', status: 'active' },
  { id: 'USR-3', name: 'Quality Controller', email: 'qc@jewel.local', role: 'staff', status: 'inactive' },
];

const roleColor = {
  admin: 'purple',
  staff: 'blue',
};

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', key: 'role', render: (_, row) => <Tag color={roleColor[row.role]}>{row.role}</Tag> },
  { title: 'Status', key: 'status', render: (_, row) => <Tag>{row.status}</Tag> },
];

const UsersStaffPage = () => {
  return (
    <AdminResourcePage
      title="Users / Staff"
      description="Back-office account permissions and activation status."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Staff User"
      cardFields={[
        { key: 'name', label: 'Name', dataIndex: 'name' },
        { key: 'email', label: 'Email', dataIndex: 'email' },
        { key: 'role', label: 'Role', dataIndex: 'role' },
      ]}
    />
  );
};

export default UsersStaffPage;
