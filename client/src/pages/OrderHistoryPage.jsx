import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import MainLayout from "../layout/MainLayout";
import orderApi from "../api/orderApi";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const demoOrders = [
  {
    order_id: 1001,
    created_at: "2026-03-28T10:20:00",
    sub_total: 3250000,
    discount: 325000,
    total: 2925000,
    shipping_address: "25 Nguyễn Huệ, Bến Nghé, Quận 1, Hồ Chí Minh",
    payment_method: "vnpay",
    Customer: {
      name: "Nguyễn Minh Anh",
      email: "minhanh@example.com",
      phone: "0901234567",
    },
    OrderStatus: {
      status_name: "Đã xác nhận",
      color_code: "#2563eb",
    },
    OrderItems: [
      {
        order_item_id: 1,
        quantity: 1,
        price: 1850000,
        Product: { product_name: "Nhẫn vàng đính đá Celeste" },
      },
      {
        order_item_id: 2,
        quantity: 1,
        price: 1400000,
        Product: { product_name: "Dây chuyền ngọc trai Muse" },
      },
    ],
  },
  {
    order_id: 1002,
    created_at: "2026-04-01T16:45:00",
    sub_total: 980000,
    discount: 0,
    total: 980000,
    shipping_address: "12 Lê Lợi, Hải Châu I, Hải Châu, Đà Nẵng",
    payment_method: "cod",
    Customer: {
      name: "Nguyễn Minh Anh",
      email: "minhanh@example.com",
      phone: "0901234567",
    },
    OrderStatus: {
      status_name: "Đang xử lý",
      color_code: "#d97706",
    },
    OrderItems: [
      {
        order_item_id: 3,
        quantity: 2,
        price: 490000,
        Product: { product_name: "Bông tai bạc PNJ Silver" },
      },
    ],
  },
];

const OrderHistoryPage = () => {
  const user = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !user?.token) {
        setError("Bạn chưa đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await orderApi.getOrderByCustomer(user.id, user.token);
        setOrders(Array.isArray(data) ? data : []);
        setUsingDemoData(false);
        setError("");
      } catch (err) {
        setOrders(demoOrders);
        setUsingDemoData(true);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  const toggleExpand = (orderId) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  return (
    <MainLayout>
      <div className="mx-auto my-6 w-full max-w-[1280px] px-4 sm:my-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-card sm:p-7">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C58C46]">
                Customer Orders
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold text-[#003468]">
                Lịch sử đơn hàng
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Theo dõi tất cả đơn hàng, trạng thái xử lý và chi tiết sản phẩm bạn đã mua.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#f4ede4] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                  Tổng đơn
                </p>
                <p className="mt-1 text-2xl font-bold text-[#C58C46]">
                  {totalOrders}
                </p>
              </div>
            </div>
          </div>

          {usingDemoData && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Đang hiển thị dữ liệu demo để preview UI vì backend đơn hàng chưa sẵn sàng trong project hiện tại.
            </div>
          )}

          {loading && (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5d2b8] border-t-[#C58C46]" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl bg-[#faf7f2] px-4 text-center">
              <img
                src="https://cdn.pnj.io/images/2023/relayout-pdp/empty_product_line.png?1702525998347"
                alt="empty-order"
                className="h-auto w-[220px]"
              />
              <p className="mt-4 text-base font-semibold text-[#003468]">
                Bạn chưa có đơn hàng nào
              </p>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                Khi hoàn tất mua sắm, thông tin đơn hàng và chi tiết sản phẩm sẽ hiển thị tại đây.
              </p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const expanded = expandedOrderIds.has(order.order_id);

                return (
                  <div
                    key={order.order_id}
                    className="overflow-hidden rounded-[24px] border border-[#d8e4ff] bg-[#eef4ff] transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.order_id)}
                      className="flex w-full flex-col gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-bold text-[#003468]">
                            Đơn hàng #{order.order_id}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Ngày tạo:{" "}
                            {order.created_at
                              ? format(new Date(order.created_at), "dd/MM/yyyy HH:mm")
                              : "Không rõ"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className="rounded-full px-4 py-2 text-sm font-bold text-white"
                            style={{
                              backgroundColor:
                                order.OrderStatus?.color_code || "#2563eb",
                            }}
                          >
                            {order.OrderStatus?.status_name || "Chưa cập nhật"}
                          </span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#003468] shadow-sm">
                            <svg
                              className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/80 px-4 py-3">
                          <p className="text-gray-400">Tổng cộng</p>
                          <p className="mt-1 font-bold text-[#003468]">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-4 py-3">
                          <p className="text-gray-400">Thanh toán</p>
                          <p className="mt-1 font-bold uppercase text-[#003468]">
                            {order.payment_method || "Chưa cập nhật"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-4 py-3">
                          <p className="text-gray-400">Sản phẩm</p>
                          <p className="mt-1 font-bold text-[#003468]">
                            {order.OrderItems?.length || 0} mục
                          </p>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-[#d8e4ff] bg-white px-5 py-5 sm:px-6">
                        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
                          <div className="space-y-5">
                            <div>
                              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-400">
                                Thông tin khách hàng
                              </h2>
                              <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                                <p><span className="font-semibold text-[#003468]">Tên:</span> {order.Customer?.name || "Không có"}</p>
                                <p className="mt-2"><span className="font-semibold text-[#003468]">Email:</span> {order.Customer?.email || "Không có"}</p>
                                <p className="mt-2"><span className="font-semibold text-[#003468]">Điện thoại:</span> {order.Customer?.phone || "Không có"}</p>
                              </div>
                            </div>

                            <div>
                              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-400">
                                Địa chỉ giao hàng
                              </h2>
                              <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                                {order.shipping_address || "Chưa cập nhật"}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-400">
                              Chi tiết đơn hàng
                            </h2>

                            <div className="mt-3 space-y-3">
                              {order.OrderItems?.length > 0 ? (
                                order.OrderItems.map((item) => (
                                  <div
                                    key={item.order_item_id}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <p className="font-semibold text-[#003468]">
                                          {item.Product?.product_name || "Sản phẩm"}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                          Số lượng: <strong>{item.quantity}</strong>
                                        </p>
                                      </div>
                                      <p className="font-bold text-[#C58C46]">
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                                  Không có sản phẩm trong đơn hàng này.
                                </div>
                              )}
                            </div>

                            <div className="mt-5 rounded-2xl border border-gray-100 bg-[#faf7f2] p-4">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatPrice(order.sub_total)}</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                                <span>Giảm giá</span>
                                <span className="text-red-500">
                                  - {formatPrice(order.discount)}
                                </span>
                              </div>
                              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                                <span className="font-bold text-[#003468]">
                                  Tổng cộng
                                </span>
                                <span className="text-lg font-bold text-[#003468]">
                                  {formatPrice(order.total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderHistoryPage;
