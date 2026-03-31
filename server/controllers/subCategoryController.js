import db from "../models/index.js";
import { Op } from "sequelize";

const parseCategoryId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getProductStatsBySubcategoryIds = async (subcategoryIds) => {
  if (!subcategoryIds || subcategoryIds.length === 0) {
    return new Map();
  }

  const rows = await db.Product.findAll({
    attributes: [
      "subcategory_id",
      [
        db.Sequelize.fn(
          "SUM",
          db.Sequelize.literal("CASE WHEN is_active = 1 THEN 1 ELSE 0 END"),
        ),
        "active_products",
      ],
      [
        db.Sequelize.fn(
          "SUM",
          db.Sequelize.literal("CASE WHEN is_active = 0 THEN 1 ELSE 0 END"),
        ),
        "inactive_products",
      ],
    ],
    where: {
      subcategory_id: {
        [Op.in]: subcategoryIds,
      },
    },
    group: ["subcategory_id"],
    raw: true,
  });

  const statsMap = new Map();
  rows.forEach((row) => {
    statsMap.set(row.subcategory_id, {
      active_products: Number(row.active_products) || 0,
      inactive_products: Number(row.inactive_products) || 0,
    });
  });

  return statsMap;
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await db.SubCategory.findAll({
      include: {
        model: db.Category,
        attributes: ["category_name"],
      },
    });

    const subcategoryIds = subCategories.map((item) => item.subcategory_id);
    const statsMap = await getProductStatsBySubcategoryIds(subcategoryIds);

    const response = subCategories.map((item) => {
      const raw = item.toJSON();
      const stats = statsMap.get(raw.subcategory_id) || {
        active_products: 0,
        inactive_products: 0,
      };

      return {
        ...raw,
        ...stats,
        is_stopped_selling:
          stats.active_products === 0 && stats.inactive_products > 0,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách danh mục con",
      error: error.message,
    });
  }
};

export const getSubCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const subCategory = await db.SubCategory.findByPk(id, {
      include: {
        model: db.Category,
        attributes: ["category_name"],
      },
    });
    if (!subCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    const statsMap = await getProductStatsBySubcategoryIds([
      subCategory.subcategory_id,
    ]);
    const stats = statsMap.get(subCategory.subcategory_id) || {
      active_products: 0,
      inactive_products: 0,
    };

    res.status(200).json({
      ...subCategory.toJSON(),
      ...stats,
      is_stopped_selling:
        stats.active_products === 0 && stats.inactive_products > 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh mục con", error: error.message });
  }
};

export const createSubCategory = async (req, res) => {
  const { subcategory_name, description, category_id } = req.body;
  try {
    if (!subcategory_name || !category_id) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ subcategory_name và category_id",
      });
    }

    const parsedCategoryId = parseCategoryId(category_id);
    if (!parsedCategoryId) {
      return res.status(400).json({ message: "category_id không hợp lệ" });
    }

    const category = await db.Category.findByPk(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục cha không tồn tại" });
    }

    const newSubCategory = await db.SubCategory.create({
      subcategory_name,
      description,
      category_id: parsedCategoryId,
    });
    res.status(201).json(newSubCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo danh mục con", error: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { subcategory_name, description, category_id } = req.body;

  try {
    const subcategory = await db.SubCategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({ message: "Không tìm thấy nhóm sản phẩm." });
    }

    if (category_id !== undefined) {
      const parsedCategoryId = parseCategoryId(category_id);
      if (!parsedCategoryId) {
        return res.status(400).json({ message: "category_id không hợp lệ" });
      }

      const category = await db.Category.findByPk(parsedCategoryId);
      if (!category) {
        return res.status(404).json({ message: "Danh mục cha không tồn tại" });
      }

      subcategory.category_id = parsedCategoryId;
    }

    if (subcategory_name !== undefined) {
      subcategory.subcategory_name = subcategory_name;
    }
    if (description !== undefined) {
      subcategory.description = description;
    }

    await subcategory.save();

    res.status(200).json({
      message: "Cập nhật nhóm sản phẩm thành công.",
      data: subcategory,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhóm sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi cập nhật nhóm sản phẩm.",
      error: error.message,
    });
  }
};

export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const subCategory = await db.SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục con" });
    }

    const [affectedRows] = await db.Product.update(
      { is_active: false },
      {
        where: {
          subcategory_id: subCategory.subcategory_id,
          is_active: true,
        },
      },
    );

    res.status(200).json({
      message:
        "Đã dừng bán sản phẩm thuộc danh mục con. Không xóa danh mục con.",
      affected_products: affectedRows,
      subcategory_status: "stopped_selling",
      is_stopped_selling: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi dừng bán danh mục con", error: error.message });
  }
};
