import db from "../models/index.js";
import {
  getCategoryColumns,
  getExistingCategoryAttributes,
  pickExistingCategoryFields,
} from "../utils/categorySchema.js";

const CATEGORY_BASE_ATTRIBUTES = [
  "category_id",
  "category_name",
  "description",
  "is_active",
  "created_at",
  "updated_at",
];

const parseCategoryId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseCategoryPayload = (body = {}, { requireName = false } = {}) => {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, "category_name")) {
    const normalizedName =
      typeof body.category_name === "string" ? body.category_name.trim() : "";
    if (!normalizedName) {
      return { error: "category_name khong hop le" };
    }
    payload.category_name = normalizedName;
  } else if (requireName) {
    return { error: "category_name la bat buoc" };
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (body.description === null) {
      payload.description = null;
    } else if (typeof body.description === "string") {
      payload.description = body.description.trim();
    } else {
      return { error: "description khong hop le" };
    }
  }

  return { payload };
};

const handleCategoryError = (res, error, fallbackMessage) => {
  if (error?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "Ten danh muc da ton tai" });
  }

  return res
    .status(500)
    .json({ message: fallbackMessage, error: error.message });
};

const findCategoryByIdSafe = async (categoryId) => {
  const attributes = await getExistingCategoryAttributes(CATEGORY_BASE_ATTRIBUTES);
  return db.Category.findByPk(categoryId, { attributes });
};

const updateCategorySellingStatus = async (res, categoryId, isActive) => {
  const category = await findCategoryByIdSafe(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Khong tim thay danh muc." });
  }

  const categoryColumns = await getCategoryColumns();
  if (categoryColumns.has("is_active")) {
    category.is_active = isActive;
    await category.save();
  }

  const [affectedRows] = await db.Product.update(
    { is_active: isActive },
    {
      where: {
        category_id: categoryId,
        is_active: !isActive,
      },
    },
  );

  return res.status(200).json({
    message: isActive
      ? "Da mo ban lai san pham thuoc danh muc."
      : "Da dung ban san pham thuoc danh muc.",
    category_id: category.category_id,
    category_is_active: categoryColumns.has("is_active")
      ? category.is_active
      : null,
    affected_products: affectedRows,
    category_status: isActive ? "open_selling" : "stopped_selling",
    is_stopped_selling: !isActive,
  });
};

export const getAllCategories = async (req, res) => {
  try {
    const attributes = await getExistingCategoryAttributes(
      CATEGORY_BASE_ATTRIBUTES,
    );
    const categories = await db.Category.findAll({
      attributes,
      order: [["category_id", "ASC"]],
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Loi khi lay danh sach danh muc",
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);

  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh muc khong hop le" });
  }

  try {
    const category = await findCategoryByIdSafe(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh muc khong tim thay" });
    }
    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Loi khi lay danh muc", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { payload, error: payloadError } = parseCategoryPayload(req.body, {
    requireName: true,
  });

  if (payloadError) {
    return res.status(400).json({ message: payloadError });
  }

  try {
    const safePayload = await pickExistingCategoryFields(payload);
    const newCategory = await db.Category.create(safePayload);
    res.status(201).json(newCategory);
  } catch (error) {
    return handleCategoryError(res, error, "Loi khi tao danh muc");
  }
};

export const updateCategory = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh muc khong hop le" });
  }

  const { payload, error: payloadError } = parseCategoryPayload(req.body);
  if (payloadError) {
    return res.status(400).json({ message: payloadError });
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ message: "Khong co du lieu cap nhat" });
  }

  try {
    const category = await findCategoryByIdSafe(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh muc khong tim thay" });
    }

    const safePayload = await pickExistingCategoryFields(payload);
    Object.assign(category, safePayload);
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    return handleCategoryError(res, error, "Loi khi cap nhat danh muc");
  }
};

export const deleteCategory = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh muc khong hop le" });
  }

  try {
    return await updateCategorySellingStatus(res, parsedCategoryId, false);
  } catch (error) {
    res.status(500).json({
      message: "Loi server khi dung ban danh muc.",
      error: error.message,
    });
  }
};

export const openCategorySelling = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh muc khong hop le" });
  }

  try {
    return await updateCategorySellingStatus(res, parsedCategoryId, true);
  } catch (error) {
    res.status(500).json({
      message: "Loi server khi mo ban danh muc.",
      error: error.message,
    });
  }
};
