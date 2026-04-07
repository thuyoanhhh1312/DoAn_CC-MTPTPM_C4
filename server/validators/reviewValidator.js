import Joi from "joi";

// ✅ Validate sentiment label (POS, NEG, NEU, UNC)
export const labelSentimentSchema = Joi.object({
  sentiment: Joi.string()
    .valid("POS", "NEG", "NEU", "UNC")
    .required()
    .messages({
      "string.only": "Sentiment phải là POS, NEG, NEU, hoặc UNC",
      "any.required": "Sentiment là bắt buộc",
    }),
});

// ✅ Validate bulk label sentiment (gán sentiment cho nhiều reviews)
export const bulkLabelSentimentSchema = Joi.object({
  review_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .min(1)
    .messages({
      "array.base": "review_ids phải là mảng",
      "array.min": "Phải chọn ít nhất 1 review",
      "any.required": "review_ids là bắt buộc",
    }),
  sentiment: Joi.string()
    .valid("POS", "NEG", "NEU", "UNC")
    .required()
    .messages({
      "string.only": "Sentiment phải là POS, NEG, NEU, hoặc UNC",
      "any.required": "Sentiment là bắt buộc",
    }),
});

// ✅ Validate bulk approve/reject toxic reviews
export const bulkUpdateToxicReviewSchema = Joi.object({
  review_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .min(1)
    .messages({
      "array.base": "review_ids phải là mảng",
      "array.min": "Phải chọn ít nhất 1 review",
      "any.required": "review_ids là bắt buộc",
    }),
  action: Joi.string()
    .valid("approve", "reject")
    .required()
    .messages({
      "string.only": "Action phải là 'approve' hoặc 'reject'",
      "any.required": "Action là bắt buộc",
    }),
  note: Joi.string().max(500).optional().messages({
    "string.max": "Ghi chú không được vượt quá 500 ký tự",
  }),
});

// ✅ Validate approve toxic review
export const approveToxicReviewSchema = Joi.object({
  note: Joi.string().max(500).optional().messages({
    "string.max": "Ghi chú không được vượt quá 500 ký tự",
  }),
});

// ✅ Validate reject toxic review
export const rejectToxicReviewSchema = Joi.object({
  note: Joi.string().max(500).optional().messages({
    "string.max": "Ghi chú không được vượt quá 500 ký tự",
  }),
});

// ✅ Validate get toxic reviews with pagination
export const getToxicReviewsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional().messages({
    "number.min": "Page phải >= 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
    "number.min": "Limit phải >= 1",
    "number.max": "Limit không được vượt quá 100",
  }),
  sort: Joi.string()
    .valid("toxic_score", "created_at", "updated_at", "-toxic_score", "-created_at", "-updated_at")
    .default("-created_at")
    .optional()
    .messages({
      "string.only": "Sort phải là toxic_score, created_at, hoặc updated_at",
    }),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .optional()
    .messages({
      "string.only": "Status phải là pending, approved, hoặc rejected",
    }),
});
