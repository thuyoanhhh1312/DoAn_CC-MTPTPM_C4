import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Modal, Space, Statistic, Table, Tag, message } from "antd";
import { Search, Trash2, Users, ShoppingBag, Wallet } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import customerApi from "@/api/customerApi";

const segmentColorMap = {
  bronze: "default",
  silver: "blue",
  gold: "gold",
  vip: "volcano",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  JSON.parse(localStorage.getItem("user") || "null")?.token;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async (searchValue = "") => {
    setLoading(true);
    try {
      const data = await customerApi.getAllCustomers({
        keyword: searchValue,
        accessToken: getAccessToken(),
      });
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách khách hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const summary = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        acc.totalCustomers += 1;
        acc.totalOrders += Number(customer.orderCount || 0);
        acc.totalRevenue += Number(customer.totalOrderAmount || 0);
        return acc;
      },
      { totalCustomers: 0, totalOrders: 0, totalRevenue: 0 },
    );
  }, [customers]);

  const handleSearch = (value) => {
    const nextKeyword = value ?? "";
    setKeyword(nextKeyword);
    fetchCustomers(nextKeyword.trim());
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModalVisible(true);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);
    try {
      const response = await customerApi.deleteCustomer(
        selectedCustomer.customer_id,
        getAccessToken(),
      );
      message.success(response.message || "Đã dừng tài khoản khách hàng");
      setDeleteModalVisible(false);
      setSelectedCustomer(null);
      fetchCustomers(keyword.trim());
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể dừng tài khoản khách hàng",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "name",
      sorter: (a, b) => String(a.name || "").localeCompare(String(b.name || "")),
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">{record.name || "Chưa có tên"}</div>
          <div className="text-xs text-gray-500">ID: {record.customer_id}</div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>{record.email || "Không có email"}</div>
          <div className="text-xs text-gray-500">{record.phone || "Chưa cập nhật số điện thoại"}</div>
        </div>
      ),
    },
    {
      title: "Phân hạng",
      dataIndex: "segment_type",
      key: "segment_type",
      render: (segment) => (
        <Tag color={segmentColorMap[segment] || "default"}>
          {segment || "bronze"}
        </Tag>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: (a, b) => Number(a.orderCount || 0) - Number(b.orderCount || 0),
      render: (value) => Number(value || 0),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalOrderAmount",
      key: "totalOrderAmount",
      sorter: (a, b) =>
        Number(a.totalOrderAmount || 0) - Number(b.totalOrderAmount || 0),
      render: (value) => formatCurrency(value),
    },
    {
      title: "Cảm xúc review",
      key: "sentiment",
      render: (_, record) => (
        <div className="text-xs leading-6 text-gray-600">
          <div>Tích cực: {Number(record.positiveReviewCount || 0)}</div>
          <div>Tiêu cực: {Number(record.negativeReviewCount || 0)}</div>
          <div>Trung tính: {Number(record.neutralReviewCount || 0)}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Button
          danger
          icon={<Trash2 size={14} />}
          onClick={() => openDeleteModal(record)}
        >
          Dừng tài khoản
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý khách hàng"
      subtitle="Theo dõi hồ sơ khách hàng, doanh thu, đơn hàng và trạng thái tài khoản."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Statistic
            title="Tổng khách hàng"
            value={summary.totalCustomers}
            prefix={<Users size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng đơn hàng"
            value={summary.totalOrders}
            prefix={<ShoppingBag size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng chi tiêu"
            value={summary.totalRevenue}
            formatter={(value) => formatCurrency(value)}
            prefix={<Wallet size={16} />}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input.Search
            className="max-w-xl"
            placeholder="Tìm theo tên, email, số điện thoại..."
            prefix={<Search size={16} />}
            allowClear
            enterButton="Tìm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
          />
          <div className="text-sm text-gray-500">
            Hiển thị <strong>{customers.length}</strong> khách hàng
          </div>
        </div>

        <Table
          rowKey="customer_id"
          columns={columns}
          dataSource={customers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title="Dừng tài khoản khách hàng"
        open={deleteModalVisible}
        onOk={handleDeleteCustomer}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalVisible(false);
            setSelectedCustomer(null);
          }
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleting }}
        closable={!deleting}
      >
        <Space direction="vertical" size={6}>
          <div>
            Bạn có chắc muốn dừng tài khoản của{" "}
            <strong>{selectedCustomer?.name}</strong>?
          </div>
          <div className="text-sm text-gray-500">
            Email: {selectedCustomer?.email || "Không có"}
          </div>
          <div className="text-sm text-red-600">
            Người dùng sẽ không thể tiếp tục sử dụng tài khoản này.
          </div>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default CustomersPage;
