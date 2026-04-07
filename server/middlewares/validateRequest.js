import { ERROR_CODES } from "../utils/errorCodes.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const payload = req[source] ?? {};

    const { error, value } = schema.validate(payload, {
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

    if (source === "body") {
      req.body = value;
    } else {
      Object.keys(req[source] ?? {}).forEach((key) => {
        delete req[source][key];
      });
      Object.assign(req[source], value);
    }
    next();
  };
};
