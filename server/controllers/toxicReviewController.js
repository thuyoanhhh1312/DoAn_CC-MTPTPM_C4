import db from "../models/index.js";
import { Sequelize } from "sequelize";
import { ERROR_CODES } from "../utils/errorCodes.js";
import {
  getExistingProductReviewAttributes,
  getProductReviewColumns,
} from "../utils/productReviewSchema.js";

const mapReviewWithRelations = (review) => {
  const plainReview =
    typeof review?.toJSON === "function" ? review.toJSON() : review;

  return {
    ...plainReview,
    customer_name: plainReview?.Customer?.name || null,
    customer_email: plainReview?.Customer?.email || null,
    customer_phone: plainReview?.Customer?.phone || null,
    product_name: plainReview?.Product?.product_name || null,
    product_slug: plainReview?.Product?.slug || null,
    product_price: plainReview?.Product?.price || null,
  };
};

const resolveReviewStatus = (review, columns) => {
  if (columns.has("admin_review_status") && review?.admin_review_status) {
    return review.admin_review_status;
  }
  if (columns.has("needs_admin_review") && review?.needs_admin_review) {
    return "pending";
  }
  if (columns.has("is_hidden")) {
    return review?.is_hidden ? "rejected" : "approved";
  }
  return "pending";
};

/**
 * ✅ GET /admin/toxic-reviews
 * Lấy danh sách reviews cần duyệt (phân trang)
 */
export const getToxicReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-created_at", status = "pending" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const columns = await getProductReviewColumns();

    // Build where clause
    const where = {};
    if (columns.has("admin_review_status")) {
      where.admin_review_status =
        status || { [Sequelize.Op.in]: ["pending", "approved", "rejected"] };
    } else if (columns.has("needs_admin_review") && status === "pending") {
      where.needs_admin_review = true;
    } else if (columns.has("is_hidden")) {
      if (status === "approved") where.is_hidden = false;
      if (status === "rejected") where.is_hidden = true;
    }

    // Parse sort parameter
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith("-") ? "DESC" : "ASC";

    const attributes = await getExistingProductReviewAttributes([
      "review_id",
      "product_id",
      "customer_id",
      "rating",
      "content",
      "sentiment",
      "sentiment_confidence",
      "is_toxic",
      "toxic_score",
      "toxic_categories",
      "toxic_types",
      "toxic_reason",
      "toxic_confidence",
      "admin_review_status",
      "admin_review_note",
      "reviewed_by",
      "needs_admin_review",
      "is_hidden",
      "hidden_reason",
      "created_at",
      "updated_at",
    ]);

    const { count, rows } = await db.ProductReview.findAndCountAll({
      where,
      attributes,
      include: [
        {
          model: db.Customer,
          attributes: ["customer_id", "name", "email"],
        },
        {
          model: db.Product,
          attributes: ["product_id", "product_name", "slug"],
        },
      ],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: offset,
    });

    return res.status(200).json({
      code: "SUCCESS",
      message: "Lấy danh sách reviews cần duyệt thành công",
      data: {
        reviews: rows.map((review) => ({
          ...mapReviewWithRelations(review),
          admin_review_status: resolveReviewStatus(
            mapReviewWithRelations(review),
            columns,
          ),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy danh sách reviews",
      error: error.message,
    });
  }
};

/**
 * ✅ GET /admin/toxic-reviews/:reviewId
 * Chi tiết một review
 */
export const getToxicReviewDetail = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (!Number.isInteger(Number(reviewId)) || Number(reviewId) <= 0) {
      return next({
        statusCode: 400,
        code: ERROR_CODES.INVALID_REVIEW_ID || ERROR_CODES.VALIDATION_ERROR,
        message: "reviewId không hợp lệ",
      });
    }

    const columns = await getProductReviewColumns();
    const attributes = await getExistingProductReviewAttributes([
      "review_id",
      "product_id",
      "customer_id",
      "rating",
      "content",
      "sentiment",
      "sentiment_confidence",
      "is_toxic",
      "toxic_score",
      "toxic_categories",
      "toxic_types",
      "toxic_reason",
      "toxic_confidence",
      "admin_review_status",
      "admin_review_note",
      "reviewed_by",
      "needs_admin_review",
      "is_hidden",
      "hidden_reason",
      "created_at",
      "updated_at",
    ]);

    const review = await db.ProductReview.findByPk(reviewId, {
      attributes,
      include: [
        {
          model: db.Customer,
          attributes: ["customer_id", "name", "email", "phone"],
        },
        {
          model: db.Product,
          attributes: ["product_id", "product_name", "slug", "price"],
        },
      ],
    });

    if (!review) {
      return next({
        statusCode: 404,
        code: ERROR_CODES.REVIEW_NOT_FOUND,
        message: "Không tìm thấy review",
      });
    }

    return res.status(200).json({
      code: "SUCCESS",
      message: "Lấy chi tiết review thành công",
      data: {
        review: {
          ...mapReviewWithRelations(review),
          admin_review_status: resolveReviewStatus(
            mapReviewWithRelations(review),
            columns,
          ),
        },
      },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy chi tiết review",
      error: error.message,
    });
  }
};

