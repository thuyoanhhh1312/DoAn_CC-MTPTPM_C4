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
