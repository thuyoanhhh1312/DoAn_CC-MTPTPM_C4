import { useMemo, useState } from 'react';
import { Button, Card, Form, Input, List, Select, Slider, Space, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/common/PageContainer';
import StateSection from '@/components/common/StateSection';

const { Paragraph, Text } = Typography;

const allProducts = [
  { id: 'p1', name: 'Celeste Solitaire Ring', metal: 'gold', price: 2200, slug: 'celeste-solitaire' },
  { id: 'p2', name: 'Noir Diamond Choker', metal: 'platinum', price: 4800, slug: 'noir-choker' },
  { id: 'p3', name: 'Muse Pearl Earrings', metal: 'silver', price: 980, slug: 'muse-pearl' },
  { id: 'p4', name: 'Vela Emerald Pendant', metal: 'gold', price: 3200, slug: 'vela-emerald' },
  { id: 'p5', name: 'Aurum Cuff Bracelet', metal: 'gold', price: 1600, slug: 'aurum-cuff' },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [metal, setMetal] = useState(undefined);
  const [priceRange, setPriceRange] = useState([500, 5000]);
  const [loading, setLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchQuery = !query || item.name.toLowerCase().includes(query.toLowerCase());
      const matchMetal = !metal || item.metal === metal;
      const matchPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      return matchQuery && matchMetal && matchPrice;
    });
  }, [query, metal, priceRange]);

  const runSearch = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
  };

  return (
    <PageContainer title="Search & Filter" subtitle="Discover products by style, material, and price band.">
      <Card className="mb-4">
        <Form layout="vertical" onFinish={runSearch}>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
            <Form.Item className="col-span-4 md:col-span-4 desktop:col-span-5" label="Keyword">
              <Input
                allowClear
                placeholder="Search by product name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Form.Item>

            <Form.Item className="col-span-4 md:col-span-4 desktop:col-span-3" label="Metal">
              <Select
                allowClear
                placeholder="Select metal"
                value={metal}
                onChange={(value) => setMetal(value)}
                options={[
                  { label: 'Gold', value: 'gold' },
                  { label: 'Platinum', value: 'platinum' },
                  { label: 'Silver', value: 'silver' },
                ]}
              />
            </Form.Item>

            <Form.Item className="col-span-4 md:col-span-6 desktop:col-span-3" label="Price range (USD)">
              <Slider range min={200} max={10000} value={priceRange} onChange={setPriceRange} />
            </Form.Item>

            <Form.Item className="col-span-4 md:col-span-2 desktop:col-span-1" label=" ">
              <Button block htmlType="submit" type="primary" loading={loading}>
                Apply
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card title={`Results (${filteredProducts.length})`}>
        <StateSection
          loading={loading}
          error={null}
          empty={filteredProducts.length === 0}
          emptyDescription="No products matched your filters"
        >
          <List
            dataSource={filteredProducts}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key={item.id} type="link" onClick={() => navigate(`/product/${item.slug}`)}>
                    View detail
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <Space>
                      <Tag>{item.metal.toUpperCase()}</Tag>
                      <Text strong>${item.price.toLocaleString()}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ marginBottom: 0 }}>
            Search scaffolding is wired with AntD controls and can be connected to your backend filters.
          </Paragraph>
        </StateSection>
      </Card>
    </PageContainer>
  );
};

export default SearchPage;
