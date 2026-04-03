// routes/apiRoutes.js
import express from "express";

const router = express.Router();

// Middleware
import {
  isAdmin,
  authenticateToken,
  isAdminOrStaff,
} from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";
import * as customerController from "../controllers/customerController.js";
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
