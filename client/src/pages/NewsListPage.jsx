import { Button, Card, List, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Paragraph } = Typography;

const newsItems = [
  {
    id: 'n1',
    slug: 'atelier-tour-2026',
    category: 'Behind the Scenes',
    title: 'Inside the Aurelia Atelier: Spring 2026',
    summary: 'A look at stone selection, hand-polishing, and final quality controls.',
  },
  {
    id: 'n2',
    slug: 'gold-demand-outlook',
    category: 'Market',
    title: 'Gold Demand Outlook and Pricing Signals',
    summary: 'How macro trends are shaping fine jewelry purchasing behavior.',
  },
  {
    id: 'n3',
    slug: 'wedding-edit',
    category: 'Style Guide',
    title: 'Wedding Editorial: Pairing Veils with Signature Pieces',
    summary: 'Styling recommendations from our in-house creative team.',
  },
];

const NewsListPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="News" subtitle="Editorial stories, market insights, and product narratives.">
      <Card>
        <List
          itemLayout="vertical"
          dataSource={newsItems}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              extra={<Tag color="#12332B">{item.category}</Tag>}
              actions={[
                <Button key={item.id} type="link" onClick={() => navigate(`/news/${item.slug}`)}>
                  Read article
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} />
              <Paragraph style={{ marginBottom: 0 }}>{item.summary}</Paragraph>
            </List.Item>
          )}
        />
      </Card>
    </PageContainer>
  );
};

export default NewsListPage;
