import db from "../models/index.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách danh mục",
        error: error.message,
      });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }
    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh mục", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { category_name, description } = req.body;
  console.log(category_name, description);

  try {
    const newCategory = await db.Category.create({
      category_name,
      description,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo danh mục", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;
  try {
    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }
    category.category_name = category_name || category.category_name;
    category.description = description || category.description;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật danh mục", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const subCategoryCount = await db.SubCategory.count({
      where: { category_id: id },
    });
    const productCount = await db.Product.count({ where: { category_id: id } });

    if (subCategoryCount > 0 || productCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục vì đang có ${subCategoryCount} nhóm sản phẩm và ${productCount} sản phẩm liên quan.`,
      });
    }

    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    await category.destroy();
    res.status(200).json({ message: "Xóa danh mục thành công." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi xóa danh mục.", error: error.message });
  }
};
