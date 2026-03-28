import { ERROR_CODES } from "../utils/errorCodes.js";
import { APP_CONSTANTS } from "../config/constants.js";

/**
 * Check if user has required role(s)
 * @param {number|number[]} allowedRoleIds - Single role ID or array of role IDs
 * @returns {Function} Express middleware
 */
export const checkRole = (allowedRoleIds = []) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user) {
      return next({
        statusCode: 401,
        code: ERROR_CODES.TOKEN_INVALID,
        message: "User not authenticated",
      });
    }

    const roleIds = Array.isArray(allowedRoleIds) ? allowedRoleIds : [allowedRoleIds];

    if (!roleIds.includes(user.role_id)) {
      return next({
        statusCode: 403,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Insufficient permissions to access this resource",
      });
    }

    next();
  };
};

/**
 * Check if user is admin or staff
 * Usage: router.get('/path', authenticateToken, requireAdminOrStaff, handler)
 */
export const requireAdminOrStaff = (req, res, next) => {
  const { user } = req;

  if (!user) {
    return next({
      statusCode: 401,
      code: ERROR_CODES.TOKEN_INVALID,
      message: "User not authenticated",
    });
  }

  if (
    user.role_id !== APP_CONSTANTS.ROLE_ADMIN_ID &&
    user.role_id !== APP_CONSTANTS.ROLE_STAFF_ID
  ) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Only admin or staff can access this resource",
    });
  }

  next();
};

/**
 * Check if user is admin only
 * Usage: router.get('/path', authenticateToken, requireAdmin, handler)
 */
export const requireAdmin = (req, res, next) => {
  const { user } = req;

  if (!user) {
    return next({
      statusCode: 401,
      code: ERROR_CODES.TOKEN_INVALID,
      message: "User not authenticated",
    });
  }

  if (user.role_id !== APP_CONSTANTS.ROLE_ADMIN_ID) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Only admin can access this resource",
    });
  }

  next();
};
