import Promotion from "../models/promotion.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { Sequelize } from "sequelize";

// ============ GET ALL PROMOTIONS ============
export const getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, segment_target, campaign_id, sort = "-created_at" } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (segment_target && segment_target !== "null") {
      where.segment_target = segment_target;
    }
    if (campaign_id) {
      where.campaign_id = parseInt(campaign_id);
    }

    // Parse sort parameter (e.g., "-created_at" = DESC, "discount" = ASC)
    const order = [];
    const sortFields = (sort || "-created_at").split(",");
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        order.push([field.substring(1), "DESC"]);
      } else {
        order.push([field, "ASC"]);
      }
    });

    const { count, rows } = await Promotion.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: order.length > 0 ? order : [["created_at", "DESC"]],
      raw: true,
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy danh sách khuyến mãi",
      error: error.message,
    });
  }
};

// ============ GET PROMOTION BY ID ============
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id, { raw: true });

    if (!promotion) {
      return res.status(404).json({
        code: "PROMOTION_NOT_FOUND",
        message: "Khuyến mãi không tồn tại",
      });
    }

    res.status(200).json({ data: promotion });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy chi tiết khuyến mãi",
      error: error.message,
    });
  }
};

// ============ GET CUSTOMER PROMOTIONS ============
export const getCustomerPromotions = async (req, res) => {
  try {
    const customerId = req.user?.customer_id || req.user?.id;
    const segment = req.query.segment || null;

    if (!customerId) {
      return res.status(401).json({
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Người dùng không được xác định",
      });
    }

    const where = {
      [Sequelize.Op.or]: [
        { segment_target: null },
        { segment_target: segment },
      ],
    };

    const promotions = await Promotion.findAll({
      where,
      order: [["created_at", "DESC"]],
      raw: true,
    });

    res.status(200).json({ data: promotions });
  } catch (error) {
    console.error("Error fetching customer promotions:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy khuyến mãi của khách hàng",
      error: error.message,
    });
  }
};

// ============ CREATE PROMOTION ============
export const createPromotion = async (req, res) => {
  try {
    const { promotion_code, campaign_id, segment_target, discount, description, usage_limit } = req.body;

    // Check if promotion code already exists
    const existingPromotion = await Promotion.findOne({
      where: { promotion_code: promotion_code.toUpperCase() },
    });

    if (existingPromotion) {
      return res.status(409).json({
        code: "PROMOTION_CODE_DUPLICATE",
        message: "Mã khuyến mãi đã tồn tại",
      });
    }

    // Validate usage_limit vs usage_count (init at 0)
    if (usage_limit && usage_limit < 0) {
      return res.status(400).json({
        code: "INVALID_USAGE_LIMIT",
        message: "Usage limit phải >= 0",
      });
    }

    const newPromotion = await Promotion.create({
      promotion_code: promotion_code.toUpperCase(),
      campaign_id: campaign_id || null,
      segment_target: segment_target || null,
      discount,
      description: description || null,
      usage_limit: usage_limit || null,
      usage_count: 0, // Auto set to 0
    });

    res.status(201).json({
      message: "Khuyến mãi đã được tạo thành công",
      data: newPromotion.get({ plain: true }),
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi tạo khuyến mãi",
      error: error.message,
    });
  }
};

// ============ UPDATE PROMOTION ============
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { promotion_code, campaign_id, segment_target, discount, description, usage_limit } = req.body;

    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        code: "PROMOTION_NOT_FOUND",
        message: "Khuyến mãi không tồn tại",
      });
    }

    // If updating code, check for duplicates (excluding current)
    if (promotion_code && promotion_code.toUpperCase() !== promotion.promotion_code) {
      const existingPromotion = await Promotion.findOne({
        where: { promotion_code: promotion_code.toUpperCase() },
      });
      if (existingPromotion) {
        return res.status(409).json({
          code: "PROMOTION_CODE_DUPLICATE",
          message: "Mã khuyến mãi đã tồn tại",
        });
      }
    }

    // Validate usage_limit >= usage_count
    if (usage_limit !== undefined && usage_limit < promotion.usage_count) {
      return res.status(400).json({
        code: "INVALID_USAGE_LIMIT",
        message: `Usage limit phải >= usage_count (${promotion.usage_count})`,
      });
    }

    // Update only provided fields (partial update)
    const updateData = {};
    if (promotion_code) updateData.promotion_code = promotion_code.toUpperCase();
    if (campaign_id !== undefined) updateData.campaign_id = campaign_id;
    if (segment_target !== undefined) updateData.segment_target = segment_target;
    if (discount !== undefined) updateData.discount = discount;
    if (description !== undefined) updateData.description = description;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit;

    await promotion.update(updateData);

    res.status(200).json({
      message: "Khuyến mãi đã được cập nhật thành công",
      data: promotion.get({ plain: true }),
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi cập nhật khuyến mãi",
      error: error.message,
    });
  }
};

// ============ DELETE PROMOTION ============
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        code: "PROMOTION_NOT_FOUND",
        message: "Khuyến mãi không tồn tại",
      });
    }

    await promotion.destroy();

    res.status(200).json({
      message: "Khuyến mãi đã được xóa thành công",
      data: { promotion_id: id },
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi xóa khuyến mãi",
      error: error.message,
    });
  }
};
