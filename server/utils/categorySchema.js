import db from "../models/index.js";

let categoryColumnsCache = null;

export const getCategoryColumns = async () => {
  if (categoryColumnsCache) {
    return categoryColumnsCache;
  }

  const description = await db.sequelize
    .getQueryInterface()
    .describeTable("category");

  categoryColumnsCache = new Set(Object.keys(description));
  return categoryColumnsCache;
};

export const getExistingCategoryAttributes = async (attributes = []) => {
  const columns = await getCategoryColumns();
  return attributes.filter((attribute) => columns.has(attribute));
};

export const pickExistingCategoryFields = async (payload = {}) => {
  const columns = await getCategoryColumns();
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => columns.has(key)),
  );
};
