import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ViewedProducts = () => {
  const [products, setProducts] = useState([]);
  const { slug, id: currentProductId } = useParams();

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
    const filtered = viewed.filter(
      (p) => p.product_id !== Number(currentProductId),
    );
    setProducts(filtered);
  }, [currentProductId, slug]);

  if (products.length === 0) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="mb-12">
      {/* Section title */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-800">
          Sản Phẩm Đã Xem
        </h2>
        <div className="divider-gold max-w-[60px] mx-auto mt-3" />
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map((item) => (
          <Link
            to={`/${item.slug || `product-detail/${item.product_id}`}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            key={item.product_id}
            className="group flex-shrink-0 w-[220px] bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            <div className="overflow-hidden bg-gray-50">
              <img
                src={
                  item.image_url ||
                  "http://cdn.pnj.io/images/thumbnails/485/485/detailed/47/sbxm00k000141-bong-tai-bac-pnjsilver.png"
                }
                alt={item.product_name}
                className="w-full h-[180px] object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 line-clamp-2 group-hover:text-gold-700 transition-colors duration-300 min-h-[36px]">
                {item.product_name}
              </h3>
              <p className="font-heading text-lg font-bold text-gold-600 mt-2">
                {formatPrice(item.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ViewedProducts;
