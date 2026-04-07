import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  message,
  Tag,
  Space,
  Checkbox,
  Tooltip,
  Drawer,
  Row,
  Col,
  Card,
  Progress,
  Divider,
  Empty,
  Skeleton,
  Slider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BgColorsOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import productApi from '@/api/productApi';

const ReviewsModerationPageEnhanced = () => {
  // ============ STATE MANAGEMENT ============
  const [reviews, setReviews] = useState([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [toxicScoreRange, setToxicScoreRange] = useState([0, 1]);
  const [filterSentiment, setFilterSentiment] = useState(null);
  const [filterRating, setFilterRating] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);

  // Modals/Dialogs
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sentimentLabelMode, setSentimentLabelMode] = useState(false);
  const [bulkLabelSentimentModal, setBulkLabelSentimentModal] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [bulkNote, setBulkNote] = useState('');
  const [detailNote, setDetailNote] = useState('');

  // ============ FETCH TOXIC REVIEWS ============
  const fetchToxicReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const sort = `${sortOrder === 'DESC' ? '-' : ''}${sortBy}`;
      const response = await productApi.getToxicReviewsPending(
        filterStatus,
        pagination.page,
        pagination.limit,
        sort
      );

      setReviews(response.data?.reviews || []);
      if (response.data?.pagination) {
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.pages,
        });
      }
    } catch (error) {
      message.error('❌ Lỗi lấy danh sách reviews: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchToxicReviews();
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filterStatus, fetchToxicReviews]);

  // ============ CHECKBOX HANDLERS ============
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReviewIds(reviews.map((r) => r.review_id));
    } else {
      setSelectedReviewIds([]);
    }
  };

  const handleSelectReview = (reviewId) => {
    setSelectedReviewIds((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  };

  // ============ BULK ACTIONS ============
  const handleBulkApprove = () => {
    Modal.confirm({
      title: '✅ Xác nhận duyệt',
      content: `Bạn muốn duyệt ${selectedReviewIds.length} reviews?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsLoadingBulk(true);
        try {
          await productApi.bulkUpdateToxicReviews(selectedReviewIds, 'approve', bulkNote);
          message.success(`✅ Đã duyệt ${selectedReviewIds.length} reviews`);
          setSelectedReviewIds([]);
          setBulkNote('');
          await fetchToxicReviews();
        } catch (error) {
          message.error('❌ Lỗi duyệt: ' + error.message);
        } finally {
          setIsLoadingBulk(false);
        }
      },
    });
  };

  const handleBulkReject = () => {
    Modal.confirm({
      title: '❌ Xác nhận từ chối',
      content: (
        <div>
          <p>Bạn muốn từ chối {selectedReviewIds.length} reviews?</p>
          <Input.TextArea
            placeholder="Nhập lý do từ chối (tùy chọn)"
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            rows={3}
          />
        </div>
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsLoadingBulk(true);
        try {
          await productApi.bulkUpdateToxicReviews(selectedReviewIds, 'reject', bulkNote);
          message.success(`✅ Đã từ chối ${selectedReviewIds.length} reviews`);
          setSelectedReviewIds([]);
          setBulkNote('');
          await fetchToxicReviews();
        } catch (error) {
          message.error('❌ Lỗi từ chối: ' + error.message);
        } finally {
          setIsLoadingBulk(false);
        }
      },
    });
  };

  // ============ BULK SENTIMENT LABELING ============
  const handleBulkLabelSentiment = async () => {
    if (!selectedSentiment) {
      message.error('Vui lòng chọn sentiment');
      return;
    }

    setIsLoadingBulk(true);
    try {
      await productApi.bulkLabelSentiment(selectedReviewIds, selectedSentiment);
      message.success(`✅ Đã gán sentiment cho ${selectedReviewIds.length} reviews`);
      setSelectedReviewIds([]);
      setSelectedSentiment(null);
      setBulkLabelSentimentModal(false);
      await fetchToxicReviews();
    } catch (error) {
      message.error('❌ Lỗi gán sentiment: ' + error.message);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  // ============ SINGLE REVIEW ACTIONS ============
  const handleOpenDetail = async (reviewId) => {
    try {
      const response = await productApi.getToxicReviewDetail(reviewId);
      setSelectedReview(response.data?.review);
      setDetailNote('');
      setSentimentLabelMode(false);
      setDetailDrawerOpen(true);
    } catch (error) {
      message.error('❌ Lỗi lấy chi tiết: ' + error.message);
    }
  };

  const handleApproveDetail = async () => {
    try {
      await productApi.approveToxicReview(selectedReview.review_id, detailNote);
      message.success('✅ Đã duyệt review');
      setDetailDrawerOpen(false);
      setSelectedReviewIds(prev => prev.filter(id => id !== selectedReview.review_id));
      await fetchToxicReviews();
    } catch (error) {
      message.error('❌ Lỗi duyệt: ' + error.message);
    }
  };

  const handleRejectDetail = async () => {
    try {
      await productApi.rejectToxicReview(selectedReview.review_id, detailNote);
      message.success('✅ Đã từ chối review');
      setDetailDrawerOpen(false);
      setSelectedReviewIds(prev => prev.filter(id => id !== selectedReview.review_id));
      await fetchToxicReviews();
    } catch (error) {
      message.error('❌ Lỗi từ chối: ' + error.message);
    }
  };

  const handleLabelSentimentDetail = async () => {
    if (!selectedSentiment) {
      message.error('Vui lòng chọn sentiment');
      return;
    }

    try {
      await productApi.adminLabelSentiment(selectedReview.review_id, selectedSentiment);
      message.success('✅ Đã gán sentiment');
      setSelectedReview(null);
      setSentimentLabelMode(false);
      setDetailDrawerOpen(false);
      setSelectedSentiment(null);
      await fetchToxicReviews();
    } catch (error) {
      message.error('❌ Lỗi gán sentiment: ' + error.message);
    }
  };

  // ============ TABLE COLUMNS ============
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedReviewIds.length === reviews.length && reviews.length > 0}
          indeterminate={
            selectedReviewIds.length > 0 && selectedReviewIds.length < reviews.length
          }
          onChange={handleSelectAll}
        />
      ),
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedReviewIds.includes(record.review_id)}
          onChange={() => handleSelectReview(record.review_id)}
        />
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
      render: (text) => <span>{text || 'N/A'}</span>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: '⭐ Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating) => {
        const colors = ['red', 'orange', 'orange', 'blue', 'green'];
        return <Tag color={colors[rating - 1] || 'default'}>{rating}⭐</Tag>;
      },
    },
    {
      title: '☠️ Độc tính',
      dataIndex: 'toxic_score',
      key: 'toxic_score',
      width: 150,
      render: (score) => {
        const percent = score ? Math.round(score * 100) : 0;
        const status = percent > 70 ? 'exception' : percent > 50 ? 'normal' : 'success';
        return (
          <Tooltip title={`${percent}%`}>
            <Progress percent={percent} size="small" status={status} />
          </Tooltip>
        );
      },
    },
    {
      title: '💭 Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 120,
      render: (sentiment) => {
        const config = {
          POS: { emoji: '😊', color: 'green', label: 'Tích cực' },
          NEG: { emoji: '😠', color: 'red', label: 'Tiêu cực' },
          NEU: { emoji: '😐', color: 'blue', label: 'Trung lập' },
          UNC: { emoji: '❓', color: 'orange', label: 'Không chắc' },
        };
        const s = config[sentiment] || config.UNC;
        return <Tag color={s.color}>{s.emoji} {s.label}</Tag>;
      },
    },
    {
      title: '📋 Trạng thái',
      dataIndex: 'admin_review_status',
      key: 'admin_review_status',
      width: 120,
      render: (status) => {
        const config = {
          pending: { emoji: '⚠️', color: 'warning', label: 'Chờ duyệt' },
          approved: { emoji: '✅', color: 'success', label: 'Đã duyệt' },
          rejected: { emoji: '❌', color: 'error', label: 'Từ chối' },
        };
        const s = config[status] || config.pending;
        return <Tag color={s.color}>{s.emoji} {s.label}</Tag>;
      },
    },
    {
      title: '⚙️ Thao tác',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleOpenDetail(record.review_id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // ============ PAGINATION HANDLER ============
  const handlePaginationChange = (page) => {
    setSelectedReviewIds([]);
    setPagination((prev) => ({ ...prev, page }));
  };

  // ============ FILTERED REVIEWS ============
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchToxicScore =
        review.toxic_score >= toxicScoreRange[0] &&
        review.toxic_score <= toxicScoreRange[1];
      const matchSentiment = !filterSentiment || review.sentiment === filterSentiment;
      const matchRating = !filterRating || review.rating === filterRating;
      const matchSearch =
        !searchText ||
        review.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        review.product_name?.toLowerCase().includes(searchText.toLowerCase());

      return matchToxicScore && matchSentiment && matchRating && matchSearch;
    });
  }, [reviews, toxicScoreRange, filterSentiment, filterRating, searchText]);

  // ============ DETAIL DRAWER ============
  const renderDetailDrawer = () => {
    if (!selectedReview) return null;

    const statusConfig = {
      pending: { emoji: '⚠️', color: 'warning', label: 'Chờ duyệt' },
      approved: { emoji: '✅', color: 'success', label: 'Đã duyệt' },
      rejected: { emoji: '❌', color: 'error', label: 'Bị từ chối' },
    };

    const status = statusConfig[selectedReview.admin_review_status] || statusConfig.pending;
    const score = selectedReview.toxic_score || 0;
    const scoreStatus = score > 0.7 ? 'exception' : score > 0.5 ? 'normal' : 'success';

    return (
      <Drawer
        title={`💬 Chi tiết Review #${selectedReview.review_id}`}
        placement="right"
        width={700}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {/* Section 1: Review Content */}
        <Card title="📝 Nội dung đánh giá" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>👤 Khách hàng:</strong> {selectedReview.customer_name}</p>
            </Col>
            <Col span={12}>
              <p><strong>⭐ Đánh giá:</strong> <Tag color="blue">{selectedReview.rating}⭐</Tag></p>
            </Col>
          </Row>
          <p><strong>📦 Sản phẩm:</strong> {selectedReview.product_name}</p>
          <p><strong>💬 Nội dung:</strong></p>
          <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4, marginBottom: 12 }}>
            {selectedReview.content}
          </div>
          <p style={{ fontSize: 12, color: '#999' }}>
            📅 {new Date(selectedReview.created_at).toLocaleString('vi-VN')}
          </p>
        </Card>

        {/* Section 2: Toxic Information */}
        <Card title="☠️ Thông tin độc tính" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Điểm độc tính:</strong></p>
              <Progress
                type="circle"
                percent={Math.round((selectedReview.toxic_score || 0) * 100)}
                status={scoreStatus}
                width={100}
              />
            </Col>
            <Col span={12}>
              <p><strong>🏷️ Danh mục:</strong></p>
              <div>
                {selectedReview.toxic_categories &&
                  selectedReview.toxic_categories.split(',').map((cat) => (
                    <Tag color="volcano" key={cat} style={{ marginBottom: 4 }}>
                      {cat.trim()}
                    </Tag>
                  ))}
              </div>
            </Col>
          </Row>
          {selectedReview.toxic_reason && (
            <p><strong>📌 Lý do:</strong> {selectedReview.toxic_reason}</p>
          )}
        </Card>

        {/* Section 3: Admin Review Status */}
        <Card title="✏️ Trạng thái duyệt của Admin" size="small" style={{ marginBottom: 16 }}>
          <p>
            <strong>Trạng thái:</strong>
            <Tag color={status.color} style={{ marginLeft: 8 }}>
              {status.emoji} {status.label}
            </Tag>
          </p>

          {selectedReview.admin_review_status !== 'pending' && (
            <>
              {selectedReview.reviewed_by && (
                <p><strong>👤 Duyệt bởi:</strong> {selectedReview.reviewed_by}</p>
              )}
              {selectedReview.admin_review_note && (
                <p><strong>📝 Ghi chú:</strong> {selectedReview.admin_review_note}</p>
              )}
              {selectedReview.updated_at && (
                <p>
                  <strong>📅 Ngày duyệt:</strong>{' '}
                  {new Date(selectedReview.updated_at).toLocaleString('vi-VN')}
                </p>
              )}
            </>
          )}

          {selectedReview.admin_review_status === 'pending' && (
            <>
              <Divider />
              <p style={{ marginBottom: 12 }}><strong>💬 Ghi chú duyệt (tùy chọn):</strong></p>
              <Input.TextArea
                placeholder="Nhập ghi chú..."
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                rows={3}
                style={{ marginBottom: 12 }}
              />
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={handleApproveDetail} loading={isLoadingBulk}>
                  ✅ Duyệt
                </Button>
                <Button danger onClick={handleRejectDetail} loading={isLoadingBulk}>
                  ❌ Từ chối
                </Button>
              </Space>
            </>
          )}
        </Card>

        {/* Section 4: Sentiment Analysis */}
        <Card title="💭 Phân tích Sentiment" size="small">
          <p>
            <strong>Sentiment hiện tại:</strong>
            {selectedReview.sentiment_confidence && (
              <span style={{ marginLeft: 8 }}>
                (Độ tin cậy: {Math.round(selectedReview.sentiment_confidence * 100)}%)
              </span>
            )}
          </p>
          <div style={{ padding: 12, backgroundColor: '#f9f9f9', borderRadius: 4, marginBottom: 12 }}>
            {!sentimentLabelMode ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Giá trị:</strong> {selectedReview.sentiment}</p>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="text"
                      icon={<BgColorsOutlined />}
                      onClick={() => setSentimentLabelMode(true)}
                      size="small"
                    >
                      Gán sentiment thủ công
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 12 }}><strong>🎯 Chọn sentiment:</strong></p>
                <Select
                  placeholder="Chọn sentiment"
                  value={selectedSentiment}
                  onChange={setSelectedSentiment}
                  style={{ marginBottom: 12, width: '100%' }}
                  options={[
                    { label: '😊 Tích cực (POS)', value: 'POS' },
                    { label: '😠 Tiêu cực (NEG)', value: 'NEG' },
                    { label: '😐 Trung lập (NEU)', value: 'NEU' },
                    { label: '❓ Không chắc (UNC)', value: 'UNC' },
                  ]}
                />
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleLabelSentimentDetail}
                    loading={isLoadingBulk}
                  >
                    💾 Lưu
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setSentimentLabelMode(false);
                      setSelectedSentiment(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </>
            )}
          </div>
        </Card>
      </Drawer>
    );
  };

  // ============ RENDER ============
  return (
    <div className="reviews-moderation-container" style={{ padding: '24px' }}>
      {/* Header with filtering */}
      <Card style={{ marginBottom: 24 }} title={<h2>☠️ Quản lý Đánh giá Độc hại</h2>}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input.Search
              placeholder="🔍 Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="📋 Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              options={[
                { label: '⚠️ Chờ duyệt', value: 'pending' },
                { label: '✅ Đã duyệt', value: 'approved' },
                { label: '❌ Từ chối', value: 'rejected' },
                { label: '📊 Tất cả', value: null },
              ]}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="💭 Sentiment"
              value={filterSentiment}
              onChange={setFilterSentiment}
              style={{ width: '100%' }}
              allowClear
              options={[
                { label: '😊 Tích cực', value: 'POS' },
                { label: '😠 Tiêu cực', value: 'NEG' },
                { label: '😐 Trung lập', value: 'NEU' },
                { label: '❓ Không chắc', value: 'UNC' },
              ]}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="⭐ Đánh giá"
              value={filterRating}
              onChange={setFilterRating}
              style={{ width: '100%' }}
              allowClear
              options={[1, 2, 3, 4, 5].map((r) => ({ label: `${r}⭐`, value: r }))}
            />
          </Col>
          <Col span={6}>
            <p style={{ fontSize: 12, marginBottom: 4 }}>
              ☠️ Độc tính: {toxicScoreRange[0].toFixed(2)} - {toxicScoreRange[1].toFixed(2)}
            </p>
            <Slider
              range
              min={0}
              max={1}
              step={0.05}
              value={toxicScoreRange}
              onChange={setToxicScoreRange}
              marks={{ 0: '0', 1: '1' }}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="🔄 Sắp xếp"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
              options={[
                { label: '📅 Ngày tạo', value: 'created_at' },
                { label: '☠️ Độc tính', value: 'toxic_score' },
                { label: '⭐ Đánh giá', value: 'rating' },
              ]}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="↕️ Hướng"
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: '100%' }}
              options={[
                { label: '↓ Giảm dần', value: 'DESC' },
                { label: '↑ Tăng dần', value: 'ASC' },
              ]}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              block
              onClick={fetchToxicReviews}
              loading={isLoading}
            >
              🔄 Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bulk Action Toolbar */}
      {selectedReviewIds.length > 0 && (
        <Card style={{ marginBottom: 24, backgroundColor: '#e6f7ff' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                ✓ Đã chọn {selectedReviewIds.length} reviews
              </span>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleBulkApprove}
                  loading={isLoadingBulk}
                >
                  ✅ Duyệt hàng loạt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleBulkReject}
                  loading={isLoadingBulk}
                >
                  ❌ Từ chối hàng loạt
                </Button>
                <Button
                  icon={<BgColorsOutlined />}
                  onClick={() => setBulkLabelSentimentModal(true)}
                  loading={isLoadingBulk}
                >
                  💭 Gán Sentiment
                </Button>
                <Button onClick={() => setSelectedReviewIds([])}>
                  Hủy chọn
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Table */}
      {isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      ) : reviews.length === 0 ? (
        <Empty description="📭 Không có reviews nào" style={{ marginTop: 50 }} />
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={filteredReviews}
              loading={isLoading}
              pagination={false}
              rowKey="review_id"
              size="middle"
              scroll={{ x: 1200 }}
            />
          </Card>

          {/* Pagination */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <strong>📊 Thống kê:</strong> {filteredReviews.length} / {pagination.total} reviews
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Button onClick={() => handlePaginationChange(1)} disabled={pagination.page === 1}>
                ◀◀ Đầu
              </Button>
              <Button onClick={() => handlePaginationChange(pagination.page - 1)} disabled={pagination.page === 1}>
                ◀ Trước
              </Button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, pagination.page - 2);
                return start + i;
              }).map((page) => (
                <Button
                  key={page}
                  type={pagination.page === page ? 'primary' : 'default'}
                  onClick={() => handlePaginationChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button onClick={() => handlePaginationChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
                Sau ▶
              </Button>
              <Button onClick={() => handlePaginationChange(pagination.totalPages)} disabled={pagination.page === pagination.totalPages}>
                Cuối ▶▶
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Bulk Sentiment Modal */}
      <Modal
        title="💭 Gán Sentiment hàng loạt"
        open={bulkLabelSentimentModal}
        onOk={handleBulkLabelSentiment}
        onCancel={() => {
          setBulkLabelSentimentModal(false);
          setSelectedSentiment(null);
        }}
        confirmLoading={isLoadingBulk}
      >
        <p>Chọn sentiment cho {selectedReviewIds.length} reviews đã chọn:</p>
        <Select
          placeholder="Chọn sentiment..."
          value={selectedSentiment}
          onChange={setSelectedSentiment}
          style={{ width: '100%', marginBottom: 16 }}
          options={[
            { label: '😊 Tích cực (POS)', value: 'POS' },
            { label: '😠 Tiêu cực (NEG)', value: 'NEG' },
            { label: '😐 Trung lập (NEU)', value: 'NEU' },
            { label: '❓ Không chắc (UNC)', value: 'UNC' },
          ]}
        />
      </Modal>

      {/* Detail Drawer */}
      {renderDetailDrawer()}
    </div>
  );
};

export default ReviewsModerationPageEnhanced;
