import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";
import PageContainer from "../../components/common/PageContainer";
import campaignApi from "../../api/campaignApi";
import promotionLogApi from "../../api/promotionLogApi";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const statusMeta = {
  sent: { label: "Đã gửi", color: "success" },
  failed: { label: "Thất bại", color: "error" },
  pending: { label: "Đang chờ", color: "warning" },
};

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-";

const formatSegment = (segment) => {
  if (!segment) return "Không phân nhóm";
  return segment.toUpperCase();
};

const PromotionLogsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const [messageApi, contextHolder] = message.useMessage();

  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    campaign_id: undefined,
    email_status: undefined,
    date_range: null,
    keyword: "",
  });

  const isAdmin = Number(user?.role_id) === 1;

  const fetchCampaigns = async () => {
    try {
      const response = await campaignApi.getAllCampaigns({}, user?.token);
      setCampaigns(response?.data || []);
    } catch (apiError) {
      console.error("Error fetching campaigns:", apiError);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.campaign_id) params.campaign_id = filters.campaign_id;
      if (filters.email_status) params.email_status = filters.email_status;
      if (filters.date_range?.length === 2) {
        params.start_date = filters.date_range[0].format("YYYY-MM-DD");
        params.end_date = filters.date_range[1].format("YYYY-MM-DD");
      }

      const response = await promotionLogApi.getAllPromotionLogs(
        params,
        user?.token,
      );
      setLogs(response?.data || []);
    } catch (apiError) {
      console.error("Error fetching promotion logs:", apiError);
      setError(
        apiError?.response?.data?.message ||
          "Không thể tải nhật ký khuyến mãi ở thời điểm này.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchCampaigns();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const visibleLogs = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    if (!keyword) return logs;

    return logs.filter((log) => {
      const values = [
        log.Customer?.name,
        log.Customer?.email,
        log.Customer?.segment_type,
        log.Promotion?.promotion_code,
        log.Promotion?.PromotionCampaign?.name,
        log.error_message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(keyword);
    });
  }, [filters.keyword, logs]);

  const summary = useMemo(() => {
    return visibleLogs.reduce(
      (accumulator, item) => {
        accumulator.total += 1;
        if (item.email_status === "sent") accumulator.sent += 1;
        if (item.email_status === "failed") accumulator.failed += 1;
        if (item.email_status === "pending") accumulator.pending += 1;
        return accumulator;
      },
      { total: 0, sent: 0, failed: 0, pending: 0 },
    );
  }, [visibleLogs]);

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      campaign_id: undefined,
      email_status: undefined,
      date_range: null,
      keyword: "",
    });
    setSelectedRowKeys([]);
  };

  const handleDeleteSelected = async () => {
    if (!selectedRowKeys.length) return;

    setDeleting(true);
    try {
      await promotionLogApi.deletePromotionLogs(selectedRowKeys, user?.token);
      messageApi.success(`Đã xóa ${selectedRowKeys.length} nhật ký khuyến mãi.`);
      setSelectedRowKeys([]);
      fetchLogs();
    } catch (apiError) {
      console.error("Error deleting promotion logs:", apiError);
      messageApi.error(
        apiError?.response?.data?.message || "Không thể xóa nhật ký đã chọn.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      width: 220,
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {row.Customer?.name || "Khách hàng ẩn danh"}
          </span>
          <span className="text-xs text-gray-500">
            {row.Customer?.email || "Không có email"}
          </span>
        </div>
      ),
    },
    {
      title: "Phân nhóm",
      key: "segment",
      width: 130,
      render: (_, row) => (
        <Tag color="gold">{formatSegment(row.Customer?.segment_type)}</Tag>
      ),
    },
    {
      title: "Mã khuyến mãi",
      key: "promotion",
      width: 220,
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {row.Promotion?.promotion_code || "Không xác định"}
          </span>
          <span className="text-xs text-gray-500">
            Giảm {row.Promotion?.discount ?? 0}%
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái email",
      dataIndex: "email_status",
      key: "email_status",
      width: 150,
      render: (status) => {
        const meta = statusMeta[status] || {
          label: status || "Không rõ",
          color: "default",
        };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Thời gian gửi",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 180,
      render: (value) => <span>{formatDateTime(value)}</span>,
    },
    {
      title: "Lỗi",
      dataIndex: "error_message",
      key: "error_message",
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value || "Không có lỗi"}
        </span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Nhật ký khuyến mãi"
      subtitle="Theo dõi lịch sử gửi email ưu đãi, lọc theo chiến dịch và quản lý các bản ghi gửi thủ công."
      actions={[
        <Button
          key="send"
          type="primary"
          icon={<Mail size={16} />}
          onClick={() => navigate("/admin/promotion-logs/send")}
        >
          Gửi thủ công
        </Button>,
      ]}
    >
      {contextHolder}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card bordered={false} className="shadow-sm">
          <Statistic title="Tổng bản ghi" value={summary.total} />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic title="Đã gửi" value={summary.sent} valueStyle={{ color: "#15803d" }} />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic title="Thất bại" value={summary.failed} valueStyle={{ color: "#dc2626" }} />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic title="Đang chờ" value={summary.pending} valueStyle={{ color: "#d97706" }} />
        </Card>
      </div>

      <Card className="mb-6 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Input
              allowClear
              placeholder="Tìm theo email, khách hàng, mã KM..."
              prefix={<Search size={16} />}
              value={filters.keyword}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, keyword: event.target.value }))
              }
            />
          </div>
          <div className="lg:col-span-3">
            <Select
              allowClear
              className="w-full"
              placeholder="Chọn campaign"
              value={filters.campaign_id}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, campaign_id: value }))
              }
              options={(campaigns || []).map((campaign) => ({
                label: campaign.name,
                value: campaign.campaign_id,
              }))}
            />
          </div>
          <div className="lg:col-span-2">
            <Select
              allowClear
              className="w-full"
              placeholder="Trạng thái email"
              value={filters.email_status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, email_status: value }))
              }
              options={[
                { label: "Đã gửi", value: "sent" },
                { label: "Thất bại", value: "failed" },
                { label: "Đang chờ", value: "pending" },
              ]}
            />
          </div>
          <div className="lg:col-span-3">
            <RangePicker
              className="w-full"
              format="DD/MM/YYYY"
              value={filters.date_range}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, date_range: value }))
              }
            />
          </div>
          <div className="flex gap-2 lg:col-span-1">
            <Button
              type="primary"
              className="w-full"
              onClick={handleApplyFilters}
            >
              Lọc
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Space wrap>
            <Button icon={<RefreshCw size={16} />} onClick={fetchLogs}>
              Tải lại
            </Button>
            <Button onClick={handleResetFilters}>Đặt lại</Button>
            {isAdmin && (
              <Popconfirm
                title="Xóa các log đã chọn?"
                description="Thao tác này không thể hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteSelected}
                disabled={!selectedRowKeys.length}
              >
                <Button
                  danger
                  loading={deleting}
                  disabled={!selectedRowKeys.length}
                  icon={<Trash2 size={16} />}
                >
                  Xóa đã chọn
                </Button>
              </Popconfirm>
            )}
          </Space>
          <Text type="secondary">
            Hiển thị {visibleLogs.length} / {logs.length} bản ghi
          </Text>
        </div>
      </Card>

      {error ? (
        <Alert
          className="mb-6"
          type="error"
          showIcon
          message="Không thể tải nhật ký khuyến mãi"
          description={error}
        />
      ) : null}

      <Card className="shadow-sm">
        <Table
          rowKey="log_id"
          loading={loading}
          columns={columns}
          dataSource={visibleLogs}
          scroll={{ x: 1100 }}
          rowSelection={
            isAdmin
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }
              : undefined
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có nhật ký khuyến mãi nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />

        {!isAdmin ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <span className="text-sm">
              Tài khoản staff có thể xem và gửi thủ công, nhưng chỉ admin mới được xóa nhật ký.
            </span>
          </div>
        ) : null}
      </Card>
    </PageContainer>
  );
};

export default PromotionLogsPage;
