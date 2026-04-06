import db from "../models/index.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

export const ROLE_IDS = {
  ADMIN: 1,
  CUSTOMER: 2,
  STAFF: 3,
};

const normalizeRoleName = (roleName) =>
  typeof roleName === "string" ? roleName.trim().toLowerCase() : null;

const buildUnauthorizedError = (message) => ({
  statusCode: 403,
  code: ERROR_CODES.UNAUTHORIZED,
  message,
});

export const authorizeRoles = (allowedRoles = [], options = {}) => {
  const normalizedAllowed = allowedRoles.reduce(
    (accumulator, role) => {
      if (typeof role === "number") {
        accumulator.ids.add(role);
      }

      const normalizedRoleName = normalizeRoleName(role);
      if (normalizedRoleName) {
        accumulator.names.add(normalizedRoleName);
      }

      return accumulator;
    },
    { ids: new Set(), names: new Set() },
  );

  const unauthorizedMessage =
    options.message || "Ban khong co quyen truy cap tai nguyen nay.";

  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return next(buildUnauthorizedError(unauthorizedMessage));
      }

      let roleId = req.user.role_id;
      let roleName = req.user.role_name;

      if (!roleId || !roleName) {
        const currentUser = await db.User.findByPk(req.user.userId, {
          attributes: ["id", "role_id"],
          include: [
            {
              model: db.Role,
              attributes: ["id", "name"],
            },
          ],
        });

        if (!currentUser) {
          return next({
            statusCode: 404,
            code: ERROR_CODES.USER_NOT_FOUND,
            message: "Nguoi dung khong ton tai.",
          });
        }

        roleId = currentUser.role_id;
        roleName = currentUser.Role?.name || null;
        req.user.role_id = roleId;
        req.user.role_name = roleName;
      }

      const hasRoleId = normalizedAllowed.ids.has(roleId);
      const hasRoleName = normalizedAllowed.names.has(
        normalizeRoleName(roleName),
      );

      if (!hasRoleId && !hasRoleName) {
        return next(buildUnauthorizedError(unauthorizedMessage));
      }

      return next();
    } catch (error) {
      return next({
        statusCode: 500,
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: "Khong the xac thuc quyen truy cap.",
        error: error.message,
      });
    }
  };
};

export const authorizeAnyRole = (...allowedRoles) =>
  authorizeRoles(allowedRoles);
