export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  STAFF: 'staff',
};

const configuredRoles = (import.meta.env.VITE_ADMIN_ALLOWED_ROLES || '')
  .split(',')
  .map((role) => role.trim())
  .filter(Boolean);

export const ADMIN_ALLOWED_ROLES = configuredRoles.length
  ? configuredRoles
  : [ROLES.ADMIN, ROLES.STAFF];