/**
 * ✅ PATCH /admin/toxic-reviews/:reviewId/approve
 * Chấp nhận review (công khai)
 */
export const approveToxicReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { note } = req.body;
    const adminId = req.user?.userId ?? req.user?.id;

    const review = await db.ProductReview.findByPk(reviewId);

    if (!review) {
      return next({
        statusCode: 404,
        code: ERROR_CODES.REVIEW_NOT_FOUND,
        message: "Không tìm thấy review",
      });
    }

    if (review.admin_review_status !== "pending") {
      return next({
        statusCode: 400,
        code: ERROR_CODES.REVIEW_ALREADY_REVIEWED,
        message: `Review đã được duyệt (${review.admin_review_status})`,
      });
    }

    // Update review status
    review.admin_review_status = "approved";
    review.admin_review_note = note || null;
    review.reviewed_by = adminId;
    review.is_hidden = false; // Công khai review
    review.hidden_reason = null;
    review.needs_admin_review = false;
    review.updated_at = new Date();

    await review.save();

    return res.status(200).json({
      code: "SUCCESS",
      message: "Duyệt review thành công",
      data: { review },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi duyệt review",
      error: error.message,
    });
  }
};

/**
 * ✅ PATCH /admin/toxic-reviews/:reviewId/reject
 * Từ chối review (ẩn)
 */
export const rejectToxicReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { note } = req.body;
    const adminId = req.user?.userId ?? req.user?.id;

    const review = await db.ProductReview.findByPk(reviewId);

    if (!review) {
      return next({
        statusCode: 404,
        code: ERROR_CODES.REVIEW_NOT_FOUND,
        message: "Không tìm thấy review",
      });
    }

    if (review.admin_review_status !== "pending") {
      return next({
        statusCode: 400,
        code: ERROR_CODES.REVIEW_ALREADY_REVIEWED,
        message: `Review đã được duyệt (${review.admin_review_status})`,
      });
    }

    // Update review status
    review.admin_review_status = "rejected";
    review.admin_review_note = note || "Từ chối sau duyệt";
    review.reviewed_by = adminId;
    review.is_hidden = true; // Ẩn review
    review.hidden_reason = note || "ADMIN_REJECTED";
    review.needs_admin_review = false;
    review.updated_at = new Date();

    await review.save();

    return res.status(200).json({
      code: "SUCCESS",
      message: "Từ chối review thành công",
      data: { review },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi từ chối review",
      error: error.message,
    });
  }
};

/**
 * ✅ PATCH /admin/toxic-reviews/bulk-update
 * Duyệt/từ chối nhiều reviews
 */
