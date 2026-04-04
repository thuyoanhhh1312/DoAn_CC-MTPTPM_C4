// routes/apiRoutes.js
import express from "express";
import {
  getSimilarProducts,
  filterProducts,
} from "../controllers/productController.js";
import upload from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as articleController from "../controllers/articleController.js";
import * as articleCategoryController from "../controllers/articleCategoryController.js";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../validators/articleValidator.js";

const router = express.Router();

// Middleware
import {
  isAdmin,
  authenticateToken,
  isAdminOrStaff,
} from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";
import * as customerController from "../controllers/customerController.js";
import * as productController from "../controllers/productController.js";
import * as searchController from "../controllers/searchController.js";

import * as categoryController from "../controllers/categoryController.js";
import * as subCategoryController from "../controllers/subCategoryController.js";
import * as productReviewController from "../controllers/productReviewController.js";
import campaignRoutes from "./campaignRoutes.js";
import * as dashboardController from "../controllers/dashboardController.js";

import * as tagController from "../controllers/tagController.js";
router.get("/tags", tagController.getAllTags);

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
  customerController.updateCustomerProfile,
);

// Product routes
router.get("/products", productController.getAllProducts);
router.get(
  "/products/with-review-summary",
  productController.getAllProductsWithRatingSummary,
);
router.get(
  "/product-by-category",
  productController.getProductsByCategoryWithRatingSummary,
);
router.get("/products/similar", getSimilarProducts);
router.get("/products/filter", filterProducts);
router.get("/products/:id", productController.getProductById);
router.get("/get-product-by-slug/:slug", productController.getProductBySlug);
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
router.get(
  "/get-category-subcategory",
  productController.getCategoryesWithSubCategory,
);
router.get(
  "/get-product-top-rated-by-sentiment",
  productController.getTopRatedProductsBySentiment,
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
router.get("/customers/by-user/:userId", customerController.getCustomer);

router.get("/auth/current-user", authenticateToken, authController.currentUser);
router.get("/auth/me", authenticateToken, authController.currentUser);
router.post("/auth/send-otp", authController.sendOtp);
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
// Campaign routes
router.use("/campaigns", campaignRoutes);
export default router;
