import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import MainLayout from "../layout/MainLayout";
import orderApi from "../api/orderApi";
import vnpayApi from "../api/vnpayApi";
import "react-toastify/dist/ReactToastify.css";

const provincesMock = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Bình Dương",
];

const districtMap = {
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Bình Thạnh", "Thủ Đức"],
  "Hà Nội": ["Ba Đình", "Cầu Giấy", "Đống Đa", "Hoàng Mai"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An"],
};

const wardMap = {
  "Quận 1": ["Bến Nghé", "Bến Thành", "Nguyễn Thái Bình"],
  "Quận 3": ["Phường 1", "Phường 4", "Phường 7"],
  "Bình Thạnh": ["Phường 13", "Phường 14", "Phường 25"],
  "Thủ Đức": ["Linh Đông", "Hiệp Bình Chánh", "Tam Bình"],
  "Ba Đình": ["Điện Biên", "Kim Mã", "Ngọc Hà"],
  "Cầu Giấy": ["Dịch Vọng", "Nghĩa Đô", "Mai Dịch"],
  "Đống Đa": ["Láng Thượng", "Khâm Thiên", "Ô Chợ Dừa"],
  "Hoàng Mai": ["Định Công", "Đại Kim", "Hoàng Liệt"],
  "Hải Châu": ["Thạch Thang", "Hải Châu I", "Hòa Thuận Tây"],
  "Thanh Khê": ["Tam Thuận", "Thanh Khê Đông", "Xuân Hà"],
  "Sơn Trà": ["An Hải Bắc", "Phước Mỹ", "Mân Thái"],
  "Ninh Kiều": ["An Cư", "An Hòa", "Xuân Khánh"],
  "Bình Thủy": ["An Thới", "Bình Thủy", "Long Hòa"],
  "Cái Răng": ["Lê Bình", "Ba Láng", "Hưng Phú"],
  "Thủ Dầu Một": ["Phú Cường", "Hiệp Thành", "Chánh Nghĩa"],
  "Dĩ An": ["Dĩ An", "An Bình", "Tân Đông Hiệp"],
  "Thuận An": ["Lái Thiêu", "An Thạnh", "Bình Chuẩn"],
};

const paymentOptions = [
  {
    id: "cod",
    title: "Thanh toán tiền mặt khi nhận hàng (COD)",
    description:
      "Tạo đơn trước, sau đó thanh toán cọc 10% qua VNPay để xác nhận giữ sản phẩm.",
  },
  {
    id: "vnpay",
    title: "Thanh toán qua VNPay",
    description:
      "Thanh toán toàn bộ đơn hàng trực tuyến sau khi hệ thống tạo đơn thành công.",
  },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { selectedItems = [], totalAmount = 0 } = location.state || {};

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);

  const districts = useMemo(() => districtMap[province] || [], [province]);
  const wards = useMemo(() => wardMap[district] || [], [district]);

  useEffect(() => {
    if (user?.name) {
      setRecipientName(user.name);
    } else if (user?.email) {
      setRecipientName(user.email.split("@")[0]);
    }
  }, [user]);

  useEffect(() => {
    setDistrict("");
    setWard("");
  }, [province]);

  useEffect(() => {
    setWard("");
  }, [district]);

  const subTotal = useMemo(() => {
    if (totalAmount) return totalAmount;
    return selectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.count || 1),
      0,
    );
  }, [selectedItems, totalAmount]);

  const discount = useMemo(
    () => Number(promoApplied?.discount ?? 0),
    [promoApplied],
  );

  const total = Math.max(0, subTotal - discount);
  const depositAmount = Math.round(total * 0.1);

  const handleApplyPromo = async () => {
    const normalized = promoCode.trim().toUpperCase();

    if (!normalized) {
      toast.warn("Vui lòng nhập mã ưu đãi.");
      return;
    }

    if (!user?.id || !user?.token) {
      toast.error("Vui lòng đăng nhập để áp dụng mã khuyến mãi.");
      return;
    }

    if (!selectedItems.length) {
      toast.error("Không có sản phẩm nào để áp dụng mã.");
      return;
    }

    setPromoLoading(true);

    try {
      const response = await orderApi.calculatePrice(
        {
          items: selectedItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.count ?? 1,
          })),
          promotion_code: normalized,
          user_id: user.id,
        },
        user.token,
      );

      if (response.valid) {
        setPromoApplied({
          code: response.promotion?.promotion_code ?? normalized,
          description: response.promotion?.description ?? "",
          discount_percent: response.promotion?.discount_percent ?? 0,
          discount: response.discount ?? 0,
        });
        toast.success(response.message || "Áp dụng mã ưu đãi thành công.");
      } else {
        setPromoApplied(null);
        toast.error(response.message || "Mã ưu đãi không hợp lệ.");
      }
    } catch (error) {
      setPromoApplied(null);
      toast.error(
        error.response?.data?.message || "Lỗi khi áp dụng mã khuyến mãi.",
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoCode("");
    toast.info("Đã bỏ mã ưu đãi.");
  };

  const validateForm = () => {
    if (!selectedItems.length) {
      toast.error("Không có sản phẩm nào để thanh toán.");
      return false;
    }

    if (!user?.id || !user?.token) {
      toast.error("Vui lòng đăng nhập để tiếp tục đặt hàng.");
      return false;
    }

    if (!recipientName.trim()) {
      toast.error("Vui lòng nhập tên người nhận.");
      return false;
    }

    if (!recipientPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại.");
      return false;
    }

    if (!province || !district || !ward || !addressDetail.trim()) {
      toast.error("Vui lòng điền đầy đủ địa chỉ nhận hàng.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const shippingAddress = [addressDetail, ward, district, province]
      .filter(Boolean)
      .join(", ");

    const orderPayload = {
      user_id: user.id,
      promotion_code: promoApplied?.code || null,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      is_deposit: paymentMethod === "cod",
      deposit_status: paymentMethod === "cod" ? "pending" : "none",
      items: selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.count ?? 1,
        price: item.price,
      })),
    };

    setSubmitting(true);

    try {
      const response = await orderApi.checkout(orderPayload, user.token);
      const createdOrder = response?.order;

      if (!createdOrder?.order_id) {
        throw new Error("Không nhận được mã đơn hàng từ hệ thống.");
      }

      localStorage.setItem(
        "purchasedItems",
        JSON.stringify(selectedItems.map((item) => item.product_id)),
      );
      dispatch({ type: "CLEAR_CART" });

      if (paymentMethod === "vnpay") {
        try {
          const paymentResponse = await vnpayApi.createPaymentUrl(
            createdOrder.order_id,
            total,
          );

          if (paymentResponse?.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
            return;
          }

          throw new Error("Không tạo được đường dẫn thanh toán.");
        } catch (_error) {
          toast.warning(
            "Đã tạo đơn hàng nhưng chưa kết nối được cổng VNPay. Bạn có thể kiểm tra đơn trong lịch sử đơn hàng.",
          );
          navigate("/order-history");
          return;
        }
      }

      if (paymentMethod === "cod") {
        try {
          const paymentResponse = await vnpayApi.createPaymentUrl(
            createdOrder.order_id,
            depositAmount,
          );

          toast.info(
            "Vui lòng thanh toán cọc 10% qua VNPay để hoàn tất xác nhận đơn hàng.",
          );

          if (paymentResponse?.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
            return;
          }

          throw new Error("Không tạo được đường dẫn đặt cọc.");
        } catch (_error) {
          toast.warning(
            "Đơn hàng đã được tạo ở trạng thái chờ cọc. Hiện chưa chuyển được sang VNPay, bạn có thể theo dõi đơn trong lịch sử đơn hàng.",
          );
          navigate("/order-history");
          return;
        }
      }

      toast.success("Đơn hàng đã được tạo thành công.");
      navigate("/order-history");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi đặt hàng. Vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={2500} />

      <form
        onSubmit={handleSubmit}
        className="mx-auto my-6 w-full max-w-[1200px] rounded-2xl bg-white p-4 shadow-card sm:my-10 sm:p-6 lg:p-8"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 font-bold text-[#003468] transition hover:text-[#001d3d]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Quay lại
        </button>

        <h1 className="mb-8 text-center font-heading text-2xl font-bold text-[#272727] sm:text-3xl">
          Thông tin đặt hàng
        </h1>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#003468]">
                  Sản phẩm đã chọn
                </h2>
                <span className="rounded-full bg-[#f4ede4] px-3 py-1 text-xs font-semibold text-[#C58C46]">
                  {selectedItems.length} sản phẩm
                </span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  Không có sản phẩm nào. Quay lại giỏ hàng để chọn sản phẩm trước
                  khi checkout.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <img
                        src={
                          item.ProductImages?.[0]?.image_url ||
                          item.image_url ||
                          "https://cdn.pnj.io/images/logo/pnj.com.vn.png"
                        }
                        alt={item.product_name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#003468]">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Số lượng: <strong>{item.count}</strong>
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Đơn giá:</span>
                          <span className="font-bold text-[#C58C46]">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#003468]">
                Mã ưu đãi
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập mã ưu đãi"
                  className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468]"
                  disabled={promoLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading}
                  className="h-12 rounded-xl bg-[#b1b1b1] px-6 font-semibold text-white transition hover:bg-[#979797] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {promoLoading ? "Đang áp dụng..." : "Áp dụng"}
                </button>
              </div>

              {promoApplied && (
                <div className="mt-4 flex items-start justify-between gap-4 rounded-2xl border border-blue-300 bg-[#e3f1fc] p-4">
                  <div>
                    <p className="font-bold text-blue-700">
                      Mã ưu đãi: {promoApplied.code}
                    </p>
                    <p className="mt-1 text-sm text-[#003468]">
                      Giảm {promoApplied.discount_percent}% (
                      {formatPrice(discount)})
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      {promoApplied.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-blue-700 transition hover:bg-white/60"
                    title="Bỏ mã khuyến mãi"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#003468]">
                Địa chỉ nhận hàng
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Tên người nhận *"
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468]"
                />
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Số điện thoại *"
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468]"
                />
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468]"
                >
                  <option value="">Chọn tỉnh/thành *</option>
                  {provincesMock.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!districts.length}
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Quận/huyện *</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={!wards.length}
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Phường/xã *</option>
                  {wards.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Địa chỉ chi tiết *"
                  className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#003468]"
                />
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú cho đơn hàng"
                rows={4}
                className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#003468]"
              />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#003468]">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => {
                  const active = paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-[#003468] bg-[#003468] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#003468]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{option.title}</p>
                          <p
                            className={`mt-1 text-sm ${
                              active ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {option.description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 h-5 w-5 rounded-full border-2 ${
                            active
                              ? "border-white bg-white/20"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "vnpay" && (
                <p className="mt-4 text-sm text-gray-500">
                  Sau khi tạo đơn, bạn sẽ được chuyển đến cổng thanh toán VNPay
                  để thanh toán toàn bộ đơn hàng.
                </p>
              )}

              {paymentMethod === "cod" && (
                <div className="mx-auto mt-5 max-w-[420px] rounded-2xl border border-amber-400 bg-[#fff3cd] p-4 text-center">
                  <p className="font-bold text-[#856404]">
                    Bắt buộc cọc 10% qua VNPay
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Hệ thống sẽ tạo đơn trước, sau đó chuyển bạn sang bước thanh
                    toán cọc để giữ sản phẩm.
                  </p>
                  <p className="mt-2 font-semibold text-red-500">
                    Số tiền cọc: <strong>{formatPrice(depositAmount)}</strong>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Thanh toán {formatPrice(total - depositAmount)} còn lại khi
                    nhận hàng
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-28">
              <h2 className="mb-4 text-lg font-bold text-[#003468]">
                Tổng tiền
              </h2>

              <div className="space-y-3 text-sm font-medium text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="text-red-500">- {formatPrice(discount)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold text-[#272727]">
                    <span>Tổng tiền</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="mt-2 text-xs italic text-gray-400">
                    Giá tham khảo đã bao gồm VAT.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-[#003468]">
                  Thông tin giao nhận
                </p>
                <p className="mt-2">
                  {recipientName || "Chưa nhập tên người nhận"}
                </p>
                <p className="mt-1">
                  {recipientPhone || "Chưa nhập số điện thoại"}
                </p>
                <p className="mt-1">
                  {[addressDetail, ward, district, province]
                    .filter(Boolean)
                    .join(", ") || "Chưa hoàn tất địa chỉ giao hàng"}
                </p>
              </div>

              {paymentMethod === "cod" && (
                <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                  Sau khi tạo đơn, hệ thống sẽ chuyển sang bước cọc
                  <strong> {formatPrice(depositAmount)}</strong> qua VNPay.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedItems.length}
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#003468] px-4 py-3 text-base font-bold text-white transition hover:bg-[#002954] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {submitting
                  ? "Đang xử lý..."
                  : paymentMethod === "cod"
                    ? "ĐẶT HÀNG VÀ CỌC 10%"
                    : "ĐẶT HÀNG VÀ THANH TOÁN"}
              </button>
            </section>
          </aside>
        </div>
      </form>
    </MainLayout>
  );
};

export default CheckoutPage;
