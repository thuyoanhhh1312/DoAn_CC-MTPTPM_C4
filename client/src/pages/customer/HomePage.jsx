import { Button, Card, Col, List, Row, Space, Tag, Typography } from 'antd';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Paragraph, Text, Title } = Typography;

const featuredCollections = [
  {
    id: 'c1',
    title: 'Imperial Bridal Set',
    description: 'Hand-cut diamonds with warm champagne tones.',
    cta: '/category/bridal',
  },
  {
    id: 'c2',
    title: 'Emerald Atelier',
    description: 'Emerald-forward designs with heirloom silhouettes.',
    cta: '/category/emerald',
  },
  {
    id: 'c3',
    title: 'Gold Signatures',
    description: 'Contemporary classics cast in 18k yellow gold.',
    cta: '/category/gold-signatures',
  },
];

const editorialHighlights = [
  'Private appointment booking for bespoke consultations',
  'Insured worldwide delivery for high-value pieces',
  'Certified gold and gemstone sourcing transparency',
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Luxury Jewelry House"
      subtitle="Editorial storefront for collections, stories, and refined checkout experiences."
      actions={[
        <Button key="shop" type="primary" onClick={() => navigate('/search')}>
          Explore Catalog
        </Button>,
        <Button key="promotions" onClick={() => navigate('/promotions')}>
          View Promotions
        </Button>,
      ]}
    >
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
        <Card className="col-span-4 md:col-span-8 desktop:col-span-8" bordered={false}>
          <Space direction="vertical" size={12}>
            <Tag icon={<Sparkles size={13} />} color="#B08A4A">
              Seasonal editorial launch
            </Tag>
            <Title level={3} className="portal-title" style={{ margin: 0 }}>
              Winter Maison Collection 2026
            </Title>
            <Paragraph style={{ margin: 0 }}>
              Discover sculptural pieces inspired by archival craftsmanship, now available with
              real-time stock and pricing visibility.
            </Paragraph>
            <Space>
              <Button type="primary" onClick={() => navigate('/category/winter-maison')}>
                Browse Collection
              </Button>
              <Button icon={<ArrowRight size={14} />} onClick={() => navigate('/news')}>
                Read Editorials
              </Button>
            </Space>
          </Space>
        </Card>

        <Card className="col-span-4 md:col-span-8 desktop:col-span-4" title="Service Promise" bordered={false}>
          <Space direction="vertical" size={10}>
            {editorialHighlights.map((point) => (
              <Text key={point}>{point}</Text>
            ))}
          </Space>
        </Card>
      </div>

      <div className="mt-6">
        <Row gutter={[16, 16]}>
          {featuredCollections.map((item) => (
            <Col key={item.id} xs={24} md={12} xl={8}>
              <Card
                title={item.title}
                extra={
                  <Button size="small" type="link" onClick={() => navigate(item.cta)}>
                    Open
                  </Button>
                }
              >
                <Paragraph style={{ marginBottom: 0 }}>{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="mt-6">
        <Card title="Latest Stories">
          <List
            dataSource={[
              { title: 'How to choose gold purity for daily wear', slug: 'gold-purity-guide' },
              { title: 'Statement necklaces for evening attire', slug: 'statement-necklaces' },
              { title: 'The return of heirloom-inspired rings', slug: 'heirloom-rings' },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key={item.slug} type="link" onClick={() => navigate(`/news/${item.slug}`)}>
                    Read
                  </Button>,
                ]}
              >
                {item.title}
              </List.Item>
            )}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default HomePage;
