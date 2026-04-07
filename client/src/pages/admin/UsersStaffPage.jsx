import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Modal, Select, Space, Statistic, Table, Tag, message } from "antd";
import { Search, Shield, ShieldCheck, UserCog, Users } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import userApi from "@/api/userApi";
import { useSelector } from "react-redux";

const roleColorMap = {
  admin: "purple",
  staff: "blue",
};

const statusColorMap = {
  active: "green",
  inactive: "red",
};

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  JSON.parse(localStorage.getItem("user") || "null")?.token;

const formatDate = (value) => {
  if (!value) return "Khong ro";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const roleOptions = [
  { label: "Tat ca vai tro", value: "" },
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
];

const statusOptions = [
  { label: "Tat ca trang thai", value: "" },
  { label: "Dang hoat dong", value: "active" },
  { label: "Ngung hoat dong", value: "inactive" },
];

const accountRoleOptions = [
  { label: "Admin", value: 1 },
  { label: "Staff", value: 3 },
];

const UsersStaffPage = () => {
  const currentUser = useSelector((state) => state.user);
  const localUser = JSON.parse(localStorage.getItem("user") || "null");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nextRoleId, setNextRoleId] = useState(3);
  const [updatingRole, setUpdatingRole] = useState(false);

  const currentUserId = currentUser?.id ?? localUser?.id;
  const currentUserRoleId =
    currentUser?.role_id ?? localUser?.role_id;
  const canManageRoles = currentUserRoleId === 1;

  const fetchUsers = async (nextKeyword = "", nextFilters = filters) => {
    setLoading(true);
    try {
      const data = await userApi.getAdminStaffUsers({
        keyword: nextKeyword,
        role: nextFilters.role,
        status: nextFilters.status,
        accessToken: getAccessToken(),
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Khong the tai danh sach admin va nhan vien",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", filters);
  }, []);

  const summary = useMemo(() => {
    return users.reduce(
      (accumulator, user) => {
        accumulator.total += 1;
        accumulator.admins += user.role === "admin" ? 1 : 0;
        accumulator.staffs += user.role === "staff" ? 1 : 0;
        return accumulator;
      },
      { total: 0, admins: 0, staffs: 0 },
    );
  }, [users]);

  const handleSearch = (value) => {
    const nextKeyword = value ?? "";
    setKeyword(nextKeyword);
    fetchUsers(nextKeyword.trim(), filters);
  };

  const handleFilterChange = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: value ?? "",
    };
    setFilters(nextFilters);
    fetchUsers(keyword.trim(), nextFilters);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNextRoleId(user.role_id);
    setRoleModalVisible(true);
  };

  const closeRoleModal = () => {
    if (updatingRole) return;
    setRoleModalVisible(false);
    setSelectedUser(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setUpdatingRole(true);
    try {
      const response = await userApi.updateAdminStaffUserRole(
        selectedUser.id,
        nextRoleId,
        getAccessToken(),
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                ...response.user,
              }
            : user,
        ),
      );

      message.success(response.message || "Cap nhat vai tro thanh cong");
      setRoleModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Khong the cap nhat vai tro tai khoan",
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  const columns = [
    {
      title: "Tai khoan",
      key: "account",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">{record.name || "Chua dat ten"}</div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value) => value || "Khong co email",
    },
    {
      title: "Vai tro",
      dataIndex: "role",
      key: "role",
      render: (value) => (
        <Tag color={roleColorMap[value] || "default"}>
          {value === "admin" ? "Admin" : "Staff"}
        </Tag>
      ),
      filters: roleOptions
        .filter((option) => option.value)
        .map((option) => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Trang thai",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={statusColorMap[value] || "default"}>
          {value === "active" ? "Dang hoat dong" : "Ngung hoat dong"}
        </Tag>
      ),
    },
    {
      title: "Ngay tao",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      render: (value) => formatDate(value),
    },
    {
      title: "Thao tac",
      key: "actions",
      width: 180,
      render: (_, record) => {
        const isSelf = Number(record.id) === Number(currentUserId);

        if (!canManageRoles) {
          return <span className="text-xs text-gray-400">Chi admin duoc doi role</span>;
        }

        if (isSelf) {
          return <span className="text-xs text-gray-400">Khong duoc doi role chinh minh</span>;
        }

        return (
          <Button
            icon={<Shield size={14} />}
            onClick={() => openRoleModal(record)}
          >
            Doi role
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer
      title="Quan ly user va staff"
      subtitle="Danh sach tai khoan back-office co quyen admin hoac staff trong he thong."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Statistic
            title="Tong tai khoan"
            value={summary.total}
            prefix={<Users size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Admin"
            value={summary.admins}
            prefix={<ShieldCheck size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Staff"
            value={summary.staffs}
            prefix={<UserCog size={16} />}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Space wrap size={12}>
            <Input.Search
              className="w-full xl:w-96"
              placeholder="Tim theo ten hoac email..."
              prefix={<Search size={16} />}
              allowClear
              enterButton="Tim"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
            />
            <Select
              value={filters.role}
              options={roleOptions}
              style={{ width: 180 }}
              onChange={(value) => handleFilterChange("role", value)}
            />
            <Select
              value={filters.status}
              options={statusOptions}
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange("status", value)}
            />
          </Space>

          <div className="text-sm text-gray-500">
            Hien thi <strong>{users.length}</strong> tai khoan
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="Cap nhat vai tro tai khoan"
        open={roleModalVisible}
        onOk={handleUpdateRole}
        onCancel={closeRoleModal}
        okText="Luu thay doi"
        cancelText="Huy"
        okButtonProps={{
          loading: updatingRole,
          disabled:
            !selectedUser ||
            Number(selectedUser?.id) === Number(currentUserId) ||
            Number(nextRoleId) === Number(selectedUser?.role_id),
        }}
        closable={!updatingRole}
      >
        <Space direction="vertical" size={12} className="w-full">
          <div>
            <div className="font-medium text-gray-800">
              {selectedUser?.name || "Chua dat ten"}
            </div>
            <div className="text-sm text-gray-500">{selectedUser?.email}</div>
          </div>

          <Select
            className="w-full"
            value={nextRoleId}
            options={accountRoleOptions}
            onChange={setNextRoleId}
            disabled={!selectedUser || Number(selectedUser?.id) === Number(currentUserId)}
          />

          {Number(selectedUser?.id) === Number(currentUserId) ? (
            <div className="text-sm text-red-600">
              Khong duoc thay doi vai tro cua chinh tai khoan admin dang dang nhap.
            </div>
          ) : null}
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default UsersStaffPage;
