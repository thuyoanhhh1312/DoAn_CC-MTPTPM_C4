export const errorHandler = (err, req, res, next) => {
  console.error("[ErrorHandler]", err);

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Lỗi không xác định";

  res.status(statusCode).json({ code, message });
};
