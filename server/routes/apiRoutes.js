import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as authController from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/auth/register", validateRequest(registerSchema), authController.register);
router.post("/auth/login", validateRequest(loginSchema), authController.login);

export default router;
