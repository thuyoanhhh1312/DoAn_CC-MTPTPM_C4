import db from "../models/index.js";

let hasIsActiveColumnCache = null;

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
      return { error: "category_name không hợp lệ" };
    }
    payload.category_name = normalizedName;
  } else if (requireName) {
    return { error: "category_name là bắt buộc" };
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (body.description === null) {
      payload.description = null;
    } else if (typeof body.description === "string") {
      payload.description = body.description.trim();
    } else {
      return { error: "description không hợp lệ" };
    }
  }

  return { payload };
};

const handleCategoryError = (res, error, fallbackMessage) => {
  if (error?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
  }

  return res
    .status(500)
    .json({ message: fallbackMessage, error: error.message });
};

const hasCategoryIsActiveColumn = async () => {
  if (hasIsActiveColumnCache !== null) {
    return hasIsActiveColumnCache;
  }

  try {
    const tableDefinition = await db.sequelize
      .getQueryInterface()
      .describeTable("category");
    hasIsActiveColumnCache = Object.prototype.hasOwnProperty.call(
      tableDefinition,
      "is_active",
    );
  } catch (_error) {
    hasIsActiveColumnCache = false;
  }

  return hasIsActiveColumnCache;
};

const getCategoryAttributes = async () => {
  const baseAttributes = ["category_id", "category_name", "description"];
  if (await hasCategoryIsActiveColumn()) {
    return [...baseAttributes, "is_active", "created_at", "updated_at"];
  }
  return [...baseAttributes, "created_at", "updated_at"];
};

const normalizeCategoryResponse = (category, hasIsActiveColumn) => {
  if (!category) return category;
  const plain = typeof category.get === "function" ? category.get({ plain: true }) : category;
  return {
    ...plain,
    is_active: hasIsActiveColumn ? Boolean(plain.is_active) : true,
  };
};

const findCategoryById = async (categoryId) => {
  const hasIsActive = await hasCategoryIsActiveColumn();
  const attributes = await getCategoryAttributes();
  const category = await db.Category.findByPk(categoryId, { attributes });
  return {
    category,
    hasIsActive,
  };
};

const updateCategorySellingStatus = async (res, categoryId, isActive) => {
  const { category, hasIsActive } = await findCategoryById(categoryId);

  if (!category) {
    return res.status(404).json({ message: "Không tìm thấy danh mục." });
  }

  if (hasIsActive) {
    category.is_active = isActive;
    await category.save({ fields: ["is_active"] });
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
      ? "Đã mở bán lại sản phẩm thuộc danh mục."
      : "Đã dừng bán sản phẩm thuộc danh mục.",
    category_id: category.category_id,
    category_is_active: hasIsActive ? Boolean(category.is_active) : isActive,
    affected_products: affectedRows,
    category_status: isActive ? "open_selling" : "stopped_selling",
    is_stopped_selling: !isActive,
    schema_supports_category_status: hasIsActive,
  });
};

export const getAllCategories = async (req, res) => {
  try {
    const hasIsActive = await hasCategoryIsActiveColumn();
    const attributes = await getCategoryAttributes();
    const categories = await db.Category.findAll({ attributes });
    res
      .status(200)
      .json(categories.map((category) => normalizeCategoryResponse(category, hasIsActive)));
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách danh mục",
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);

  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh mục không hợp lệ" });
  }

  try {
    const { category, hasIsActive } = await findCategoryById(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }
    res.status(200).json(normalizeCategoryResponse(category, hasIsActive));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh mục", error: error.message });
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
    const hasIsActive = await hasCategoryIsActiveColumn();
    const newCategory = await db.Category.create(payload, {
      fields: Object.keys(payload),
    });
    res.status(201).json(normalizeCategoryResponse(newCategory, hasIsActive));
  } catch (error) {
    return handleCategoryError(res, error, "Lỗi khi tạo danh mục");
  }
};

export const updateCategory = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh mục không hợp lệ" });
  }

  const { payload, error: payloadError } = parseCategoryPayload(req.body);
  if (payloadError) {
    return res.status(400).json({ message: payloadError });
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
  }

  try {
    const { category, hasIsActive } = await findCategoryById(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }

    Object.assign(category, payload);

    await category.save({ fields: Object.keys(payload) });
    res.status(200).json(normalizeCategoryResponse(category, hasIsActive));
  } catch (error) {
    return handleCategoryError(res, error, "Lỗi khi cập nhật danh mục");
  }
};

export const deleteCategory = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh mục không hợp lệ" });
  }

  try {
    return await updateCategorySellingStatus(res, parsedCategoryId, false);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi dừng bán danh mục.",
      error: error.message,
    });
  }
};

export const openCategorySelling = async (req, res) => {
  const parsedCategoryId = parseCategoryId(req.params.id);
  if (!parsedCategoryId) {
    return res.status(400).json({ message: "ID danh mục không hợp lệ" });
  }

  try {
    return await updateCategorySellingStatus(res, parsedCategoryId, true);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi mở bán danh mục.",
      error: error.message,
    });
  }
};
