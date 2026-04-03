import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ViewedProducts = () => {
  const [products, setProducts] = useState([]);
  const { id: currentProductId } = useParams();

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
    const filtered = viewed.filter(
      (p) => p.product_id !== Number(currentProductId),
    );
    setProducts(filtered);
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-[10px] md:px-4 2xl:px-0 mt-8">
      <h2 className="text-2xl font-semibold mb-6">Sản phẩm đã xem</h2>
      <div className="slider-container max-w-full mx-auto flex gap-8 overflow-x-auto no-scrollbar">
        {products.map((item) => (
          <Link
            to={`/product-detail/${item.product_id}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            key={item.product_id}
            className="product-card bg-white shadow-lg rounded-lg overflow-hidden min-w-[280px] flex-shrink-0 hover:shadow-xl transition-shadow duration-300"
            style={{ flexBasis: "280px" }}
          >
            <img
              src={
                item.image_url ||
                "http://cdn.pnj.io/images/thumbnails/485/485/detailed/47/sbxm00k000141-bong-tai-bac-pnjsilver.png"
              }
              alt={item.product_name}
              className="w-full h-[220px] object-cover"
            />
            <div className="p-5">
              <h3 className="text-lg font-semibold">{item.product_name}</h3>
              <p className="text-xl font-bold text-[#ad2a36]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ViewedProducts;
