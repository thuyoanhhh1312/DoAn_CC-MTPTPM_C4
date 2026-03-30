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

// Auth routes
router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);
router.post("/auth/refresh-token", authController.refreshToken);
router.post("/auth/logout", authenticateToken, authController.logoutUser);
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
router.get("/customers/by-user/:userId", customerController.getCustomer);

router.get("/auth/current-user", authenticateToken, authController.currentUser);
router.post("/auth/send-otp", authController.sendOtp);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/reset-password", authController.resetPassword);

export default router;
