import { Breadcrumb, Space, Typography } from 'antd';

const { Text, Title } = Typography;

const PageContainer = ({ title, subtitle, breadcrumbItems = [], actions, children }) => {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 desktop:px-8">
      <div className="mb-5 flex flex-col gap-3">
        {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Title className="portal-title" level={2} style={{ marginBottom: 8 }}>
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" style={{ fontSize: 15 }}>
                {subtitle}
              </Text>
            )}
          </div>
          {actions && <Space wrap>{actions}</Space>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PageContainer;
