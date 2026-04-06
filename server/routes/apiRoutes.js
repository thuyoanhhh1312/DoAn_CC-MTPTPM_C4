// routes/apiRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import upload from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authenticateToken, isAdmin, isAdminOrStaff } from "../middlewares/auth.js";

// Controllers
import * as authController from "../controllers/authController.js";
import * as customerController from "../controllers/customerController.js";
import * as productController from "../controllers/productController.js";
import * as orderController from "../controllers/orderController.js";
import * as searchController from "../controllers/searchController.js";
import * as categoryController from "../controllers/categoryController.js";
import * as subCategoryController from "../controllers/subCategoryController.js";
import * as productReviewController from "../controllers/productReviewController.js";
import * as toxicReviewController from "../controllers/toxicReviewController.js";
import * as articleController from "../controllers/articleController.js";
import * as articleCategoryController from "../controllers/articleCategoryController.js";
import * as dashboardController from "../controllers/dashboardController.js";
import * as tagController from "../controllers/tagController.js";
import * as promotionController from "../controllers/promotionController.js";

// Route imports
import campaignRoutes from "./campaignRoutes.js";
import promotionLogRoutes from "./promotionLogRoutes.js";

// Validators
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidator.js";
import { createArticleSchema, updateArticleSchema } from "../validators/articleValidator.js";
import { calculatePriceSchema, checkoutSchema, updateDepositSchema } from "../validators/orderValidator.js";
import {
  labelSentimentSchema,
  bulkLabelSentimentSchema,
  bulkUpdateToxicReviewSchema,
  approveToxicReviewSchema,
  rejectToxicReviewSchema,
  getToxicReviewsSchema,
} from "../validators/reviewValidator.js";
import {
  createPromotionSchema,
  updatePromotionSchema,
  getPromotionByIdSchema,
  getAllPromotionsSchema,
} from "../validators/promotionValidator.js";

// Product controller functions
const { getSimilarProducts, filterProducts, getProductsByCategory, getSimilarProductsWithPagination } = productController;

const router = express.Router();
router.get("/tags", tagController.getAllTags);

const blogUploadDir = path.join(process.cwd(), "uploads", "blog");
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

const blogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, blogUploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
});

// CKEditor image upload endpoint (used by RichTextEditor upload adapter)
router.post(
  "/uploads/blog-image",
  blogImageUpload.single("upload"),
  (req, res) => {
    if (!req.file?.filename) {
      return res.status(400).json({ message: "Upload thất bại" });
    }

    const publicUrl = `${req.protocol}://${req.get("host")}/uploads/blog/${req.file.filename}`;
    return res.json({ url: publicUrl });
  },
);

// Auth routes
router.post("/auth/register", authController.registerUser);
router.post("/auth/signup", authController.registerUser);
router.post("/auth/login", authController.loginUser);
router.post("/auth/signin", authController.loginUser);
router.post("/auth/refresh-token", authController.refreshToken);
router.post("/auth/refresh", authController.refreshToken);
router.post("/auth/logout", authenticateToken, authController.logoutUser);
router.post("/auth/signout", authenticateToken, authController.logoutUser);
router.get(
  "/auth/current-admin",
  authenticateToken,
  isAdmin,
  authController.currentAdmin,
);
router.get(
  "/auth/current-admin-or-staff",
  authenticateToken,
  isAdminOrStaff,
  authController.currentStaffOrAdmin,
);

// Customer routes
router.get("/customers", customerController.getAllCustomers);
router.get(
  "/customers/emails",
  authenticateToken,
  isAdminOrStaff,
  customerController.getCustomerEmails,
);
router.get("/customers/:id", customerController.getCustomerById);
router.delete(
  "/customers/:id",
  authenticateToken,
  isAdminOrStaff,
  customerController.deleteCustomer,
);
router.put(
  "/customers/profile",
  authenticateToken,
  validateRequest(updateProfileSchema),
  authController.updateProfile,
);
router.get("/customers/by-user/:userId", customerController.getCustomer);

// Product routes
router.get("/products", productController.getAllProducts);
router.get("/products/with-review-summary", productController.getAllProductsWithRatingSummary);
router.get("/products/filter", filterProducts);
router.get("/products/similar", getSimilarProductsWithPagination);
router.get("/product-by-category", getProductsByCategory);
router.get("/get-product-by-slug/:slug", productController.getProductBySlug);
router.get("/get-product-top-rated-by-sentiment", productController.getTopRatedProductsBySentiment);
router.get("/get-category-subcategory", productController.getCategoryesWithSubCategory);
router.get("/products/:id", productController.getProductById);

// Product image upload (Admin/Staff only) - Upload multiple images
router.post(
  "/uploads/product-images",
  authenticateToken,
  isAdminOrStaff,
  upload.array("images", 10),
  productController.uploadProductImages,
);

