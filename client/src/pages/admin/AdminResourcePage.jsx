import { Button, Card, Input, Select, Space } from 'antd';
import { Filter, Plus } from 'lucide-react';
import PageContainer from '@/components/common/PageContainer';
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable';

const AdminResourcePage = ({
  title,
  description,
  columns,
  dataSource,
  cardFields,
  createButtonText = 'Create',
}) => {
  return (
    <PageContainer title={title} subtitle={description}>
      <div className="mb-4">
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Space wrap>
              <Input allowClear placeholder={`Search ${title.toLowerCase()}`} style={{ width: 260 }} />
              <Select
                allowClear
                placeholder="Status"
                style={{ width: 180 }}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Archived', value: 'archived' },
                ]}
              />
            </Space>

            <Space>
              <Button icon={<Filter size={14} />}>Filters</Button>
              <Button type="primary" icon={<Plus size={14} />}>
                {createButtonText}
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      <Card>
        <ResponsiveDataTable
          columns={columns}
          dataSource={dataSource}
          cardFields={cardFields}
          rowKey="id"
          emptyDescription={`No ${title.toLowerCase()} records yet`}
        />
      </Card>
    </PageContainer>
  );
};

export default AdminResourcePage;
