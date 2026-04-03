import { Badge, Button, Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Paragraph, Text } = Typography;

const promotions = [
  {
    id: 'pr1',
    title: 'Valentine Capsule - 15% Off',
    description: 'Valid on selected ring collections with complimentary engraving.',
    cta: '/category/bridal',
  },
  {
    id: 'pr2',
    title: 'Gold Week Priority Delivery',
    description: 'Free express shipping for orders above $2,000.',
    cta: '/gold-prices',
  },
  {
    id: 'pr3',
    title: 'Private Event Access',
    description: 'Exclusive invitation for customers with lifetime spend over $8,000.',
    cta: '/news/private-events',
  },
];

const PromotionsPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="Promotions" subtitle="Current campaigns, perks, and editorial offers.">
      <Row gutter={[16, 16]}>
        {promotions.map((promotion) => (
          <Col key={promotion.id} xs={24} md={12} xl={8}>
            <Badge.Ribbon text="Active" color="#B08A4A">
              <Card
                title={promotion.title}
                extra={
                  <Button type="link" onClick={() => navigate(promotion.cta)}>
                    Open
                  </Button>
                }
              >
                <Paragraph>{promotion.description}</Paragraph>
                <Text type="secondary">Campaign instrumentation and redemption logic can be connected later.</Text>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
};

export default PromotionsPage;
