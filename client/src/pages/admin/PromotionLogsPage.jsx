import { Tag } from 'antd';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const rows = [
  { id: 'LOG-9001', promotion: 'Valentine 15%', event: 'Applied', actor: 'System', time: '2026-02-18 10:22' },
  { id: 'LOG-9002', promotion: 'Gold Week Shipping', event: 'Edited', actor: 'admin@jewel.local', time: '2026-02-20 14:05' },
  { id: 'LOG-9003', promotion: 'VIP Upgrade Bonus', event: 'Created', actor: 'staff@jewel.local', time: '2026-02-21 09:16' },
];

const columns = [
  { title: 'Log ID', dataIndex: 'id', key: 'id' },
  { title: 'Promotion', dataIndex: 'promotion', key: 'promotion' },
  { title: 'Event', key: 'event', render: (_, row) => <Tag>{row.event}</Tag> },
  { title: 'Actor', dataIndex: 'actor', key: 'actor' },
  { title: 'Timestamp', dataIndex: 'time', key: 'time' },
];

const PromotionLogsPage = () => {
  return (
    <AdminResourcePage
      title="Promotion Logs"
      description="Audit trail for promotion events and operator actions."
      columns={columns}
      dataSource={rows}
      createButtonText="Export Logs"
      cardFields={[
        { key: 'id', label: 'Log ID', dataIndex: 'id' },
        { key: 'promotion', label: 'Promotion', dataIndex: 'promotion' },
        { key: 'event', label: 'Event', dataIndex: 'event' },
      ]}
    />
  );
};

export default PromotionLogsPage;
