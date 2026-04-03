import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goProductDetail = () => {
    navigate(`/${product.slug}`);
  };

  const avgRating = Number(product.avgRating) || 0;
  const totalReviews = product.totalReviews || 0;

  const formatCount = (count) => {
    if (count >= 1e6) return (count / 1e6).toFixed(1) + 'M';
    if (count >= 1e3) return (count / 1e3).toFixed(1) + 'k';
    return count.toString();
  };

  const handleAddToCart = (e, count = 1) => {
    e.stopPropagation();

    const updatedItem = { ...product, count };
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existIndex = cart.findIndex((item) => item.product_id === product.product_id);
    if (existIndex >= 0) {
      cart[existIndex].count += count;
    } else {
      cart.push(updatedItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    dispatch({ type: 'ADD_TO_CART', payload: updatedItem });
    toast.success('Đã thêm vào giỏ hàng thành công!');
  };

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goProductDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goProductDetail();
      }}
      className="
        group relative w-full
        bg-white rounded-2xl
        border border-gray-100
        shadow-card
        cursor-pointer
        hover:shadow-card-hover hover:-translate-y-1
        transition-all duration-400 ease-out
        outline-none focus:ring-2 focus:ring-gold-300
        flex flex-col overflow-hidden
      "
    >
      {/* Image container with subtle zoom */}
      <div className="relative overflow-hidden bg-gray-50 rounded-t-2xl">
        <img
          className="w-full h-52 sm:h-56 md:h-60 object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          src={
            product.ProductImages && product.ProductImages.length > 0
              ? product.ProductImages[0].image_url
              : 'http://cdn.pnj.io/images/thumbnails/485/485/detailed/47/sbxm00k000141-bong-tai-bac-pnjsilver.png'
          }
          alt={product.product_name || 'Product Image'}
          loading="lazy"
        />
        {/* Quick add button overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
          <button
            onClick={(e) => handleAddToCart(e, 1)}
            className="w-full py-2.5 rounded-xl bg-gold-gradient text-white font-semibold text-sm shadow-elegant hover:opacity-90 transition-premium flex items-center justify-center gap-2"
            type="button"
            aria-label={`Thêm ${product.product_name} vào giỏ hàng`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Thêm giỏ hàng
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-5 flex flex-col flex-grow">
        {/* Product name */}
        <h2
          className="
            font-heading text-[15px] sm:text-base font-semibold
            text-gray-800 leading-snug
            line-clamp-2 min-h-[40px]
            group-hover:text-gold-700 transition-colors duration-300
          "
          title={product.product_name}
        >
          {product.product_name}
        </h2>

        {/* Rating section */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <ReactStars
              count={5}
              value={avgRating}
              size={16}
              isHalf={true}
              edit={false}
              activeColor="#c48c46"
              emptyIcon={<i className="far fa-star"></i>}
              halfIcon={<i className="fa fa-star-half-alt"></i>}
              fullIcon={<i className="fa fa-star"></i>}
            />
          </div>
          <span className="text-xs text-gray-400">
            {formatCount(product?.positiveCount ?? 0)} hài lòng
          </span>
          <span className="text-xs text-gray-400">({totalReviews})</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3">
          <span className="text-xl sm:text-2xl font-bold text-gold-600 font-heading">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;