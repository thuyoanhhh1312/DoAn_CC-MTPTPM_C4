import express from "express";
import {
  getAllPromotionLogs,
  sendPromotionManually,
  deletePromotionLogs,
} from "../controllers/promotionLogController.js";
import { isAdmin, isAdminOrStaff } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAdminOrStaff, getAllPromotionLogs);
router.post("/send", isAdminOrStaff, sendPromotionManually);
router.delete("/", isAdmin, deletePromotionLogs);

export default router;
