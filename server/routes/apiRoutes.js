import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/auth/signup", validateRequest(registerSchema), authController.register);
router.post("/auth/signin", validateRequest(loginSchema), authController.login);
router.get("/auth/me", authenticateToken, authController.me);
router.post("/auth/refresh", authenticateToken, authController.refresh);
router.post("/auth/signout", authenticateToken, authController.signout);
router.put("/customers/profile", authenticateToken, validateRequest(updateProfileSchema), authController.updateProfile);

export default router;