// ✅ Staff & Admin tạo/sửa product
router.post(
  "/products",
  authenticateToken,
  isAdminOrStaff,
  upload.array("images", 5),
  productController.createProduct,
);
router.put(
  "/products/:id",
  authenticateToken,
  isAdminOrStaff,
  upload.array("images", 5),
  productController.updateProduct,
);
// ❌ Chỉ Admin xóa product
router.delete(
  "/products/:id",
  authenticateToken,
  isAdmin,
  productController.deleteProduct,
);

// Category routes
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
// ❌ Chỉ Admin được CRUD category
router.post(
  "/categories",
  authenticateToken,
  isAdmin,
  categoryController.createCategory,
);
router.put(
  "/categories/:id",
  authenticateToken,
  isAdmin,
  categoryController.updateCategory,
);
router.patch(
  "/categories/:id/open-selling",
  authenticateToken,
  isAdmin,
  categoryController.openCategorySelling,
);
router.delete(
  "/categories/:id",
  authenticateToken,
  isAdmin,
  categoryController.deleteCategory,
);

router.get("/auth/current-user", authenticateToken, authController.currentUser);
router.get("/auth/send-otp", authController.sendOtp);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/reset-password", authController.resetPassword);

// SubCategory routes
router.get("/subcategories", subCategoryController.getAllSubCategories);
router.get("/subcategories/:id", subCategoryController.getSubCategoryById);
// ❌ Chỉ Admin được CRUD subcategory
router.post(
  "/subcategories",
  authenticateToken,
  isAdmin,
  subCategoryController.createSubCategory,
);
router.put(
  "/subcategories/:id",
  authenticateToken,
  isAdmin,
  subCategoryController.updateSubCategory,
);
router.delete(
  "/subcategories/:id",
  authenticateToken,
  isAdmin,
  subCategoryController.deleteSubCategory,
);
router.get("/search-product", searchController.searchProducts);
router.get("/quick-search-products", searchController.quickSearchProducts);
router.get(
  "/orders",
  authenticateToken,
  isAdmin,
  orderController.getAllOrders,
);
router.get(
  "/orders/by-customer/:user_id",
  authenticateToken,
  orderController.getOrderByCustomer,
);
router.get(
  "/orders/by-user/:user_id",
  authenticateToken,
  isAdminOrStaff,
  orderController.getOrderByUserId,
);
router.get(
  "/orders/:id",
  authenticateToken,
  orderController.getOrderById,
);
router.put(
  "/orders/:id",
  authenticateToken,
  isAdminOrStaff,
  orderController.updatedOrder,
);
router.patch(
  "/orders/:id/deposit",
  authenticateToken,
  isAdminOrStaff,
  validateRequest(updateDepositSchema),
  orderController.updateIsDeposit,
);
router.post(
  "/calculate-price",
  authenticateToken,
  validateRequest(calculatePriceSchema),
  orderController.calculatePrice,
);
router.post(
  "/checkout",
  authenticateToken,
  validateRequest(checkoutSchema),
  orderController.checkout,
);

// Product Review
router.get(
  "/products/:id/reviews",
  productReviewController.getReviewsByProductId,
);
router.get(
  "/products/:id/reviews/summary",
  productReviewController.getReviewSummary,
);
router.get(
  "/products/:id/reviews/summary-detailed",
  productReviewController.getReviewSummaryWithSuspicious,
);

// PUBLIC: Only rating distribution (cho khách hàng)
router.get(
  "/products/:id/reviews/summary-public",
  productReviewController.getReviewSummaryPublic,
);

// ADMIN: Full sentiment + rating + suspicious (cho quản lý)
router.get(
  "/admin/products/:id/reviews/summary",
  authenticateToken,
  isAdmin,
  productReviewController.getReviewSummaryPublicDetailed,
);

// ADMIN: Lấy tất cả reviews từ tất cả sản phẩm (cho admin dashboard)
router.get(
  "/admin/reviews",
  authenticateToken,
  isAdminOrStaff,
  productReviewController.getAllReviewsAdmin,
);

// ADMIN: Thống kê cảm xúc theo sản phẩm
router.get(
  "/admin/reviews/sentiment-stats",
  authenticateToken,
  isAdminOrStaff,
  productReviewController.getSentimentStatsByProduct,
);

// ADMIN: Lấy reviews bất thường
router.get(
  "/admin/reviews/suspicious",
  authenticateToken,
  isAdminOrStaff,
  productReviewController.getSuspiciousReviews,
);

router.post(
  "/products/:id/reviews",
  authenticateToken,
  productReviewController.createReview,
);

// ✅ ADMIN: Toxic Review Management
router.get(
  "/admin/toxic-reviews",
  authenticateToken,
  isAdmin,
  validateRequest(getToxicReviewsSchema),
  toxicReviewController.getToxicReviews,
);

router.get(
  "/admin/toxic-reviews/stats",
  authenticateToken,
  isAdmin,
  toxicReviewController.getToxicReviewStats,
);

