import { Alert, Card, Empty, Grid, List, Skeleton, Space, Table, Typography } from 'antd';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const defaultGetFields = (columns = []) =>
  columns
    .filter((column) => typeof column.dataIndex === 'string')
    .slice(0, 4)
    .map((column) => ({
      key: column.key || column.dataIndex,
      label: column.title,
      dataIndex: column.dataIndex,
      render: column.render,
    }));

const ResponsiveDataTable = ({
  columns,
  dataSource,
  rowKey = 'id',
  loading = false,
  error = null,
  emptyDescription = 'No records found',
  cardFields,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (loading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load table data"
        description={error.message || 'Please retry in a few moments.'}
      />
    );
  }

  if (!dataSource || dataSource.length === 0) {
    return <Empty description={emptyDescription} />;
  }

  if (!isMobile) {
    return (
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 900 }}
      />
    );
  }

  const resolvedFields = (cardFields && cardFields.length > 0 ? cardFields : defaultGetFields(columns)).filter(
    Boolean,
  );

  return (
    <List
      dataSource={dataSource}
      split={false}
      renderItem={(item) => (
        <List.Item>
          <Card style={{ width: '100%' }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {resolvedFields.map((field) => {
                const rawValue = item[field.dataIndex];
                const renderedValue = field.render ? field.render(rawValue, item) : rawValue;

                return (
                  <div className="flex items-start justify-between gap-4" key={field.key || field.dataIndex}>
                    <Text type="secondary">{field.label}</Text>
                    <div>{renderedValue || '-'}</div>
                  </div>
                );
              })}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default ResponsiveDataTable;
