import db from "../models/index.js";

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
      return {
        error: "category_name không hợp lệ",
      };
    }
    payload.category_name = normalizedName;
  } else if (requireName) {
    return {
      error: "category_name là bắt buộc",
    };
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (body.description === null) {
      payload.description = null;
    } else if (typeof body.description === "string") {
      payload.description = body.description.trim();
    } else {
      return {
        error: "description không hợp lệ",
      };
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

const updateCategorySellingStatus = async (res, categoryId, isActive) => {
  const category = await db.Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Không tìm thấy danh mục." });
  }

  category.is_active = isActive;
  await category.save();

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
    category_is_active: category.is_active,
    affected_products: affectedRows,
    category_status: isActive ? "open_selling" : "stopped_selling",
    is_stopped_selling: !isActive,
  });
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.status(200).json(categories);
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
    const category = await db.Category.findByPk(parsedCategoryId);
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
  const { payload, error: payloadError } = parseCategoryPayload(req.body, {
    requireName: true,
  });

  if (payloadError) {
    return res.status(400).json({ message: payloadError });
  }

  try {
    const newCategory = await db.Category.create(payload);
    res.status(201).json(newCategory);
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
    const category = await db.Category.findByPk(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }

    Object.assign(category, payload);

    await category.save();
    res.status(200).json(category);
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
    res
      .status(500)
      .json({
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
