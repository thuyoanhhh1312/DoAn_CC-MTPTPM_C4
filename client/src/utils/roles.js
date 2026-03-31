export const extractUserRoles = (user) => {
  if (!user) {
    return [];
  }

  const roleMap = {
    1: "admin",
    2: "customer",
    3: "staff",
  };

  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (Array.isArray(user.role)) {
    return user.role;
  }

  if (typeof user.role === "string" && user.role.trim()) {
    return [user.role];
  }

  if (typeof user.role_id === "number" && roleMap[user.role_id]) {
    return [roleMap[user.role_id]];
  }

  if (typeof user.roleId === "number" && roleMap[user.roleId]) {
    return [roleMap[user.roleId]];
  }

  if (typeof user.role_id === "string" && roleMap[Number(user.role_id)]) {
    return [roleMap[Number(user.role_id)]];
  }

  if (typeof user.roleId === "string" && roleMap[Number(user.roleId)]) {
    return [roleMap[Number(user.roleId)]];
  }

  return [];
};
