import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import { FolderTree, Layers3, Pencil, Plus, Search, Trash2 } from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import subCategoryApi from "@/api/subCategoryApi";
import categoryApi from "@/api/categoryApi";

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  JSON.parse(localStorage.getItem("user") || "null")?.token;

const SubCategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subcategoriesData, categoriesData] = await Promise.all([
        subCategoryApi.getSubCategories(),
        categoryApi.getCategories(),
      ]);
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải dữ liệu danh mục con",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.category_name,
        value: category.category_id,
      })),
    [categories],
  );

  const filteredSubcategories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return subcategories.filter((subcategory) => {
      if (!normalizedKeyword) return true;
      const parentName =
        subcategory.Category?.category_name ||
        categories.find(
          (category) =>
            Number(category.category_id) === Number(subcategory.category_id),
        )?.category_name ||
        "";

      return (
        String(subcategory.subcategory_name || "")
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(subcategory.description || "")
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(parentName).toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [categories, keyword, subcategories]);

  const stats = useMemo(() => {
    const categorySet = new Set(
      filteredSubcategories.map((subcategory) => Number(subcategory.category_id)),
    );
    const activeCount = filteredSubcategories.filter(
      (subcategory) => !subcategory.is_stopped_selling,
    ).length;

    return {
      total: filteredSubcategories.length,
      categories: categorySet.size,
      active: activeCount,
    };
  }, [filteredSubcategories]);

  const getCategoryName = (subcategory) => {
    return (
      subcategory.Category?.category_name ||
      categories.find(
        (category) => Number(category.category_id) === Number(subcategory.category_id),
      )?.category_name ||
      "Không xác định"
    );
  };

  const openCreateModal = () => {
    setEditingSubcategory(null);
    form.resetFields();
    form.setFieldsValue({
      subcategory_name: "",
      description: "",
      category_id: undefined,
    });
    setModalOpen(true);
  };

  const openEditModal = (subcategory) => {
    setEditingSubcategory(subcategory);
    form.setFieldsValue({
      subcategory_name: subcategory.subcategory_name || "",
      description: subcategory.description || "",
      category_id: subcategory.category_id || undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const accessToken = getAccessToken();

      if (editingSubcategory) {
        await subCategoryApi.updateSubCategory(
          editingSubcategory.subcategory_id,
          {
            subcategory_name: values.subcategory_name.trim(),
            description: values.description.trim(),
            category_id: Number(values.category_id),
          },
          accessToken,
        );
        message.success("Cập nhật danh mục con thành công");
      } else {
        await subCategoryApi.createSubCategory(
          values.subcategory_name.trim(),
          values.description.trim(),
          Number(values.category_id),
          accessToken,
        );
        message.success("Tạo danh mục con thành công");
      }

      setModalOpen(false);
      setEditingSubcategory(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(
        error.response?.data?.message || "Không thể lưu danh mục con",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSubcategory) return;

    setDeleteLoading(true);
    try {
      const response = await subCategoryApi.deleteSubCategory(
        selectedSubcategory.subcategory_id,
        getAccessToken(),
      );
      message.success(response?.message || "Đã dừng bán danh mục con");
      setDeleteModalOpen(false);
      setSelectedSubcategory(null);
      fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể dừng bán danh mục con",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "Danh mục con",
      key: "subcategory_name",
      sorter: (a, b) =>
        String(a.subcategory_name || "").localeCompare(
          String(b.subcategory_name || ""),
        ),
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">
            {record.subcategory_name}
          </div>
          <div className="text-xs text-gray-500">
            ID: {record.subcategory_id}
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục cha",
      key: "category",
      render: (_, record) => getCategoryName(record),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (value) => value || "Chưa có mô tả",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={record.is_stopped_selling ? "default" : "green"}>
          {record.is_stopped_selling ? "Dừng bán" : "Đang bán"}
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
      title="Quản lý danh mục con"
      subtitle="Quản trị subcategory theo cùng giao diện với category trong admin."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Statistic
            title="Tổng danh mục con"
            value={stats.total}
            prefix={<Layers3 size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Danh mục cha đang dùng"
            value={stats.categories}
            prefix={<FolderTree size={16} />}
          />
        </Card>
        <Card>
          <Statistic
            title="Đang bán"
            value={stats.active}
            prefix={<Layers3 size={16} />}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            className="max-w-xl"
            placeholder="Tìm theo tên, mô tả hoặc danh mục cha..."
            prefix={<Search size={16} />}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="primary" icon={<Plus size={14} />} onClick={openCreateModal}>
            Thêm danh mục con
          </Button>
        </div>

        <Table
          rowKey="subcategory_id"
          columns={columns}
          dataSource={filteredSubcategories}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 950 }}
        />
      </Card>

      <Modal
        title={editingSubcategory ? "Cập nhật danh mục con" : "Tạo danh mục con"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          if (!saving) {
            setModalOpen(false);
            setEditingSubcategory(null);
            form.resetFields();
          }
        }}
        okText={editingSubcategory ? "Lưu thay đổi" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{ loading: saving }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subcategory_name"
            label="Tên danh mục con"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục con" },
              { min: 2, message: "Tên danh mục con phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên danh mục con" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục cha"
            rules={[{ required: true, message: "Vui lòng chọn danh mục cha" }]}
          >
            <Select
              options={categoryOptions}
              placeholder="Chọn danh mục cha"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục con" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Dừng bán danh mục con"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setSelectedSubcategory(null);
          }
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <Space direction="vertical">
          <div>
            Bạn có chắc muốn dừng bán danh mục con{" "}
            <strong>{selectedSubcategory?.subcategory_name}</strong>?
          </div>
          <div className="text-sm text-gray-500">
            Danh mục cha: {selectedSubcategory ? getCategoryName(selectedSubcategory) : ""}
          </div>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default SubCategory;
