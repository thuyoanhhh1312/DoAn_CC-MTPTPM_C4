import React, { useState, useEffect, lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import MainLayout from "../layout/MainLayout";
import ProductApi from "../api/productApi";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { BannerTabSaleMay, BannerTopProduct } from "../assets";
import BenefitCard from "../components/ui/home/HomeBenefitCard";
import { ToastContainer } from "react-toastify";

const LazyProductCard = lazy(() =>
  import("../components/ui/product/productCard")
);

const PRODUCTS_PER_PAGE = 8;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const getProducts = async () => {
    try {
      const res = await ProductApi.getProductWithReviewSummary();
      setProducts(res);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const LazyLoadProductCard = ({ product }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <div ref={ref}>
        {inView ? (
          <LazyProductCard product={product} />
        ) : (
          <div className="h-[350px] bg-gray-50 rounded-2xl animate-pulse" />
        )}
      </div>
    );
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to product section
    const el = document.getElementById("product-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2);
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const benefitItems = [
    {
      title: "MIỄN PHÍ",
      subtitle: "VẬN CHUYỂN",
      icon: "https://cdn.pnj.io/images/2023/relayout-pdp/shipping-icon.svg",
      tooltip: (
        <>
          <strong>Miễn phí giao hàng trong 3 giờ.</strong> Nếu giao trễ, tặng
          ngay voucher 100k cho lần mua hàng tiếp theo.
        </>
      ),
    },
    {
      title: "PHỤC VỤ 24/7",
      subtitle: "",
      icon: "https://cdn.pnj.io/images/2023/relayout-pdp/shopping%20247-icon.svg",
      tooltip: (
        <>Khách hàng có thể xem, đặt hàng và thanh toán 24/7 tại website.</>
      ),
    },
    {
      title: "THU ĐỔI 48H",
      subtitle: "",
      icon: "https://cdn.pnj.io/images/2023/relayout-pdp/thudoi-icon.svg",
      tooltip: (
        <>
          <strong>
            Áp dụng đổi 48 giờ đối với trang sức vàng và 72 giờ đối với trang
            sức bạc (chỉ đổi size).
          </strong>
          <br />
          Tính từ lúc cửa hàng xuất hóa đơn hoặc khi khách hàng nhận được sản phẩm.
        </>
      ),
    },
  ];

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Banner Carousel */}
      <div className="relative">
        <Carousel
          infiniteLoop={true}
          interval={3000}
          autoPlay={true}
          showThumbs={false}
          showStatus={false}
          swipeable={true}
          emulateTouch={true}
          renderThumbs={() => {}}
        >
          <div>
            <img src={BannerTabSaleMay} alt="Ưu đãi tháng 5" className="w-full object-cover" />
          </div>
          <div>
            <img src={BannerTopProduct} alt="Top sản phẩm yêu thích" className="w-full object-cover" />
          </div>
        </Carousel>
      </div>

      {/* Benefit Cards */}
      <div className="max-w-[1080px] mx-auto px-4 -mt-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {benefitItems.map((item, index) => (
            <BenefitCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div id="product-section" className="text-center mt-12 mb-8 px-4 scroll-mt-24">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">
          Sản Phẩm Nổi Bật
        </h1>
        <div className="divider-gold max-w-[80px] mx-auto mt-3 mb-2" />
        <p className="text-sm text-gray-400 mt-2">
          Khám phá bộ sưu tập trang sức bạc cao cấp, thiết kế tinh xảo
        </p>
      </div>

      {/* Product Grid */}
      <Suspense
        fallback={
          <div className="text-center text-gray-400 py-10 font-body">
            <div className="inline-block w-6 h-6 border-2 border-gold-300 border-t-transparent rounded-full animate-spin mr-2" />
            Đang tải sản phẩm...
          </div>
        }
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div
            className="
              grid grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
            "
          >
            {currentProducts.map((product, index) => (
              <LazyLoadProductCard key={`${currentPage}-${index}`} product={product} />
            ))}
          </div>
        </div>
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 mb-16 px-4">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
              border transition-all duration-300
              ${currentPage === 1
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700'
              }
            `}
            aria-label="Trang trước"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold
                  border transition-all duration-300
                  ${currentPage === page
                    ? 'bg-gold-gradient text-white border-transparent shadow-elegant'
                    : 'border-gray-200 text-gray-600 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700'
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
              border transition-all duration-300
              ${currentPage === totalPages
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700'
              }
            `}
            aria-label="Trang sau"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Page info */}
          <span className="ml-4 text-sm text-gray-400">
            Trang {currentPage}/{totalPages}
          </span>
        </div>
      )}
    </MainLayout>
  );
};

export default Home;