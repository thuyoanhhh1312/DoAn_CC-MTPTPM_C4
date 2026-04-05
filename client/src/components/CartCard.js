import React from "react";
import CountWithControls from "./CountWithControls";

const CartCard = ({ item, onSelectItem, onQuantityChange, onDeleteItem }) => {
  const maxQuantity = item.quantity ?? 9999;
  const imageUrl = item.ProductImages?.[0]?.image_url || item.image_url || "";

  const handleIncrease = () => {
    if (item.count < maxQuantity) {
      onQuantityChange(item.product_id, item.count + 1);
    }
  };

  const handleDecrease = () => {
    if (item.count > 1) {
      onQuantityChange(item.product_id, item.count - 1);
    }
  };

  const handleCountChange = (newCount) => {
    if (newCount >= 1 && newCount <= maxQuantity) {
      onQuantityChange(item.product_id, newCount);
    }
  };

  return (
    <div className="my-[10px] flex items-center justify-between gap-3">
      <div className="flex items-center justify-center gap-2">
        <input
          type="checkbox"
          id={`cart-item-${item.product_id}`}
          checked={!!item.selected}
          onChange={(e) => onSelectItem(item.product_id, e.target.checked)}
        />
        <label
          htmlFor={`cart-item-${item.product_id}`}
          className="ml-1 cursor-pointer leading-[24.5px] text-[#003468]"
        >
          <div className="flex items-center gap-2">
            <img
              src={imageUrl}
              alt={item.product_name}
              className="h-[80px] w-[80px] object-cover"
            />
            <div className="ml-2 flex flex-col">
              <p className="text-[#003468]">{item.product_name}</p>
              <div className="w-[107px]">
                <CountWithControls
                  quantity={item.count}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onChange={handleCountChange}
                  min={1}
                  max={maxQuantity}
                />
              </div>
              <p className="my-[5px] font-bold text-[#C58C46]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price)}
              </p>
            </div>
          </div>
        </label>
      </div>

      <button
        aria-label="Xóa sản phẩm"
        onClick={() => onDeleteItem(item.product_id)}
        className="text-red-500 hover:text-red-700 focus:outline-none"
        title="Xóa sản phẩm"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          className="h-[18px] w-[18px] cursor-pointer text-[18px]"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          fill="currentColor"
        >
          <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
        </svg>
      </button>
    </div>
  );
};

export default CartCard;
