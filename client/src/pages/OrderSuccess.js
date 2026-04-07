import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MainLayout from "../layout/MainLayout";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const stateOrder = location.state?.order;
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const orderDataStr = params.get("orderData");
  const vnpResponseCode = params.get("vnp_ResponseCode");
  const isVnpayCallbackSuccess = vnpResponseCode === "00";

  useEffect(() => {
    localStorage.removeItem("pendingCheckout");

    let purchasedProductIds = [];

    const purchasedItemsStr = localStorage.getItem("purchasedItems");
    if (purchasedItemsStr) {
      try {
        purchasedProductIds = JSON.parse(purchasedItemsStr);
        localStorage.removeItem("purchasedItems");
      } catch (e) {
        console.error("Loi parse purchasedItems:", e);
      }
    }

    const purchasedItems = location.state?.selectedItems || [];
    if (purchasedItems.length > 0 && purchasedProductIds.length === 0) {
      purchasedProductIds = purchasedItems.map((item) => item.product_id);
    }

    if (purchasedProductIds.length > 0) {
      dispatch({
        type: "REMOVE_CART_ITEMS",
        payload: purchasedProductIds,
      });
    }

    if (stateOrder) {
      setOrder(stateOrder);
      setLoading(false);
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}/payment/order-details/${orderId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        const normalizedOrder = {
          ...data.order,
          Customer: {
            name: data.order.customer_name || "N/A",
            email: data.order.email || "N/A",
            phone: data.order.phone || "N/A",
          },
        };

        setOrder(normalizedOrder);
      } catch (error) {
        console.error("Loi fetch order:", error);

        if (orderDataStr) {
          try {
            const parsedOrder = JSON.parse(decodeURIComponent(orderDataStr));
            if (!parsedOrder.Customer) {
              parsedOrder.Customer = {
                name: parsedOrder.customer_name || "N/A",
                email: parsedOrder.email || "N/A",
                phone: parsedOrder.phone || "N/A",
              };
            }
            setOrder(parsedOrder);
            return;
          } catch (e) {
            console.error("Loi parse orderData:", e);
          }
        }

        setOrder({
          order_id: orderId,
          Customer: { name: "N/A", email: "N/A", phone: "N/A" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [
    dispatch,
    location.state?.selectedItems,
    orderDataStr,
    orderId,
    stateOrder,
  ]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  if (loading) {
    return (
      <MainLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  const isVnpayPaid =
    order?.payment_method === "vnpay" &&
    order?.status_id === 2 &&
    isVnpayCallbackSuccess;
  const isVnpayDepositPaid =
    order?.payment_method === "vnpay" &&
    order?.status_id === 1 &&
    isVnpayCallbackSuccess;
  const isVnpayPending =
    order?.payment_method === "vnpay" && !isVnpayCallbackSuccess;

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
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: "#4caf50", mb: 2 }}
        />

        {isVnpayPaid ? (
          <>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Thanh toan thanh cong!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={3}>
              Cam on ban da thanh toan. Don hang cua ban dang duoc xu ly va se
              som duoc gui di.
            </Typography>
          </>
        ) : isVnpayDepositPaid ? (
          <>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Coc 10% thanh cong!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              Cam on ban da coc 10%. Ban se thanh toan phan con lai khi nhan
              hang.
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "#fff3cd",
                border: "2px solid #ff9800",
                borderRadius: 2,
              }}
            >
              <Typography fontWeight="bold" color="#e65100" mb={1}>
                So tien con phai thanh toan khi nhan hang:
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error">
                {formatCurrency((order?.total || 0) * 0.9)}
              </Typography>
            </Paper>
          </>
        ) : isVnpayPending ? (
          <>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Don hang da tao, cho thanh toan
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={3}>
              Ban chua hoan tat thanh toan VNPay. Vui long thanh toan de xac
              nhan don hang.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Dat hang thanh cong!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={3}>
              Cam on ban da tin tuong va dat mua san pham tai PNJ. Don hang cua
              ban dang duoc xu ly.
            </Typography>
          </>
        )}

        {order ? (
          <Paper
            elevation={1}
            sx={{
              textAlign: "left",
              p: 3,
              mb: 4,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thong tin don hang
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              <strong>Ma don hang:</strong> {order.order_id || "N/A"}
            </Typography>
            <Typography>
              <strong>Khach hang:</strong>{" "}
              {order.Customer?.name || order.customer_name || "N/A"}
            </Typography>
            <Typography>
              <strong>Email:</strong>{" "}
              {order.Customer?.email || order.email || "N/A"}
            </Typography>
            <Typography>
              <strong>So dien thoai:</strong>{" "}
              {order.Customer?.phone || order.phone || "N/A"}
            </Typography>
            <Typography>
              <strong>Dia chi giao hang:</strong>{" "}
              {order.shipping_address || "N/A"}
            </Typography>
            <Typography>
              <strong>Phuong thuc thanh toan:</strong>{" "}
              {order.payment_method === "cod"
                ? "Thanh toan khi nhan hang (COD)"
                : order.payment_method === "vnpay"
                  ? "Thanh toan bang VNPay"
                  : "Khong xac dinh"}
            </Typography>
            <Typography>
              <strong>Tam tinh:</strong> {formatCurrency(order.sub_total)}
            </Typography>
            <Typography>
              <strong>Giam gia:</strong>{" "}
              <span style={{ color: "#d32f2f" }}>
                - {formatCurrency(order.discount)}
              </span>
            </Typography>
            <Typography fontWeight="bold" fontSize="1.2rem" mt={1}>
              Tong cong: {formatCurrency(order.total)}
            </Typography>
          </Paper>
        ) : (
          <Typography color="text.secondary" mb={3}>
            Khong co thong tin don hang hien thi.
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/order-history")}
          sx={{
            marginRight: 2,
            backgroundColor: "#003468",
            color: "#fff",
            "&:hover": { backgroundColor: "#002954" },
          }}
        >
          Xem chi tiet don hang
        </Button>

        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            borderColor: "#003468",
            color: "#003468",
            "&:hover": {
              backgroundColor: "#f0f0f0",
              borderColor: "#002954",
            },
          }}
        >
          Tiep tuc mua sam
        </Button>
      </Box>
    </MainLayout>
  );
};

export default OrderSuccess;
