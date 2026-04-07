import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import { ClipboardList, PackageCheck, Search, Wallet } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import orderApi from "@/api/orderApi";

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  JSON.parse(localStorage.getItem("user") || "null")?.token;

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAllOrders(getAccessToken());
      const nextOrders = Array.isArray(data) ? data : [];
      setOrders(nextOrders);

      const uniqueStatuses = [];
      const seen = new Set();
      nextOrders.forEach((order) => {
        const statusId = order.status_id;
        const statusName = order.OrderStatus?.status_name;
        if (statusId && statusName && !seen.has(statusId)) {
          seen.add(statusId);
          uniqueStatuses.push({
            label: statusName,
            value: statusId,
          });
        }
      });
      setStatusOptions(uniqueStatuses);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return orders.filter((order) => {
      if (!normalizedKeyword) return true;
      return (
        String(order.order_id || "").toLowerCase().includes(normalizedKeyword) ||
        String(order.Customer?.name || "")
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(order.Customer?.email || "")
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(order.OrderStatus?.status_name || "")
          .toLowerCase()
          .includes(normalizedKeyword)
      );
    });
  }, [keyword, orders]);

  const stats = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        acc.totalOrders += 1;
        acc.totalRevenue += Number(order.total || 0);
        if (order.OrderStatus?.status_name) {
          acc.completed += 1;
        }
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0, completed: 0 },
    );
  }, [filteredOrders]);

  const openDetail = (order) => {
    setSelectedOrder(order);
    setSelectedStatusId(order.status_id || null);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatusId) return;

    setUpdateLoading(true);
    try {
      await orderApi.updateOrder(
        selectedOrder.order_id,
        { status_id: selectedStatusId },
        getAccessToken(),
      );
      message.success("Cập nhật trạng thái đơn hàng thành công");
      setDetailOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    {
      title: "Đơn hàng",
      key: "order_id",
      sorter: (a, b) => Number(a.order_id || 0) - Number(b.order_id || 0),
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">#{record.order_id}</div>
          <div className="text-xs text-gray-500">
            {record.created_at
              ? new Date(record.created_at).toLocaleString("vi-VN")
              : "Không rõ thời gian"}
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.Customer?.name || "Không rõ"}</div>
          <div className="text-xs text-gray-500">
            {record.Customer?.email || "Không có email"}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => Number(a.total || 0) - Number(b.total || 0),
      render: (value) => formatCurrency(value),
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.payment_method || "Không rõ"}</div>
          <div className="text-xs text-gray-500">
            {record.transaction_id || "Chưa có mã giao dịch"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={record.OrderStatus?.color_code || "blue"}>
          {record.OrderStatus?.status_name || "Chưa cập nhật"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Button onClick={() => openDetail(record)}>Chi tiết</Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý đơn hàng"
      subtitle="Theo dõi trạng thái, doanh thu và cập nhật xử lý đơn hàng trong admin."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Statistic
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            prefix={<ClipboardList size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng doanh thu"
            value={stats.totalRevenue}
            formatter={(value) => formatCurrency(value)}
            prefix={<Wallet size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Đơn có trạng thái"
            value={stats.completed}
            prefix={<PackageCheck size={16} />}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            className="max-w-xl"
            placeholder="Tìm theo mã đơn, khách hàng, email, trạng thái..."
            prefix={<Search size={16} />}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="text-sm text-gray-500">
            Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
          </div>
        </div>

        <Table
          rowKey="order_id"
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={
          selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.order_id}` : "Chi tiết đơn hàng"
        }
        open={detailOpen}
        onCancel={() => {
          if (!updateLoading) {
            setDetailOpen(false);
            setSelectedOrder(null);
          }
        }}
        onOk={handleUpdateStatus}
        okText="Cập nhật trạng thái"
        cancelText="Đóng"
        okButtonProps={{ loading: updateLoading, disabled: !selectedStatusId }}
        width={760}
      >
        {selectedOrder && (
          <Space direction="vertical" size={14} className="w-full">
            <div>
              <strong>Khách hàng:</strong> {selectedOrder.Customer?.name || "Không rõ"}
            </div>
            <div>
              <strong>Email:</strong> {selectedOrder.Customer?.email || "Không có"}
            </div>
            <div>
              <strong>Số điện thoại:</strong>{" "}
              {selectedOrder.Customer?.phone || "Chưa cập nhật"}
            </div>
            <div>
              <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.total)}
            </div>
            <div>
              <strong>Phương thức thanh toán:</strong>{" "}
              {selectedOrder.payment_method || "Không rõ"}
            </div>
            <div>
              <strong>Trạng thái hiện tại:</strong>{" "}
              <Tag color={selectedOrder.OrderStatus?.color_code || "blue"}>
                {selectedOrder.OrderStatus?.status_name || "Chưa cập nhật"}
              </Tag>
            </div>
            <div>
              <strong>Đổi trạng thái:</strong>
              <Select
                className="mt-2 w-full"
                options={statusOptions}
                value={selectedStatusId}
                onChange={setSelectedStatusId}
                placeholder="Chọn trạng thái"
              />
            </div>
            <div>
              <strong>Sản phẩm:</strong>
              <div className="mt-2 rounded-lg border border-gray-200">
                {selectedOrder.OrderItems?.length > 0 ? (
                  selectedOrder.OrderItems.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">
                          {item.Product?.product_name || "Sản phẩm"}
                        </div>
                        <div className="text-xs text-gray-500">
                          SL: {item.quantity} x {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Không có chi tiết sản phẩm
                  </div>
                )}
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrdersPage;
