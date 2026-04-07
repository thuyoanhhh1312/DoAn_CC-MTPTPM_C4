import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MainLayout from "../layout/MainLayout";

const ERROR_MESSAGES = {
  invalid_signature: "Phien thanh toan khong hop le. Vui long thu lai.",
  order_not_found: "Khong tim thay don hang de xu ly thanh toan.",
  amount_mismatch: "So tien thanh toan khong khop voi don hang.",
  system_error: "He thong dang ban. Vui long thu lai sau.",
  payment_timeout: "Don hang da qua han thanh toan.",
  insufficient_stock: "San pham trong don da khong con du ton kho.",
};

const OrderFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const errorCode = params.get("error") || "unknown";
  const message =
    ERROR_MESSAGES[errorCode] ||
    "Thanh toan chua hoan tat hoac da bi huy. Vui long thu lai.";

  const handleRetryPayment = () => {
    const pendingCheckoutRaw = localStorage.getItem("pendingCheckout");

    if (!pendingCheckoutRaw) {
      navigate("/cart");
      return;
    }

    try {
      const pendingCheckout = JSON.parse(pendingCheckoutRaw);
      navigate("/checkout", { state: pendingCheckout });
    } catch {
      navigate("/cart");
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 4,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 3,
          textAlign: "center",
          color: "#003468",
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "#ef4444", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Thanh toan that bai
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={3}>
          {message}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 2,
            bgcolor: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: 2,
          }}
        >
          <Typography fontSize="0.95rem" color="#9f1239">
            Ma loi: {errorCode}
          </Typography>
        </Paper>

        <Button
          variant="contained"
          onClick={handleRetryPayment}
          sx={{
            mr: 2,
            backgroundColor: "#003468",
            color: "#fff",
            "&:hover": { backgroundColor: "#002954" },
          }}
        >
          Thu lai thanh toan
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/order-history")}
          sx={{
            borderColor: "#003468",
            color: "#003468",
            "&:hover": {
              backgroundColor: "#f0f0f0",
              borderColor: "#002954",
            },
          }}
        >
          Ve lich su don hang
        </Button>
      </Box>
    </MainLayout>
  );
};

export default OrderFailed;
