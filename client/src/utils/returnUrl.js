export const buildReturnUrl = (location) => `${location.pathname}${location.search}${location.hash}`;

export const resolveReturnUrl = (value) => {
  if (!value) {
    return '/';
  }

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('/') && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    return '/';
  }

  return '/';
};
