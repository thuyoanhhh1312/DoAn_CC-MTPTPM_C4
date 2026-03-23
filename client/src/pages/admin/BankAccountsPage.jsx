import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'BA-01', bankName: 'Vietcombank', accountName: 'Aurelia Co.', accountNo: '0011900001234', status: 'active' },
  { id: 'BA-02', bankName: 'ACB', accountName: 'Aurelia Co.', accountNo: '5500198888', status: 'active' },
  { id: 'BA-03', bankName: 'Techcombank', accountName: 'Aurelia Co.', accountNo: '1900123456', status: 'inactive' },
];

const columns = [
  { title: 'Bank', dataIndex: 'bankName', key: 'bankName' },
  { title: 'Account Name', dataIndex: 'accountName', key: 'accountName' },
  { title: 'Account Number', dataIndex: 'accountNo', key: 'accountNo' },
  { title: 'Status', key: 'status', render: (_, row) => <Tag>{row.status}</Tag> },
];

const BankAccountsPage = () => {
  return (
    <AdminResourcePage
      title="Bank Accounts"
      description="Payment settlement accounts for transfer workflows."
      columns={columns}
      dataSource={rows}
      createButtonText="Add Bank Account"
      cardFields={[
        { key: 'bankName', label: 'Bank', dataIndex: 'bankName' },
        { key: 'accountNo', label: 'Account No', dataIndex: 'accountNo' },
        { key: 'status', label: 'Status', dataIndex: 'status' },
      ]}
    />
  );
};

export default BankAccountsPage;