export const bulkUpdateToxicReviews = async (req, res, next) => {
  try {
    const { review_ids, action, note } = req.body;
    const adminId = req.user?.userId ?? req.user?.id;

    if (!Array.isArray(review_ids) || review_ids.length === 0) {
      return next({
        statusCode: 400,
        code: ERROR_CODES.INVALID_REVIEW_IDS,
        message: "Phải cung cấp danh sách review_ids (mảng không rỗng)",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return next({
        statusCode: 400,
        code: ERROR_CODES.INVALID_ADMIN_STATUS,
        message: "Action phải là 'approve' hoặc 'reject'",
      });
    }

    // Fetch all reviews with pending status
    const reviews = await db.ProductReview.findAll({
      where: {
        review_id: { [Sequelize.Op.in]: review_ids },
        admin_review_status: "pending",
      },
    });

    if (reviews.length === 0) {
      return next({
        statusCode: 400,
        code: ERROR_CODES.NO_REVIEWS_TO_UPDATE,
        message: "Không có review nào cần duyệt",
      });
    }

    // Determine new status and hidden state
    const newStatus = action === "approve" ? "approved" : "rejected";
    const isHidden = action === "reject";

    // Update all reviews
    const updateData = {
      admin_review_status: newStatus,
      admin_review_note: note || (action === "reject" ? "Từ chối sau duyệt" : null),
      reviewed_by: adminId,
      is_hidden: isHidden,
      hidden_reason: isHidden ? (note || "ADMIN_REJECTED") : null,
      needs_admin_review: false,
      updated_at: new Date(),
    };

    await db.ProductReview.update(updateData, {
      where: {
        review_id: { [Sequelize.Op.in]: reviews.map((r) => r.review_id) },
      },
    });

    return res.status(200).json({
      code: "SUCCESS",
      message: `${action === "approve" ? "Duyệt" : "Từ chối"} ${reviews.length} review thành công`,
      data: {
        updated_count: reviews.length,
        action: newStatus,
      },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.BULK_ACTION_FAILED,
      message: "Lỗi xử lý bulk action",
      error: error.message,
    });
  }
};

/**
 * ✅ GET /admin/toxic-reviews/stats
 * Thống kê reviews toxic
 */
export const getToxicReviewStats = async (req, res, next) => {
  try {
    // Count by status
    const statusStats = await db.ProductReview.findAll({
      attributes: [
        "admin_review_status",
        [Sequelize.fn("COUNT", Sequelize.col("review_id")), "count"],
      ],
      where: {
        is_toxic: true,
      },
      group: ["admin_review_status"],
      raw: true,
    });

    // Count by toxic confidence thresholds
    const highConfidenceCount = await db.ProductReview.count({
      where: {
        is_toxic: true,
        toxic_confidence: { [Sequelize.Op.gte]: 0.8 },
      },
    });

    const mediumConfidenceCount = await db.ProductReview.count({
      where: {
        is_toxic: true,
        toxic_confidence: {
          [Sequelize.Op.gte]: 0.5,
          [Sequelize.Op.lt]: 0.8,
        },
      },
    });

    const lowConfidenceCount = await db.ProductReview.count({
      where: {
        is_toxic: true,
        toxic_confidence: { [Sequelize.Op.lt]: 0.5 },
      },
    });

    // Total toxic reviews
    const totalToxicReviews = await db.ProductReview.count({
      where: { is_toxic: true },
    });

    // Pending reviews
    const pendingReviews = await db.ProductReview.count({
      where: {
        is_toxic: true,
        admin_review_status: "pending",
      },
    });

    // Approved reviews
    const approvedReviews = await db.ProductReview.count({
      where: {
        is_toxic: true,
        admin_review_status: "approved",
      },
    });

    // Rejected reviews
    const rejectedReviews = await db.ProductReview.count({
      where: {
        is_toxic: true,
        admin_review_status: "rejected",
      },
    });

    return res.status(200).json({
      code: "SUCCESS",
      message: "Lấy thống kê toxic reviews thành công",
      data: {
        total: totalToxicReviews,
        by_status: {
          pending: pendingReviews,
          approved: approvedReviews,
          rejected: rejectedReviews,
        },
        by_confidence: {
          high: highConfidenceCount, // >= 0.8
          medium: mediumConfidenceCount, // 0.5 - 0.8
          low: lowConfidenceCount, // < 0.5
        },
      },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy thống kê toxic reviews",
      error: error.message,
    });
  }
};

/**
 * ✅ GET /admin/toxic-reviews/highest-score
 * Reviews theo điểm toxic cao nhất (phân trang)
 */
export const getHighestScoringToxicReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await db.ProductReview.findAndCountAll({
      where: {
        is_toxic: true,
      },
      attributes: [
        "review_id",
        "product_id",
        "customer_id",
        "rating",
        "content",
        "sentiment",
        "toxic_score",
        "toxic_categories",
        "toxic_types",
        "toxic_reason",
        "toxic_confidence",
        "admin_review_status",
        "created_at",
      ],
      include: [
        {
          model: db.Customer,
          attributes: ["customer_id", "name", "email"],
        },
        {
          model: db.Product,
          attributes: ["product_id", "product_name", "slug"],
        },
      ],
      order: [["toxic_score", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return res.status(200).json({
      code: "SUCCESS",
      message: "Lấy danh sách toxic reviews có điểm cao nhất thành công",
      data: {
        reviews: rows.map(mapReviewWithRelations),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lỗi lấy toxic reviews theo điểm cao nhất",
      error: error.message,
    });
  }
};
