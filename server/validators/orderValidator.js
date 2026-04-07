import Joi from "joi";

export const calculatePriceSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
  promotion_code: Joi.string().trim().allow("", null).optional(),
  user_id: Joi.number().integer().positive().required(),
});

const orderItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  price: Joi.number().positive().precision(2).required(),
});

export const checkoutSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().allow(null),
  promotion_code: Joi.string().trim().optional().allow("", null),
  payment_method: Joi.string().max(50).optional().allow("", null),
  shipping_address: Joi.string().max(255).optional().allow("", null),
  is_deposit: Joi.boolean().optional().default(false),
  deposit_status: Joi.string()
    .valid("pending", "paid", "none")
    .optional()
    .default("none"),
  items: Joi.array().items(orderItemSchema).min(1).required(),
});

export const updateDepositSchema = Joi.object({
  is_deposit: Joi.boolean().optional(),
  deposit_status: Joi.string().valid("pending", "paid", "none").optional(),
  transaction_id: Joi.string().max(128).optional().allow("", null),
  payment_details: Joi.object().optional(),
})
  .or("is_deposit", "deposit_status", "transaction_id", "payment_details");
