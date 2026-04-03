import { useMemo } from 'react';
import { Button, Card, Col, Pagination, Row, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';
import StateSection from '@/components/common/StateSection';

const { Paragraph, Text } = Typography;

const sampleProducts = [
  { id: '1', name: 'Lumiere Halo Ring', price: 2300, badge: 'Best Seller', slug: 'lumiere-halo-ring' },
  { id: '2', name: 'Opaline Choker', price: 1800, badge: 'New', slug: 'opaline-choker' },
  { id: '3', name: 'Aster Pendant', price: 1450, badge: 'Limited', slug: 'aster-pendant' },
  { id: '4', name: 'Crown Bracelet', price: 2900, badge: 'Best Seller', slug: 'crown-bracelet' },
  { id: '5', name: 'Etoile Earrings', price: 1200, badge: 'New', slug: 'etoile-earrings' },
  { id: '6', name: 'Velvet Ring', price: 2100, badge: 'Limited', slug: 'velvet-ring' },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const categoryName = useMemo(() => {
    if (!slug) {
      return 'Category';
    }

    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [slug]);

  return (
    <PageContainer
      title={categoryName}
      subtitle="Category listing skeleton with responsive card grid and paging controls."
      breadcrumbItems={[
        { title: 'Home', href: '/' },
        { title: categoryName },
      ]}
    >
      <StateSection
        loading={false}
        error={null}
        empty={sampleProducts.length === 0}
        emptyDescription="No products in this category yet"
      >
        <Row gutter={[16, 16]}>
          {sampleProducts.map((product) => (
            <Col key={product.id} xs={24} md={12} xl={8}>
              <Card
                title={product.name}
                extra={<Tag color="#B08A4A">{product.badge}</Tag>}
                actions={[
                  <Button key={product.id} type="link" onClick={() => navigate(`/product/${product.slug}`)}>
                    View Product
                  </Button>,
                ]}
              >
                <Paragraph style={{ marginBottom: 8 }}>Fine craftsmanship with editorial style cues.</Paragraph>
                <Text strong>${product.price.toLocaleString()}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mt-6 flex justify-center">
          <Pagination current={1} total={48} pageSize={12} showSizeChanger={false} />
        </div>
      </StateSection>
    </PageContainer>
  );
};

export default CategoryPage;
