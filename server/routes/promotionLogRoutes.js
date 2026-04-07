import express from "express";
import {
  getAllPromotionLogs,
  sendPromotionManually,
  deletePromotionLogs,
} from "../controllers/promotionLogController.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAdmin, getAllPromotionLogs);
router.post("/send", isAdmin, sendPromotionManually);
router.delete("/", isAdmin, deletePromotionLogs);

export default router;
