import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { FolderTree, Pencil, Plus, Search, Store, Trash2 } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import categoryApi from "@/api/categoryApi";
import subCategoryApi from "@/api/subCategoryApi";

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  JSON.parse(localStorage.getItem("user") || "null")?.token;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        categoryApi.getCategories(),
        subCategoryApi.getSubCategories(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải dữ liệu danh mục",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return categories.filter((category) => {
      if (!normalizedKeyword) return true;
      return (
        String(category.category_name || "").toLowerCase().includes(normalizedKeyword) ||
        String(category.description || "").toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [categories, keyword]);

  const categoryStats = useMemo(() => {
    return filteredCategories.reduce(
      (acc, category) => {
        acc.total += 1;
        if (category.is_active) acc.active += 1;
        acc.subcategories += subcategories.filter(
          (item) => Number(item.category_id) === Number(category.category_id),
        ).length;
        return acc;
      },
      { total: 0, active: 0, subcategories: 0 },
    );
  }, [filteredCategories, subcategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      category_name: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      category_name: category.category_name || "",
      description: category.description || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const accessToken = getAccessToken();
      if (editingCategory) {
        await categoryApi.updateCategory(
          editingCategory.category_id,
          values.category_name,
          values.description || "",
          accessToken,
        );
        message.success("Cập nhật danh mục thành công");
      } else {
        await categoryApi.createCategory(
          values.category_name,
          values.description || "",
          accessToken,
        );
        message.success("Tạo danh mục thành công");
      }

      setModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      message.error(
        error.response?.data?.message || "Không thể lưu danh mục",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setDeleteLoading(true);
    try {
      await categoryApi.deleteCategory(
        selectedCategory.category_id,
        getAccessToken(),
      );
      message.success("Đã dừng bán danh mục");
      setDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể dừng bán danh mục",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "Danh mục",
      key: "category_name",
      sorter: (a, b) =>
        String(a.category_name || "").localeCompare(String(b.category_name || "")),
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">{record.category_name}</div>
          <div className="text-xs text-gray-500">
            ID: {record.category_id}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (value) => value || "Chưa có mô tả",
    },
    {
      title: "Danh mục con",
      key: "subcategories",
      render: (_, record) =>
        subcategories.filter(
          (item) => Number(item.category_id) === Number(record.category_id),
        ).length,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (value) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Đang bán" : "Dừng bán"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button icon={<Pencil size={14} />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => openDeleteModal(record)}
          >
            Dừng bán
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý danh mục"
      subtitle="Quản trị category và theo dõi số lượng subcategory trong từng danh mục."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Statistic
            title="Tổng danh mục"
            value={categoryStats.total}
            prefix={<FolderTree size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Đang bán"
            value={categoryStats.active}
            prefix={<Store size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng danh mục con"
            value={categoryStats.subcategories}
            prefix={<FolderTree size={16} />}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            className="max-w-xl"
            placeholder="Tìm theo tên hoặc mô tả danh mục..."
            prefix={<Search size={16} />}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="primary" icon={<Plus size={14} />} onClick={openCreateModal}>
            Thêm danh mục
          </Button>
        </div>

        <Table
          rowKey="category_id"
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Tạo danh mục"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          if (!saving) {
            setModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
          }
        }}
        okText={editingCategory ? "Lưu thay đổi" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{ loading: saving }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="category_name"
            label="Tên danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Dừng bán danh mục"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setSelectedCategory(null);
          }
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <Space direction="vertical">
          <div>
            Bạn có chắc muốn dừng bán danh mục{" "}
            <strong>{selectedCategory?.category_name}</strong>?
          </div>
          <div className="text-sm text-gray-500">
            Các sản phẩm liên quan sẽ bị chuyển sang trạng thái dừng bán.
          </div>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default CategoriesPage;
