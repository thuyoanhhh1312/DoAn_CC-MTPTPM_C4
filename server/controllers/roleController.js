import db from "../models/index.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await db.Role.findAll({
      attributes: ["id", "name", "description"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      ok: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Khong the lay danh sach vai tro.",
      error: error.message,
    });
  }
};
