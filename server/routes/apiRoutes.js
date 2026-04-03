// routes/apiRoutes.js
import express from "express";
import {
  getSimilarProducts,
  filterProducts,
} from "../controllers/productController.js";
import upload from "../middlewares/upload.js";

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

import * as categoryController from "../controllers/categoryController.js";
import * as subCategoryController from "../controllers/subCategoryController.js";

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

export default router;
