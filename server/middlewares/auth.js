import jwt from "jsonwebtoken";
import { ERROR_CODES } from "../utils/errorCodes.js";
import db from "../models/index.js";

const SUSPENDED_TOKEN_MARKER = "__ACCOUNT_SUSPENDED__";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return next({
      statusCode: 401,
      code: ERROR_CODES.TOKEN_INVALID,
      message: "Token không hợp lệ hoặc thiếu.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await db.User.findByPk(payload.userId, {
      attributes: ["id", "refresh_token"],
    });

    if (!user) {
      return next({
        statusCode: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
        message: "Người dùng không tồn tại.",
      });
    }

    if (user.refresh_token === SUSPENDED_TOKEN_MARKER) {
      return next({
        statusCode: 403,
        code: ERROR_CODES.ACCOUNT_SUSPENDED,
        message: "Tài khoản đã bị dừng hoạt động.",
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.TOKEN_EXPIRED,
      message: "Token đã hết hạn hoặc không hợp lệ.",
    });
  }
};

export const isAdmin = (req, res, next) => {
  const { user } = req;

  if (!user || user.role_id !== 1) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Bạn không có quyền truy cập (yêu cầu admin).",
    });
  }

  next();
};

export const isAdminOrStaff = (req, res, next) => {
  const { user } = req;
  if (!user || (user.role_id !== 1 && user.role_id !== 3)) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Bạn không có quyền truy cập (yêu cầu admin hoặc staff).",
    });
  }
  next();
};

// ✅ Staff Role (role_id = 3)
export const isStaff = (req, res, next) => {
  const { user } = req;
  if (!user || user.role_id !== 3) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Bạn không có quyền truy cập (yêu cầu staff).",
    });
  }
  next();
};
