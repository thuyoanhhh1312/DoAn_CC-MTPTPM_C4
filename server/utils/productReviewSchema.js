import db from "../models/index.js";

let productReviewColumnsCache = null;

const normalizeColumns = (description = {}) => new Set(Object.keys(description));

export const getProductReviewColumns = async () => {
  if (productReviewColumnsCache) {
    return productReviewColumnsCache;
  }

  const description = await db.sequelize
    .getQueryInterface()
    .describeTable("product_review");

  productReviewColumnsCache = normalizeColumns(description);
  return productReviewColumnsCache;
};

export const getExistingProductReviewAttributes = async (attributes = []) => {
  const columns = await getProductReviewColumns();
  return attributes.filter((attribute) => columns.has(attribute));
};

export const pickExistingProductReviewFields = async (payload = {}) => {
  const columns = await getProductReviewColumns();
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => columns.has(key)),
  );
};
