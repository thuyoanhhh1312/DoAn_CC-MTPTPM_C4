// components/AddToCartModal.js
import React, { useState } from "react";

const AddToCartModal = ({ product, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-card-hover overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading text-lg font-bold text-gray-800">
            Thêm vào giỏ hàng
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-premium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Product info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
              <img
                src={product?.ProductImages?.[0]?.image_url || ""}
                alt={product?.product_name}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">
                {product?.product_name}
              </p>
              <p className="font-heading text-lg font-bold text-gold-600 mt-1">
                {formatPrice(product?.price)}
              </p>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-600">Số lượng</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-premium font-bold"
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                max={product?.quantity || 99}
                className="w-12 h-9 text-center border-x border-gray-200 font-semibold text-gray-700 outline-none bg-transparent text-sm"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), product?.quantity || 99));
                }}
              />
              <button
                onClick={() => setQuantity((q) => Math.min(product?.quantity || 99, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-premium font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-sm text-gray-500">Tạm tính</span>
            <span className="font-heading text-xl font-bold text-gold-600">
              {formatPrice((product?.price || 0) * quantity)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-premium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gold-gradient text-white font-semibold text-sm shadow-elegant hover:opacity-90 transition-premium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
