import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  name: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().max(50).allow("", null).optional(),
  gender: Joi.string().max(10).allow("", null).optional(),
  address: Joi.string().max(255).allow("", null).optional(),
  birthday: Joi.date().iso().allow(null).optional(),
  password: Joi.string().min(6).optional(),
}).or("fullName", "name", "phone", "gender", "address", "birthday", "password");
