import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ui/product/productCard";
import {
  Pagination,
  Drawer,
  CircularProgress
} from "@mui/material";
import ReactStars from "react-rating-stars-component";
import categoryApi from "../api/categoryApi";
import subcategoryApi from "../api/subCategoryApi";
import productApi from "../api/productApi";

const sortOptions = [
  { name: "Mặc định", value: "default" },
  { name: "Giá: Thấp đến Cao", value: "price_asc" },
  { name: "Giá: Cao đến Thấp", value: "price_desc" },
  { name: "Đánh giá: Cao đến Thấp", value: "rating_desc" },
];

const SidebarFilter = ({
  categories,
  filteredSubcategories,
  tempFilters,
  updateTempFilter,
  applyFilters,
  onClose,
  isMobile
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <h3 className="font-heading text-lg font-bold text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Bộ lọc
      </h3>
      {isMobile && (
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto pr-2 space-y-6 flex-col custom-scrollbar">
      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">Chủng loại</label>
        <select
          value={tempFilters.category || ""}
          onChange={(e) => updateTempFilter("category", e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-gold-200 focus:border-gold-400 block px-4 py-2.5 outline-none transition-all"
        >
          <option value="">Tất cả</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      {/* Sub Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">Chủng loại con</label>
        <select
          value={tempFilters.subcategory || ""}
          onChange={(e) => updateTempFilter("subcategory", e.target.value ? Number(e.target.value) : null)}
          disabled={!tempFilters.category}
          className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-gold-200 focus:border-gold-400 block px-4 py-2.5 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Tất cả</option>
          {filteredSubcategories.map((subcat) => (
            <option key={subcat.subcategory_id} value={subcat.subcategory_id}>
              {subcat.subcategory_name}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">Đánh giá tối thiểu</label>
        <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 inline-block">
          <ReactStars
            count={5}
            size={24}
            activeColor="#c48c46"
            value={tempFilters.rating}
            isHalf={false}
            onChange={(newRating) => updateTempFilter("rating", newRating)}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">Sắp xếp theo</label>
        <select
          value={tempFilters.sort.value}
          onChange={(e) => {
            const selectedSort = sortOptions.find((so) => so.value === e.target.value);
            updateTempFilter("sort", selectedSort || sortOptions[0]);
          }}
          className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-gold-200 focus:border-gold-400 block px-4 py-2.5 outline-none transition-all"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="pt-6 mt-4 border-t border-gray-100">
      <button
        onClick={applyFilters}
        className="w-full bg-gold-gradient text-white rounded-xl py-3 px-4 font-semibold text-sm hover:opacity-90 shadow-elegant transition-all duration-300"
      >
        Áp dụng bộ lọc
      </button>
    </div>
  </div>
);

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    category: null,
    subcategory: null,
    rating: 0,
    sort: sortOptions[0],
    keyword: "",
    page: 1,
    limit: 16,
  });

  const [tempFilters, setTempFilters] = useState(filters);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(console.error);
    subcategoryApi.getSubCategories().then(setSubcategories).catch(console.error);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const urlCategory = searchParams.get("category");
    const urlSubcategory = searchParams.get("subcategory");
    const urlRating = parseInt(searchParams.get("rating") || "0", 10);
    const urlSortValue = searchParams.get("sort") || "default";
    const urlKeyword = searchParams.get("keyword") || "";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);

    const sortObj = sortOptions.find((so) => so.value === urlSortValue) || sortOptions[0];

    const newFilters = {
      category: urlCategory ? Number(urlCategory) : null,
      subcategory: urlSubcategory ? Number(urlSubcategory) : null,
      rating: isNaN(urlRating) ? 0 : urlRating,
      sort: sortObj,
      keyword: urlKeyword,
      page: isNaN(urlPage) ? 1 : urlPage,
      limit: 16,
    };

    setFilters(newFilters);
    setTempFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    // Luôn luôn load products kể cả khi keyword rỗng để hiển thị nếu filter bằng danh mục
    async function loadProducts() {
      setLoading(true);
      try {
        let sortField = "product_name";
        let sortOrder = "ASC";

        switch (filters.sort.value) {
          case "price_asc":
            sortField = "price";
            sortOrder = "ASC";
            break;
          case "price_desc":
            sortField = "price";
            sortOrder = "DESC";
            break;
          case "rating_desc":
            sortField = "avg_rating";
            sortOrder = "DESC";
            break;
          default:
            sortField = "product_name";
            sortOrder = "ASC";
        }

        const res = await productApi.searchProduct({
          keyword: filters.keyword,
          categoryId: filters.category,
          subcategoryId: filters.subcategory,
          ratingMax: filters.rating > 0 ? filters.rating : null,
          limit: filters.limit,
          page: filters.page,
          sortField,
          sortOrder,
        });

        const safeProducts = res.data.map((product) => ({
          ...product,
          ProductImages: Array.isArray(product.ProductImages) ? product.ProductImages : [],
        }));

        setProducts(safeProducts);
        setTotalProducts(res.pagination?.total || safeProducts.length);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadProducts();
    window.scrollTo(0, 0);
  }, [filters]);

  const filteredSubcategories = tempFilters.category
    ? subcategories.filter((sc) => sc.category_id === Number(tempFilters.category))
    : subcategories;

  const updateTempFilter = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "category" ? { subcategory: null } : {}),
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, ...tempFilters, page: 1 }));

    const params = new URLSearchParams();
    if (tempFilters.keyword) params.set("keyword", tempFilters.keyword);
    if (tempFilters.category) params.set("category", tempFilters.category);
    if (tempFilters.subcategory) params.set("subcategory", tempFilters.subcategory);
    if (tempFilters.rating > 0) params.set("rating", tempFilters.rating.toString());
    if (tempFilters.sort && tempFilters.sort.value !== "default") {
      params.set("sort", tempFilters.sort.value);
    }
    params.set("page", "1");

    navigate(`/search?${params.toString()}`, { replace: true });
    if (isMobile) setDrawerOpen(false);
  };

  const onPageChange = (e, pageNum) => {
    if (pageNum < 1 || pageNum > Math.ceil(totalProducts / filters.limit)) return;
    const params = new URLSearchParams(location.search);
    params.set("page", pageNum.toString());
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  return (
    <MainLayout>
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-800">
                {filters.keyword ? (
                  <>Tìm kiếm cho: <span className="text-gold-600">"{filters.keyword}"</span></>
                ) : (
                  "Tất cả sản phẩm"
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Tìm thấy <span className="font-semibold text-gray-800">{totalProducts}</span> sản phẩm phù hợp
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 font-semibold text-sm hover:border-gold-300 transition-colors"
              >
                <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Mở bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 min-h-[60vh]">
        <div className="flex gap-8 relative items-start">
          {/* Sidebar */}
          {!isMobile ? (
            <aside className="w-[300px] flex-shrink-0 sticky top-24 h-[calc(100vh-120px)]">
              <SidebarFilter
                categories={categories}
                filteredSubcategories={filteredSubcategories}
                tempFilters={tempFilters}
                updateTempFilter={updateTempFilter}
                applyFilters={applyFilters}
                isMobile={false}
              />
            </aside>
          ) : (
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <div className="w-[320px] h-full p-4">
                <SidebarFilter
                  categories={categories}
                  filteredSubcategories={filteredSubcategories}
                  tempFilters={tempFilters}
                  updateTempFilter={updateTempFilter}
                  applyFilters={applyFilters}
                  onClose={() => setDrawerOpen(false)}
                  isMobile={true}
                />
              </div>
            </Drawer>
          )}

          {/* Main Content */}
          <main className="flex-1 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CircularProgress sx={{ color: "#c48c46" }} />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalProducts > filters.limit && (
                  <div className="flex justify-center mt-12 mb-4">
                    <Pagination
                      count={Math.ceil(totalProducts / filters.limit)}
                      page={filters.page}
                      onChange={onPageChange}
                      shape="rounded"
                      size={isMobile ? "small" : "large"}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontWeight: 600,
                          color: "#4b5563",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          margin: "0 4px",
                          "&:hover": {
                            backgroundColor: "#f9fafb",
                            borderColor: "#d1d5db"
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#c48c46",
                            color: "white",
                            borderColor: "#c48c46",
                            "&:hover": {
                              backgroundColor: "#b37b35"
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center pt-16 pb-24 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 mb-6 rounded-full bg-gold-50 flex flex-col items-center justify-center text-gold-400">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Rất tiếc, không có sản phẩm nào phù hợp với bộ lọc hiện tại của bạn.
                  Hãy thử sử dụng từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc.
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;