router.get(
  "/admin/toxic-reviews/highest-score",
  authenticateToken,
  isAdmin,
  toxicReviewController.getHighestScoringToxicReviews,
);

router.get(
  "/admin/toxic-reviews/:reviewId",
  authenticateToken,
  isAdmin,
  toxicReviewController.getToxicReviewDetail,
);

router.patch(
  "/admin/toxic-reviews/:reviewId/approve",
  authenticateToken,
  isAdmin,
  validateRequest(approveToxicReviewSchema),
  toxicReviewController.approveToxicReview,
);

router.patch(
  "/admin/toxic-reviews/:reviewId/reject",
  authenticateToken,
  isAdmin,
  validateRequest(rejectToxicReviewSchema),
  toxicReviewController.rejectToxicReview,
);

router.patch(
  "/admin/toxic-reviews/bulk-update",
  authenticateToken,
  isAdmin,
  validateRequest(bulkUpdateToxicReviewSchema),
  toxicReviewController.bulkUpdateToxicReviews,
);

// ✅ ADMIN/STAFF: Sentiment Labeling
router.patch(
  "/admin/reviews/:reviewId/label-sentiment",
  authenticateToken,
  isAdminOrStaff,
  validateRequest(labelSentimentSchema),
  productReviewController.adminLabelSentiment,
);

router.patch(
  "/admin/reviews/bulk-label-sentiment",
  authenticateToken,
  isAdminOrStaff,
  validateRequest(bulkLabelSentimentSchema),
  productReviewController.bulkLabelSentiment,
);

// Public
router.get("/news", articleController.getNews);
router.get("/news/:slug", articleController.getNewsBySlug);

// Article categories
router.get("/news-categories", articleCategoryController.getAll);
router.get("/news-categories/:id", articleCategoryController.getById);
router.post(
  "/admin/news-categories",
  authenticateToken,
  isAdminOrStaff,
  articleCategoryController.create,
);
router.get(
  "/admin/news-categories/:id",
  authenticateToken,
  isAdminOrStaff,
  articleCategoryController.getById,
);
router.put(
  "/admin/news-categories/:id",
  authenticateToken,
  isAdminOrStaff,
  articleCategoryController.update,
);
router.delete(
  "/admin/news-categories/:id",
  authenticateToken,
  isAdminOrStaff,
  articleCategoryController.destroy,
);

// Admin/Staff - GET tất cả bài (không filter status)
router.get(
  "/admin/news",
  authenticateToken,
  isAdminOrStaff,
  async (req, res, next) => {
    // Gọi getNews nhưng với status = null để lấy tất cả
    req.query.status = null;
    articleController.getNews(req, res, next);
  },
);

// Admin/Staff - GET single bài by ID (for edit page)
router.get(
  "/admin/news/:id",
  authenticateToken,
  isAdminOrStaff,
  articleController.getNewsById,
);

// Admin/Staff - POST tạo bài
router.post(
  "/admin/news",
  authenticateToken,
  isAdminOrStaff,
  upload.single("thumbnail"), // bật nếu có upload ảnh
  validateRequest(createArticleSchema),
  articleController.createNews,
);

router.put(
  "/admin/news/:id",
  authenticateToken,
  isAdminOrStaff,
  upload.single("thumbnail"),
  validateRequest(updateArticleSchema),
  articleController.updateNews,
);

router.delete(
  "/admin/news/:id",
  authenticateToken,
  isAdminOrStaff,
  articleController.deleteNews,
);
//Dashboard routes
router.get(
  "/dashboard/revenue",
  authenticateToken,
  isAdmin,
  dashboardController.getRevenueByPeriod,
);
router.get(
  "/dashboard/orders/count",
  authenticateToken,
  isAdmin,
  dashboardController.getOrderCountByPeriod,
);

// ============ PROMOTION ROUTES ============
// GET all promotions with pagination & filters
router.get(
  "/promotions",
  promotionController.getAllPromotions
);

// GET promotions for current customer (public) - Must come BEFORE /:id
router.get(
  "/promotions/customer",
  authenticateToken,
  promotionController.getCustomerPromotions
);

// GET promotion by ID
router.get(
  "/promotions/:id",
  promotionController.getPromotionById
);

// POST create promotion (admin only)
router.post(
  "/promotions",
  authenticateToken,
  isAdmin,
  validateRequest(createPromotionSchema),
  promotionController.createPromotion
);

// PUT update promotion (admin only)
router.put(
  "/promotions/:id",
  authenticateToken,
  isAdmin,
  validateRequest(updatePromotionSchema),
  promotionController.updatePromotion
);

// DELETE promotion (admin only)
router.delete(
  "/promotions/:id",
  authenticateToken,
  isAdmin,
  promotionController.deletePromotion
);

// Campaign routes
router.use("/campaigns", campaignRoutes);
router.use("/promotion-logs", authenticateToken, promotionLogRoutes);
export default router;
