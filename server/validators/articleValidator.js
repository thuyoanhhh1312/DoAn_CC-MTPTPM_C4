// server/validators/articleValidator.js
import Joi from "joi";

export const createArticleSchema = Joi.object({
  article_category_id: Joi.number().integer().required(),
  title: Joi.string().max(255).required(),
  slug: Joi.string().max(300).allow("", null),
  excerpt: Joi.string().allow("", null),
  content: Joi.string().required(),
  thumbnail_url: Joi.string().allow("", null), // cho phép base64 hoặc URL
  thumbnail: Joi.any().allow(null), // file upload
  status: Joi.string().valid("draft", "published", "archived").default("draft"),
  published_at: Joi.alternatives().try(
    Joi.date(),
    Joi.string().allow(""),
    Joi.allow(null),
  ),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string().allow("", null))
    .default([]),
  "tags[]": Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow("", null),
  ),
}).unknown(true); // cho phép các field khác

export const updateArticleSchema = createArticleSchema.fork(
  ["article_category_id", "title", "slug", "content"],
  (s) => s.optional(),
);
