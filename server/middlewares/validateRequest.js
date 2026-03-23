import { ERROR_CODES } from "../utils/errorCodes.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  };
};
