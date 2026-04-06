import { Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import { AlertTriangle, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import ResponsiveDataTable from "@/components/common/ResponsiveDataTable";
import ReviewSummaryAdmin from "@/components/ReviewSummaryAdmin";

const { Paragraph, Text } = Typography;

const reviewSummary = {
  data: {
    overall: {
      totalReviews: 1248,
      avgRating: 4.2,
    },
    sentiment: {
      POS: 742,
      NEG: 146,
      NEU: 311,
      UNKNOWN: 49,
    },
    rating: {
      5: 618,
      4: 284,
      3: 196,
      2: 98,
      1: 52,
    },
    suspicious: {
      count: 3,
      label: "Review cần kiểm duyệt",
      reviews: [
        {
          customer: "Ngọc Anh",
          rating: 5,
          sentiment: "NEG",
          content:
            "Cho 5 sao nhưng nội dung phản ánh giao hàng chậm và đá bị lỏng sau 2 ngày sử dụng.",
          reason: "Mâu thuẫn giữa rating và cảm xúc trong nội dung.",
          created_at: "2026-04-06T09:14:00.000Z",
        },
        {
          customer: "Khánh Vy",
          rating: 1,
          sentiment: "POS",
          content:
            "Nội dung khen rất tốt về tư vấn và chất lượng nhưng lại chấm 1 sao.",
          reason: "Có thể khách chọn nhầm số sao hoặc review không nhất quán.",
          created_at: "2026-04-06T08:02:00.000Z",
        },
        {
          customer: "Minh Quân",
          rating: 2,
          sentiment: "NEG",
          content:
            "Bình luận chứa từ ngữ công kích nhân viên và có dấu hiệu vi phạm guideline hiển thị.",
          reason: "Nội dung công kích cần được duyệt thủ công.",
          created_at: "2026-04-05T21:36:00.000Z",
        },
      ],
    },
  },
};

const moderationRows = [
  {
    id: "RV-913",
    product: "Nhẫn bạc đính đá Aurora",
    customer: "Ngọc Anh",
    sentiment: "Tiêu cực",
    confidence: "97%",
    status: "flagged",
    action: "Ẩn tạm thời",
  },
  {
    id: "RV-904",
    product: "Dây chuyền Celestia Pearl",
    customer: "Khánh Vy",
    sentiment: "Tích cực",
    confidence: "94%",
    status: "pending",
    action: "Xác minh rating",
  },
  {
    id: "RV-887",
    product: "Lắc tay Golden Orbit",
    customer: "Minh Quân",
    sentiment: "Độc hại",
    confidence: "92%",
    status: "escalated",
    action: "Admin xử lý",
  },
  {
    id: "RV-875",
    product: "Bông tai Moonlight",
    customer: "Thanh Trúc",
    sentiment: "Trung tính",
    confidence: "81%",
    status: "approved",
    action: "Giữ hiển thị",
  },
];

const statusColor = {
  approved: "green",
  pending: "gold",
  flagged: "red",
  escalated: "volcano",
};

const sentimentColor = {
  "Tích cực": "green",
  "Trung tính": "gold",
  "Tiêu cực": "red",
  "Độc hại": "magenta",
};

const columns = [
  { title: "Review ID", dataIndex: "id", key: "id" },
  { title: "Sản phẩm", dataIndex: "product", key: "product" },
  { title: "Khách hàng", dataIndex: "customer", key: "customer" },
  {
    title: "Sentiment",
    key: "sentiment",
    render: (_, row) => <Tag color={sentimentColor[row.sentiment]}>{row.sentiment}</Tag>,
  },
  { title: "Độ tin cậy", dataIndex: "confidence", key: "confidence" },
  {
    title: "Trạng thái",
    key: "status",
    render: (_, row) => <Tag color={statusColor[row.status]}>{row.status}</Tag>,
  },
  { title: "Hành động gợi ý", dataIndex: "action", key: "action" },
];

const overviewCards = [
  {
    key: "scan",
    title: "Đã quét hôm nay",
    value: 386,
    suffix: "reviews",
    icon: <Sparkles size={18} className="text-[#c48c46]" />,
    className: "from-amber-50 to-white",
  },
  {
    key: "flagged",
    title: "Bị gắn cờ",
    value: 37,
    suffix: "reviews",
    icon: <ShieldAlert size={18} className="text-red-500" />,
    className: "from-red-50 to-white",
  },
  {
    key: "safe",
    title: "Hợp lệ",
    value: 349,
    suffix: "reviews",
    icon: <ShieldCheck size={18} className="text-green-600" />,
    className: "from-green-50 to-white",
  },
];

const ReviewsModerationPage = () => {
  return (
    <PageContainer
      title="Reviews Moderation"
      subtitle="UI phân tích cảm xúc cho admin để theo dõi đánh giá bất thường, review rủi ro và hàng đợi kiểm duyệt."
      actions={[
        <Button key="refresh">Làm mới</Button>,
        <Button key="export" type="primary">
          Xuất báo cáo
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]}>
        {overviewCards.map((card) => (
          <Col key={card.key} xs={24} md={8}>
            <Card className={`bg-gradient-to-br ${card.className}`} bordered={false}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text type="secondary">{card.title}</Text>
                  <div className="mt-3 flex items-end gap-2">
                    <Statistic value={card.value} valueStyle={{ fontSize: 28, lineHeight: 1 }} />
                    <Text type="secondary">{card.suffix}</Text>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">{card.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="mt-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <ReviewSummaryAdmin summary={reviewSummary} />
          </Col>

          <Col xs={24} xl={8}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card title="Ưu tiên xử lý" extra={<Tag color="red">3 review</Tag>}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {reviewSummary.data.suspicious.reviews.map((review, index) => (
                    <div
                      key={`${review.customer}-${index}`}
                      className="rounded-2xl border border-red-100 bg-red-50/60 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <Text strong>{review.customer}</Text>
                          <div className="mt-1">
                            <Text type="secondary">{review.reason}</Text>
                          </div>
                        </div>
                        <AlertTriangle size={18} className="text-red-500" />
                      </div>
                      <Paragraph style={{ marginBottom: 0 }}>{review.content}</Paragraph>
                    </div>
                  ))}
                </Space>
              </Card>

              <Card title="Gợi ý vận hành">
                <Space direction="vertical" size={10}>
                  <Text>1. Ẩn tạm review có dấu hiệu độc hại hoặc công kích.</Text>
                  <Text>2. Kiểm tra các trường hợp mâu thuẫn giữa số sao và nội dung.</Text>
                  <Text>3. Dùng queue bên dưới để giao việc kiểm duyệt theo mức ưu tiên.</Text>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="mt-4">
        <Card title="Moderation Queue" extra={<Tag color="#c48c46">AI-assisted</Tag>}>
          <ResponsiveDataTable
            columns={columns}
            dataSource={moderationRows}
            rowKey="id"
            emptyDescription="No review items"
            cardFields={[
              { key: "id", label: "Review ID", dataIndex: "id" },
              { key: "product", label: "Sản phẩm", dataIndex: "product" },
              { key: "customer", label: "Khách hàng", dataIndex: "customer" },
              {
                key: "status",
                label: "Trạng thái",
                dataIndex: "status",
                render: (value) => <Tag color={statusColor[value]}>{value}</Tag>,
              },
            ]}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default ReviewsModerationPage;
