import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import productApi from "../api/productApi";
import DOMPurify from "dompurify";
import ViewedProducts from "../components/ViewedProducts";
import { useDispatch, useSelector } from "react-redux";
import ReviewModal from "../components/ReviewMoal";
import { ToastContainer, toast } from "react-toastify";
import RatingSummary from "../components/RatingSummary";
import ReviewSummaryDetailed from "../components/ReviewSummaryDetailed";
import ReviewSummaryAdmin from "../components/ReviewSummaryAdmin";
import ReviewTabs from "../components/ReviewTabs";
import AddToCartModal from "../components/AddToCartModal";
import LightboxViewer from "../components/LightboxViewer";
import ProductCard from "../components/ui/product/productCard";
import { AiOutlineShoppingCart, AiOutlinePhone } from "react-icons/ai";
import ThreeDViewer from "../components/ThreeDViewer";
import { Row, Col, Empty, Spin } from "antd";

// Map all GLB assets by slug (filename without extension)
const modelImports = import.meta.glob("../assets/3d/*.glb", {
  eager: true,
  import: "default",
});
const MODEL_MAP = Object.entries(modelImports).reduce((acc, [path, url]) => {
  const match = path.match(/\/([^/]+)\.glb$/);
  if (match) {
    acc[match[1]] = url;
  }
  return acc;
}, {});

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ ...state }));

  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const [isPolicyVisible, setIsPolicyVisible] = useState(false);
  const [isFAQVisible, setIsFAQVisible] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilarProducts, setLoadingSimilarProducts] = useState(false);
  const [errorSimilarProducts, setErrorSimilarProducts] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxRotate, setLightboxRotate] = useState(0);

  // Toggle các tab nội dung
  const activeTab = isDescriptionVisible
    ? "description"
    : isPolicyVisible
      ? "policy"
      : "faq";

  const setActiveTab = (tab) => {
    setIsDescriptionVisible(tab === "description");
    setIsPolicyVisible(tab === "policy");
    setIsFAQVisible(tab === "faq");
  };

  // Lấy chi tiết sản phẩm và sản phẩm tương tự
  const handleGetProduct = async () => {
    try {
      const res = await productApi.getProductBySlug(slug);
      setProduct(res?.product);
      
      // Fetch similar products
      setLoadingSimilarProducts(true);
      setErrorSimilarProducts(null);
      try {
        const similarRes = await productApi.getSimilarProducts(
          res.category_id,
          res.subcategory_id,
        );
        // API returns an array of products or empty array
        setSimilarProducts(Array.isArray(similarRes) ? similarRes : []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm tương tự:", error);
        setErrorSimilarProducts(error.message || "Lỗi khi tải sản phẩm tương tự");
        setSimilarProducts([]);
      } finally {
        setLoadingSimilarProducts(false);
      }
      
      setIsDescriptionVisible(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  // Load reviews sản phẩm
  const loadReviews = async () => {
    try {
      if (!product) return;
      const data = await productApi.getProductReviews(product.product_id);
      setReviews(data?.reviews);
    } catch (error) {
      console.error(error);
    }
  };

  // Lấy tóm tắt đánh giá
  const getRatingSummary = async () => {
    try {
      if (!product) return;
      if (user?.role === "admin" || user?.role === "staff") {
        const res = await productApi.getProductReviewSummaryAdmin(
          product.product_id,
          user?.token,
        );
        setReviewSummary(res?.data);
      } else {
        const res = await productApi.getProductReviewSummaryPublic(
          product.product_id,
        );
        setReviewSummary(res?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (count) => {
    if (!product) return;
    const updatedItem = { ...product, count };
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existIndex = cart.findIndex(
      (item) => item.product_id === product.product_id,
    );
    if (existIndex >= 0) {
      cart[existIndex].count += count;
    } else {
      cart.push(updatedItem);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    dispatch({ type: "ADD_TO_CART", payload: updatedItem });
    toast.success("Đã thêm vào giỏ hàng thành công!");
  };

  // Mua ngay
  const handleBuyNow = (count) => {
    if (!product) return;
    const selectedItems = [{ ...product, count }];
    const total = product.price * count;
    navigate("/checkout", {
      state: { selectedItems, totalAmount: total },
    });
    setIsBuyNowModalOpen(false);
  };

  // Gửi đánh giá
  const handleSubmitReview = async (review) => {
    try {
      await productApi.addProductReview(
        product?.product_id,
        { user_id: user.id, ...review },
        user?.token,
      );
      toast.success("Đánh giá đã gửi thành công!");
      setIsReviewModalOpen(false);
      loadReviews();
      getRatingSummary();
    } catch (error) {
      toast.error("Gửi đánh giá thất bại");
    }
  };

  useEffect(() => {
    setSelectedMediaIndex(0);
    setLightboxImageIndex(0);
  }, [product?.product_id, slug]);

  useEffect(() => {
    handleGetProduct();
  }, [slug]);

  useEffect(() => {
    loadReviews();
    getRatingSummary();
  }, [product?.product_id]);

  // Lưu sản phẩm đã xem vào localStorage
  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
    const filtered = viewed.filter((p) => p.product_id !== product.product_id);
    filtered.unshift({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      image_url: product.ProductImages?.[0]?.image_url || "",
    });
    if (filtered.length > 10) filtered.pop();
    localStorage.setItem("viewedProducts", JSON.stringify(filtered));
  }, [product]);

  const modelPath = useMemo(() => MODEL_MAP[slug] || null, [slug]);

  const mediaItems = useMemo(() => {
    const items =
      product?.ProductImages?.map((image, idx) => ({
        id: image.image_id ?? `img-${idx}`,
        type: "image",
        image,
      })) || [];

    if (modelPath) {
      items.push({
        id: `model-${slug}`,
        type: "model",
        label: "Xem 3D",
        modelPath,
      });
    }
    return items;
  }, [modelPath, product?.ProductImages]);

  const imageItems = useMemo(
    () => mediaItems.filter((item) => item.type === "image"),
    [mediaItems],
  );
  const safeSelectedIndex =
    selectedMediaIndex < mediaItems.length ? selectedMediaIndex : 0;
  const selectedMedia = mediaItems[safeSelectedIndex] || imageItems[0] || null;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Loading state
  if (!product)
    return (
      <MainLayout>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-gray-50 rounded-2xl h-[500px] animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-50 rounded-xl w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-50 rounded-xl w-1/2 animate-pulse" />
              <div className="h-14 bg-gray-50 rounded-xl w-2/3 animate-pulse mt-6" />
              <div className="h-40 bg-gray-50 rounded-xl animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-gold-600 transition-premium">
              Trang chủ
            </Link>
            <svg
              className="w-3.5 h-3.5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            {product.Category && (
              <>
                <Link
                  to={`/product-by-category/${encodeURIComponent(product.Category.category_name)}`}
                  className="hover:text-gold-600 transition-premium"
                >
                  {product.Category.category_name}
                </Link>
                <svg
                  className="w-3.5 h-3.5 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </>
            )}
            <span className="text-gray-600 font-medium truncate max-w-[250px]">
              {product.product_name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8">
        {/* ===== MAIN PRODUCT SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Left: Image Gallery */}
          <section className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              className={`relative bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group ${
                selectedMedia?.type === "image"
                  ? "cursor-zoom-in"
                  : "cursor-default"
              }`}
              onClick={() => {
                if (selectedMedia?.type !== "image") return;
                const targetIndex = imageItems.findIndex(
                  (item) => item.id === selectedMedia.id,
                );
                setLightboxImageIndex(targetIndex >= 0 ? targetIndex : 0);
                setIsLightboxOpen(true);
              }}
            >
              <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {selectedMedia?.type === "model" ? (
                  <ThreeDViewer modelPath={selectedMedia.modelPath} />
                ) : (
                  <>
                    <img
                      src={
                        selectedMedia?.image?.image_url ||
                        product.ProductImages?.[0]?.image_url ||
                        "http://cdn.pnj.io/images/thumbnails/485/485/detailed/47/sbxm00k000141-bong-tai-bac-pnjsilver.png"
                      }
                      alt={product.product_name}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-elegant">
                        <svg
                          className="w-5 h-5 text-gold-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Stock badge */}
              <div
                className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  product.quantity > 0
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${product.quantity > 0 ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
                />
                {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
              </div>
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mediaItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedMediaIndex(idx);
                      if (item.type === "image") {
                        const targetIndex = imageItems.findIndex(
                          (imgItem) => imgItem.id === item.id,
                        );
                        setLightboxImageIndex(
                          targetIndex >= 0 ? targetIndex : 0,
                        );
                      }
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      safeSelectedIndex === idx
                        ? "border-gold-500 shadow-elegant ring-2 ring-gold-200"
                        : "border-gray-200 hover:border-gold-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.image.image_url}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gold-gradient text-white font-bold text-xs flex items-center justify-center">
                        3D VIEW
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right: Product Info */}
          <section className="flex flex-col">
            {/* Category tag */}
            {product.Category && (
              <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-gold-50 text-gold-700 text-xs font-semibold mb-3 tracking-wide uppercase">
                {product.Category.category_name}
                {product.SubCategory &&
                  ` · ${product.SubCategory.subcategory_name}`}
              </span>
            )}

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight mb-4">
              {product.product_name}
            </h1>

            {/* Rating */}
            {reviewSummary && reviewSummary.total_reviews > 0 ? (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.round(reviewSummary.avg_rating || 0)
                          ? "text-gold-500"
                          : "text-gray-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Number(reviewSummary.avg_rating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({reviewSummary.total_reviews} đánh giá)
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mb-5">
                Chưa có đánh giá
              </p>
            )}

            {/* Price Section */}
            {product.quantity > 0 ? (
              <div className="bg-gradient-to-r from-gold-50 to-transparent rounded-2xl p-6 mb-6 border border-gold-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Giá bán
                </p>
                <p className="font-heading text-3xl sm:text-4xl font-bold text-gold-600 mb-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500">
                  Số lượng còn lại:{" "}
                  <span className="font-semibold text-green-600">
                    {product.quantity}
                  </span>{" "}
                  sản phẩm
                </p>
              </div>
            ) : (
              <div className="bg-red-50/50 rounded-2xl p-6 mb-6 border border-red-100">
                <p className="text-2xl font-bold text-red-500 font-heading">
                  Hết hàng
                </p>
                <p className="text-sm text-red-400 mt-1">
                  Sản phẩm này hiện không có sẵn
                </p>
              </div>
            )}

            {/* Benefit Items */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { title: "MIỄN PHÍ\nVẬN CHUYỂN", icon: "🚚" },
                { title: "PHỤC VỤ\n24/7", icon: "📞" },
                { title: "THU ĐỔI\n48H", icon: "🔄" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gold-50 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 whitespace-pre-line leading-tight">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-auto">
              {/* Mua ngay */}
              <button
                disabled={product.quantity === 0}
                className={`w-full font-bold rounded-xl py-4 transition-all duration-300 flex flex-col justify-center items-center gap-0.5 ${
                  product.quantity > 0
                    ? "bg-gold-gradient text-white shadow-elegant hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() =>
                  product.quantity > 0 && setIsBuyNowModalOpen(true)
                }
              >
                <span className="text-lg">Mua ngay</span>
                <span className="text-xs opacity-80">
                  Giao hàng miễn phí tận nhà
                </span>
              </button>

              {/* Giỏ hàng + Gọi ngay */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={product.quantity === 0}
                  onClick={() =>
                    product.quantity > 0 && setIsAddModalOpen(true)
                  }
                  className={`flex items-center justify-center gap-2 font-semibold rounded-xl py-3.5 transition-all duration-300 ${
                    product.quantity > 0
                      ? "border-2 border-gold-400 text-gold-700 hover:bg-gold-50"
                      : "border-2 border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <AiOutlineShoppingCart className="text-xl" />
                  <span>Giỏ hàng</span>
                </button>
                <a
                  href={product.quantity > 0 ? "tel:1900123456" : "#"}
                  className={`flex items-center justify-center gap-2 font-semibold rounded-xl py-3.5 transition-all duration-300 ${
                    product.quantity > 0
                      ? "bg-brand-dark text-white hover:bg-opacity-90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => product.quantity === 0 && e.preventDefault()}
                >
                  <AiOutlinePhone className="text-xl" />
                  <span>Gọi ngay</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* ===== SPECIFICATIONS SECTION ===== */}
        {product?.product_details &&
          typeof product.product_details === "string" &&
          (() => {
            try {
              const details = JSON.parse(product.product_details);
              if (!details || Object.keys(details).length === 0) return null;
              return (
                <div className="mb-12 bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-lg">
                      📦
                    </span>
                    Thông số kỹ thuật
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(details).map(([key, value], idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-card hover:border-gold-100 transition-all duration-300"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center text-base flex-shrink-0">
                          {["Loại đá", "Chất liệu", "Màu"].some((k) =>
                            key.includes(k),
                          )
                            ? "💎"
                            : ["Kích thước", "Cân nặng"].some((k) =>
                                  key.includes(k),
                                )
                              ? "⚖️"
                              : ["Phương pháp", "Bảo hành"].some((k) =>
                                    key.includes(k),
                                  )
                                ? "🛡️"
                                : "✦"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {key}
                          </p>
                          <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">
                            {String(value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } catch (e) {
              return null;
            }
          })()}

        {/* ===== TABS: Description / Policy / FAQ ===== */}
        <div className="mb-12">
          {/* Tab Buttons */}
          <div className="flex gap-1 bg-white rounded-t-2xl border border-b-0 border-gray-100 p-1.5">
            {[
              { key: "description", label: "Mô tả sản phẩm", icon: "📋" },
              { key: "policy", label: "Chính sách", icon: "🛡️" },
              { key: "faq", label: "Câu hỏi thường gặp", icon: "❓" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 font-semibold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-gold-gradient text-white shadow-elegant"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 shadow-card overflow-hidden">
            {isDescriptionVisible && (
              <div className="p-6 sm:p-8 max-w-4xl">
                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none
                    prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-800
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-li:text-gray-600
                    prose-strong:text-gray-800
                    prose-img:rounded-xl prose-img:shadow-card
                    prose-blockquote:border-l-4 prose-blockquote:border-gold-400 prose-blockquote:bg-gold-50/50 prose-blockquote:pl-4 prose-blockquote:italic
                    prose-a:text-gold-600 prose-a:font-medium
                    prose-hr:border-gray-100
                  "
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product?.description),
                    }}
                  />
                </div>
              </div>
            )}

            {isPolicyVisible && (
              <div className="p-6 sm:p-8">
                <div className="space-y-6 max-w-3xl">
                  {[
                    {
                      icon: "🚚",
                      title: "Chính sách giao hàng",
                      content:
                        "Miễn phí giao hàng trong 3 giờ cho các đơn hàng trong khu vực nội thành. Nếu giao trễ, tặng ngay voucher 100,000đ cho lần mua hàng tiếp theo.",
                    },
                    {
                      icon: "🔄",
                      title: "Chính sách đổi trả",
                      content:
                        "Áp dụng đổi 48 giờ đối với trang sức vàng và 72 giờ đối với trang sức bạc (chỉ đổi size). Tính từ lúc cửa hàng xuất hóa đơn hoặc khi khách hàng nhận được sản phẩm.",
                    },
                    {
                      icon: "💳",
                      title: "Phương thức thanh toán",
                      content: null,
                      list: [
                        "Thanh toán khi nhận hàng (COD)",
                        "Thanh toán qua VNPay",
                      ],
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="w-11 h-11 rounded-full bg-gold-50 flex items-center justify-center text-xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-heading text-base font-bold text-gray-800 mb-2">
                          {item.title}
                        </h4>
                        {item.content && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.content}
                          </p>
                        )}
                        {item.list && (
                          <ul className="text-sm text-gray-600 space-y-1.5 mt-1">
                            {item.list.map((li, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                                {li}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isFAQVisible && (
              <div className="p-6 sm:p-8">
                <div className="space-y-3 max-w-3xl">
                  {[
                    {
                      q: "Sản phẩm có bảo hành không?",
                      a: "Có, tất cả sản phẩm đều có bảo hành 1 năm từ ngày mua. Nếu có lỗi kỹ thuật, chúng tôi sẽ thay thế miễn phí.",
                    },
                    {
                      q: "Làm thế nào để kiểm tra tính chính hãng?",
                      a: "Tất cả sản phẩm của chúng tôi đều được nhập khẩu trực tiếp từ nhà sản xuất. Mỗi sản phẩm đều có giấy chứng nhận bảo hành chính hãng.",
                    },
                    {
                      q: "Có thể trả lại nếu không hài lòng không?",
                      a: "Có thể trả lại trong vòng 48 giờ từ khi nhận hàng với điều kiện sản phẩm còn nguyên vẹn và chưa qua sử dụng.",
                    },
                    {
                      q: "Giao hàng đến các tỉnh thành khác?",
                      a: "Có, chúng tôi giao hàng khắp các tỉnh thành trên cả nước. Chi phí vận chuyển sẽ được tính dựa trên khoảng cách.",
                    },
                  ].map((item, idx) => (
                    <details
                      key={idx}
                      className="border border-gray-100 rounded-xl overflow-hidden group bg-white hover:border-gold-200 transition-all duration-300"
                    >
                      <summary className="px-5 py-4 font-semibold text-sm text-gray-700 cursor-pointer flex items-center justify-between gap-3 hover:bg-gold-50/50 transition-premium">
                        <span>{item.q}</span>
                        <svg
                          className="w-4 h-4 text-gold-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
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
                      </summary>
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-lg">
                ⭐
              </span>
              Đánh giá sản phẩm
            </h2>
            {user && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 bg-gold-gradient text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-premium flex items-center gap-2 shadow-elegant"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                Viết đánh giá
              </button>
            )}
          </div>

          {reviewSummary &&
            (user?.role === "admin" || user?.role === "staff" ? (
              <ReviewSummaryAdmin summary={{ data: reviewSummary }} />
            ) : (
              <ReviewSummaryDetailed summary={{ data: reviewSummary }} />
            ))}

          {reviews && reviews.length > 0 && <ReviewTabs reviews={reviews} />}
        </section>

        {/* Similar Products Section */}
        {!errorSimilarProducts && (similarProducts.length > 0 || loadingSimilarProducts) && (
          <section className="py-12 px-4 sm:px-8 bg-white rounded-2xl">
            <div className="max-w-[1280px] mx-auto">
              {/* Section Title */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Sản phẩm tương tự
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  Khám phá những sản phẩm khác trong cùng danh mục
                </p>
              </div>

              {/* Similar Products Grid */}
              {loadingSimilarProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Spin size="large" tip="Đang tải sản phẩm tương tự..." />
                </div>
              ) : similarProducts.length === 0 ? (
                <Empty
                  description="Không có sản phẩm tương tự"
                  style={{ marginY: '40px' }}
                />
              ) : (
                <Row gutter={[24, 24]}>
                  {similarProducts.map((product) => (
                    <Col
                      key={product.product_id}
                      xs={{ span: 24 }}      // Mobile: 1 column
                      sm={{ span: 12 }}      // Tablet: 2 columns
                      md={{ span: 8 }}       // Laptop: 3 columns
                      lg={{ span: 6 }}       // Desktop: 4 columns
                    >
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </section>
        )}

        {/* Viewed Products */}
        <ViewedProducts />

        {/* ===== MODALS ===== */}
        {isReviewModalOpen && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmit={handleSubmitReview}
          />
        )}
        {isBuyNowModalOpen && (
          <AddToCartModal
            product={product}
            onClose={() => setIsBuyNowModalOpen(false)}
            onConfirm={handleBuyNow}
          />
        )}
        {isAddModalOpen && (
          <AddToCartModal
            product={product}
            onClose={() => setIsAddModalOpen(false)}
            onConfirm={handleAddToCart}
          />
        )}

        {/* Lightbox Viewer */}
        <LightboxViewer
          isOpen={isLightboxOpen}
          images={imageItems.map((item) => item.image)}
          currentIndex={lightboxImageIndex}
          zoom={lightboxZoom}
          rotate={lightboxRotate}
          onClose={() => {
            setIsLightboxOpen(false);
            setLightboxZoom(1);
            setLightboxRotate(0);
          }}
          onPrevImage={() =>
            setLightboxImageIndex((p) =>
              !imageItems.length ? 0 : p === 0 ? imageItems.length - 1 : p - 1,
            )
          }
          onNextImage={() =>
            setLightboxImageIndex((p) =>
              !imageItems.length ? 0 : p === imageItems.length - 1 ? 0 : p + 1,
            )
          }
          onSelectImage={(idx) => {
            setLightboxImageIndex(idx);
            setLightboxZoom(1);
            setLightboxRotate(0);
          }}
          onZoomIn={() => setLightboxZoom(Math.min(3, lightboxZoom + 0.2))}
          onZoomOut={() => setLightboxZoom(Math.max(0.5, lightboxZoom - 0.2))}
          onRotate={() => setLightboxRotate((prev) => (prev + 90) % 360)}
          onReset={() => {
            setLightboxZoom(1);
            setLightboxRotate(0);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
