import express from "express";
import { authenticateToken, isAdmin } from "../middlewares/auth.js";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

// ❌ Chỉ Admin được xem/tạo/sửa/xóa campaign
router.get("/", authenticateToken, isAdmin, getAllCampaigns);
router.get("/:id", authenticateToken, isAdmin, getCampaignById);

router.post("/", authenticateToken, isAdmin, createCampaign);
router.put("/:id", authenticateToken, isAdmin, updateCampaign);
router.delete("/:id", authenticateToken, isAdmin, deleteCampaign);

export default router;
