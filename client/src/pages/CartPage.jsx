import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import CartCard from "../components/CartCard";

const CartPage = () => {
  const cart = useSelector((state) => state.cart ?? []);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectAll, setSelectAll] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (cart.length === 0) {
      setSelectAll(false);
      setTotalPrice(0);
      return;
    }

    setSelectAll(cart.every((item) => item.selected));
    setTotalPrice(
      cart.reduce((acc, item) => {
        if (!item.selected) return acc;
        return acc + item.price * (item.count ?? 1);
      }, 0),
    );
  }, [cart]);

  const handleSelectAll = useCallback(
    (e) => {
      const checked = e.target.checked;
      setSelectAll(checked);
      dispatch({
        type: "UPDATE_CART",
        payload: cart.map((item) => ({
          ...item,
          selected: checked,
        })),
      });
    },
    [cart, dispatch],
  );

  const handleSelectItem = useCallback(
    (productId, checked) => {
      dispatch({
        type: "UPDATE_CART",
        payload: cart.map((item) =>
          item.product_id === productId
            ? { ...item, selected: checked }
            : item,
        ),
      });
    },
    [cart, dispatch],
  );

  const handleQuantityChange = useCallback(
    (productId, newCount) => {
      if (newCount < 1) return;
      dispatch({
        type: "UPDATE_CART",
        payload: cart.map((item) =>
          item.product_id === productId
            ? { ...item, count: newCount }
            : item,
        ),
      });
    },
    [cart, dispatch],
  );

  const handleDeleteItem = useCallback(
    (productId) => {
      dispatch({
        type: "UPDATE_CART",
        payload: cart.filter((item) => item.product_id !== productId),
      });
    },
    [cart, dispatch],
  );

  const handleContinue = () => {
    const selectedItems = cart.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng");
      return;
    }

    const total = selectedItems.reduce(
      (acc, item) => acc + item.price * (item.count ?? 1),
      0,
    );

    navigate("/checkout", {
      state: {
        selectedItems,
        totalAmount: total,
      },
    });
  };

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh)] w-full justify-center bg-[#F1F0F1] text-[14px]">
        <div className="m-auto w-full max-w-[800px] rounded-lg bg-white p-3 sm:my-[50px]">
          <div
            className="mb-4 flex cursor-pointer items-center text-[#003468] hover:text-[#001d3d]"
            onClick={() => navigate(-1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(-1);
              }
            }}
            aria-label="Quay lại trang trước"
          >
            <img
              alt="previous"
              loading="lazy"
              width="20"
              height="20"
              decoding="async"
              src="https://www.pnj.com.vn/site/assets/images/previous.svg"
              className="mr-2 h-[20px] w-[20px]"
            />
            <span className="select-none text-[16px] font-bold">Quay lại</span>
          </div>

          <h2 className="mb-[15px] text-center text-xl font-bold text-[#272727]">
            Giỏ hàng của bạn
          </h2>

          {cart.length === 0 ? (
            <div className="my-[20%] flex flex-col items-center justify-center">
              <img
                alt="empty-cart"
                loading="lazy"
                width="278"
                height="200"
                decoding="async"
                src="https://cdn.pnj.io/images/2023/relayout-pdp/empty_product_line.png?1702525998347"
              />
              <p className="my-[10px]">Giỏ hàng trống</p>
            </div>
          ) : (
            <>
              <div className="my-[10px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="cursor-pointer text-[14px] font-bold"
                  >
                    Tất cả sản phẩm
                  </label>
                </div>
              </div>

              <div>
                {cart.map((item) => (
                  <CartCard
                    key={item.product_id}
                    item={item}
                    onSelectItem={handleSelectItem}
                    onQuantityChange={handleQuantityChange}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalPrice)}
                </span>
              </div>

              <button
                className="mt-4 w-full rounded-lg bg-[#003468] py-3 font-bold text-white transition hover:bg-[#00254f]"
                onClick={() => (user ? handleContinue() : navigate("/signin"))}
              >
                {user ? "Tiếp tục" : "Đăng nhập để đặt hàng"}
              </button>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
