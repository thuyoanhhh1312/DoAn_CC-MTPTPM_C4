import { Card, Divider, Tag, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';

const { Paragraph, Text, Title } = Typography;

const NewsDetailPage = () => {
  const { slug } = useParams();

  const articleTitle = (slug || 'article')
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  return (
    <PageContainer
      title={articleTitle}
      subtitle="News detail scaffold for CMS-driven editorial content."
      breadcrumbItems={[
        { title: 'News', href: '/news' },
        { title: articleTitle },
      ]}
    >
      <Card>
        <Tag color="#12332B">Editorial</Tag>
        <Title level={3} className="portal-title">
          {articleTitle}
        </Title>
        <Text type="secondary">Published Feb 2026 by Aurelia Editorial Team</Text>
        <Divider />
        <Paragraph>
          This page is ready for CMS integration. Replace placeholder paragraphs with rich content,
          media blocks, and related article modules served from your API.
        </Paragraph>
        <Paragraph>
          Keep typography and spacing grounded in editorial tone while preserving Ant Design controls
          for actions like share, save, and recommendations.
        </Paragraph>
      </Card>
    </PageContainer>
  );
};

export default NewsDetailPage;
