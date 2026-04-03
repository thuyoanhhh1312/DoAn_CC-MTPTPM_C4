import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  CircularProgress,
} from "@mui/material";

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState({ rating: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setContent("");
      setError({ rating: "", content: "" });
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const errors = { rating: "", content: "" };
    let hasError = false;

    if (rating <= 0) {
      errors.rating = "Vui lòng đánh giá";
      hasError = true;
    }

    if (content.trim() === "") {
      errors.content = "Vui lòng chia sẻ cảm nhận của bạn về sản phẩm";
      hasError = true;
    }

    setError(errors);

    if (hasError) return;

    setSubmitting(true);
    try {
      await onSubmit({ rating, content });
      onClose();
    } catch (e) {
      // Xử lý lỗi ở đây nếu cần
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Đánh giá sản phẩm</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Rating
            name="product-rating"
            value={rating}
            precision={0.5}
            size="large"
            onChange={(event, newValue) => {
              setRating(newValue);
              setError((prev) => ({ ...prev, rating: "" }));
            }}
          />
          {error.rating && (
            <Typography
              variant="body2"
              color="error"
              component="p"
              sx={{ alignSelf: "flex-start" }}
            >
              {error.rating}
            </Typography>
          )}

          <TextField
            label="Chia sẻ của bạn về sản phẩm *"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError((prev) => ({ ...prev, content: "" }));
            }}
            error={!!error.content}
            helperText={error.content}
            disabled={submitting}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;
