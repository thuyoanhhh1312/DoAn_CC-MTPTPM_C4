import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import PageContainer from "@/components/common/PageContainer";
import axiosInstance from "@/api/axiosInstance";

const { Text } = Typography;

const genderOptions = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
  { label: "Khác", value: "Khác" },
];

const roleLabelMap = {
  1: "admin",
  2: "customer",
  3: "staff",
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setFetching(true);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          JSON.parse(localStorage.getItem("user") || "null")?.token;

        if (!token) {
          return;
        }

        const userResponse = await axiosInstance.get("/auth/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = userResponse.data?.user;
        if (!currentUser) {
          return;
        }

        setUser(currentUser);

        const nextRoles = Array.isArray(currentUser.roles)
          ? currentUser.roles
          : currentUser.role_id
            ? [roleLabelMap[currentUser.role_id] || `role-${currentUser.role_id}`]
            : [];
        setRoles(nextRoles);

        let currentCustomer = null;
        try {
          const customerResponse = await axiosInstance.get(
            `/customers/by-user/${currentUser.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          currentCustomer = customerResponse.data;
          setCustomer(currentCustomer);
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error;
          }
        }

        form.setFieldsValue({
          fullName: currentCustomer?.name || currentUser.name || "",
          email: currentCustomer?.email || currentUser.email || "",
          phone: currentCustomer?.phone || "",
          gender: currentCustomer?.gender || undefined,
          birthday: currentCustomer?.birthday
            ? dayjs(currentCustomer.birthday)
            : null,
          address: currentCustomer?.address || "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        message.error(
          error.response?.data?.message || "Không thể tải thông tin hồ sơ",
        );
      } finally {
        setFetching(false);
      }
    };

    fetchProfileData();
  }, [form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        JSON.parse(localStorage.getItem("user") || "null")?.token;

      const payload = {
        fullName: values.fullName,
        phone: values.phone?.trim() || "",
        gender: values.gender || "",
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : "",
        address: values.address?.trim() || "",
        password: values.password || undefined,
      };

      const response = await axiosInstance.put("/customers/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const nextUser = response.data?.user || user;
      const nextCustomer = response.data?.customer || customer;

      setUser(nextUser);
      setCustomer(nextCustomer);

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: nextUser?.name || storedUser.name,
          }),
        );
      }

      message.success(
        response.data?.message || "Cập nhật hồ sơ thành công",
      );

      form.setFieldsValue({
        fullName: nextCustomer?.name || nextUser?.name || values.fullName,
        email: nextCustomer?.email || nextUser?.email || values.email,
        phone: nextCustomer?.phone || values.phone || "",
        gender: nextCustomer?.gender || values.gender || undefined,
        birthday: nextCustomer?.birthday
          ? dayjs(nextCustomer.birthday)
          : values.birthday || null,
        address: nextCustomer?.address || values.address || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      message.error(
        Array.isArray(serverErrors) && serverErrors.length > 0
          ? serverErrors[0]
          : error.response?.data?.message || "Cập nhật hồ sơ thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Profile"
      subtitle="Cập nhật thông tin cá nhân và hồ sơ khách hàng."
    >
      <Card loading={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            fullName: user?.name || "",
            email: user?.email || "",
            phone: "",
            gender: undefined,
            birthday: null,
            address: "",
            password: "",
            confirmPassword: "",
          }}
        >
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="fullName"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="email"
              label="Email"
            >
              <Input disabled placeholder="Email không thể thay đổi" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="phone"
              label="Số điện thoại"
              rules={[
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const normalized = String(value).trim();
                    if (!/^[0-9+\s()-]{8,20}$/.test(normalized)) {
                      return Promise.reject(
                        new Error("Số điện thoại không hợp lệ"),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="gender"
              label="Giới tính"
            >
              <Select
                allowClear
                options={genderOptions}
                placeholder="Chọn giới tính"
              />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="birthday"
              label="Ngày sinh"
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="address"
              label="Địa chỉ"
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập địa chỉ"
              />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="password"
              label="Mật khẩu mới"
              rules={[
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value.length < 6) {
                      return Promise.reject(
                        new Error("Mật khẩu phải có ít nhất 6 ký tự"),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Để trống nếu không đổi mật khẩu" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue("password");

                    if (!password && !value) {
                      return Promise.resolve();
                    }

                    if (password && !value) {
                      return Promise.reject(
                        new Error("Vui lòng xác nhận mật khẩu"),
                      );
                    }

                    if (password !== value) {
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp"),
                      );
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <div className="col-span-4 flex items-end md:col-span-4 desktop:col-span-6">
              <Space wrap>
                {roles.map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
                {customer?.segment_type && (
                  <Tag color="gold">{customer.segment_type}</Tag>
                )}
                <Text type="secondary">
                  Cập nhật thông tin sẽ đồng bộ cho hồ sơ khách hàng.
                </Text>
              </Space>
            </div>
          </div>

          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? "Đang lưu..." : "Lưu hồ sơ"}
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
