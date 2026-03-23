export const extractUserRoles = (user) => {
  if (!user) {
    return [];
  }

  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (Array.isArray(user.role)) {
    return user.role;
  }

  if (typeof user.role === 'string' && user.role.trim()) {
    return [user.role];
  }

  return [];
};
