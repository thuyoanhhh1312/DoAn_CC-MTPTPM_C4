import Joi from "joi";

export const createPromotionSchema = Joi.object({
  promotion_code: Joi.string().trim().required().messages({
    "string.empty": "Mã khuyến mãi không được để trống",
    "any.required": "Mã khuyến mãi là bắt buộc",
  }),
  campaign_id: Joi.number().integer().allow(null).messages({
    "number.base": "ID campaign phải là số",
  }),
  segment_target: Joi.string()
    .valid("birthday", "vip", "gold", "silver", "bronze", null)
    .allow(null)
    .messages({
      "any.only": "Segment target phải là một trong: birthday, vip, gold, silver, bronze, hoặc null",
    }),
  discount: Joi.number().min(0).max(100).required().messages({
    "number.base": "Discount phải là số",
    "number.min": "Discount phải >= 0",
    "number.max": "Discount phải <= 100",
    "any.required": "Discount là bắt buộc",
  }),
  description: Joi.string().trim().allow(null).messages({
    "string.base": "Description phải là chuỗi",
  }),
  usage_limit: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Usage limit phải là số",
    "number.min": "Usage limit phải >= 1",
  }),
});

export const updatePromotionSchema = Joi.object({
  promotion_code: Joi.string().trim().messages({
    "string.empty": "Mã khuyến mãi không được để trống",
  }),
  campaign_id: Joi.number().integer().allow(null).messages({
    "number.base": "ID campaign phải là số",
  }),
  segment_target: Joi.string()
    .valid("birthday", "vip", "gold", "silver", "bronze", null)
    .allow(null)
    .messages({
      "any.only": "Segment target phải là một trong: birthday, vip, gold, silver, bronze, hoặc null",
    }),
  discount: Joi.number().min(0).max(100).messages({
    "number.base": "Discount phải là số",
    "number.min": "Discount phải >= 0",
    "number.max": "Discount phải <= 100",
  }),
  description: Joi.string().trim().allow(null).messages({
    "string.base": "Description phải là chuỗi",
  }),
  usage_limit: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Usage limit phải là số",
    "number.min": "Usage limit phải >= 1",
  }),
}).min(1);

export const getPromotionByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID phải là số",
    "any.required": "ID là bắt buộc",
  }),
});

export const getAllPromotionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  search: Joi.string().allow("", null),
  segment_target: Joi.string().allow(null),
  campaign_id: Joi.number().integer().allow(null),
  sort: Joi.string().default("-created_at"),
}).unknown(true);
