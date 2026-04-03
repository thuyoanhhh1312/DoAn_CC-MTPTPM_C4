import { useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  InputNumber,
  Result,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { ShoppingBag } from 'lucide-react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Paragraph, Text, Title } = Typography;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);

  const productName = (slug || 'product')
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');

  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Collection">Winter Maison 2026</Descriptions.Item>
          <Descriptions.Item label="Metal">18k Yellow Gold</Descriptions.Item>
          <Descriptions.Item label="Stone">VS1 Diamond, 0.8ct</Descriptions.Item>
          <Descriptions.Item label="Crafting Time">5-7 business days</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'care',
      label: 'Care Guide',
      children: (
        <Paragraph style={{ marginBottom: 0 }}>
          Store in a soft-lined box, avoid exposure to perfumes, and schedule a professional
          inspection every 6 months.
        </Paragraph>
      ),
    },
    {
      key: '3d',
      label: '3D View',
      children: (
        <Result
          status="info"
          title="3D View Placeholder"
          subTitle="Attach your 3D viewer component (WebGL/Model Viewer) here in implementation phase."
        />
      ),
    },
  ];

  return (
    <PageContainer
      title={productName}
      subtitle="Product detail scaffold with technical tabs and 3D-view integration slot."
      breadcrumbItems={[
        { title: 'Home', href: '/' },
        { title: 'Catalog', href: '/search' },
        { title: productName },
      ]}
    >
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
        <Card className="col-span-4 md:col-span-8 desktop:col-span-7" title="Gallery Placeholder">
          <Result status="success" title="Hero Media Placeholder" subTitle="Primary product image/video area" />
        </Card>

        <Card className="col-span-4 md:col-span-8 desktop:col-span-5" title="Purchase Panel">
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Tag color="#B08A4A">Limited Edition</Tag>
            <Title level={3} className="portal-title" style={{ margin: 0 }}>
              $4,850
            </Title>
            <Text type="secondary">Tax and shipping calculated at checkout.</Text>
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center">
              <Text>Quantity</Text>
              <InputNumber min={1} max={5} value={quantity} onChange={(value) => setQuantity(value || 1)} />
            </Space>
            <Button block type="primary" size="large" icon={<ShoppingBag size={16} />}>
              Add to cart ({quantity})
            </Button>
            <Button block size="large">
              Add to wishlist
            </Button>
          </Space>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Tabs items={tabItems} />
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProductDetailPage;
