import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import categoryApi from "../../../api/categoryApi";
import QuickSearchPopup from "../../QuickSearchPopup";

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [openQuickSearch, setOpenQuickSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách category:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setOpenQuickSearch(false);
  }, [location.pathname, location.search]);

  const handleCategoryClick = (categoryId) => {
    if (!categoryId) return;
    navigate(`/category/${categoryId}`);
  };

  const handlePromotionClick = () => navigate("/promotions");
  const handleNewsClick = () => navigate("/news");
  const isActive = (pathPrefix) => location.pathname.startsWith(pathPrefix);

  const navLinkBase =
    "relative px-1 py-2 text-[15px] font-medium tracking-wide transition-premium";
  const navLinkActive = "text-gold-600";
  const navLinkDefault = "text-gray-700 hover:text-gold-600";

  return (
    <nav className="flex items-center justify-center gap-8">
      {/* Menu Trang Sức */}
      <div className="group relative">
        <button
          className={`${navLinkBase} ${isActive("/category") ? navLinkActive : navLinkDefault} flex items-center gap-1`}
        >
          Trang Sức
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180"
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
          {/* Active indicator line */}
          <span
            className={`absolute bottom-0 left-0 h-[2px] bg-gold-gradient transition-all duration-300 ${isActive("/category") ? "w-full" : "w-0 group-hover:w-full"}`}
          />
        </button>
        {/* Dropdown */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-4 min-w-[200px] max-h-[350px] overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-2">
              Chủng loại
            </h3>
            {loadingCategories ? (
              <div className="px-2 py-3 text-sm text-gray-400">Đang tải...</div>
            ) : (
              <ul className="space-y-0.5">
                {categories.length === 0 && (
                  <li className="px-2 py-2 text-sm text-gray-400">
                    Chưa có danh mục
                  </li>
                )}
                {categories.map((cat) => (
                  <li
                    key={cat.id || cat.category_id}
                    className="px-3 py-2 rounded-xl cursor-pointer text-sm text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-premium"
                    onClick={() =>
                      handleCategoryClick(cat.category_id || cat.id)
                    }
                  >
                    {cat.category_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Tin Tức */}
      <div className="group relative">
        <button
          className={`${navLinkBase} ${isActive("/news") ? navLinkActive : navLinkDefault} flex items-center gap-1`}
        >
          Tin Tức
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180"
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
          <span
            className={`absolute bottom-0 left-0 h-[2px] bg-gold-gradient transition-all duration-300 ${isActive("/news") ? "w-full" : "w-0 group-hover:w-full"}`}
          />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-2 min-w-[160px]">
            <div
              onClick={handleNewsClick}
              className="px-3 py-2.5 rounded-xl cursor-pointer text-sm text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-premium"
            >
              Blog
            </div>
          </div>
        </div>
      </div>

      {/* Khuyến Mãi */}
      <button
        onClick={handlePromotionClick}
        className={`${navLinkBase} ${isActive("/promotions") ? navLinkActive : navLinkDefault}`}
      >
        Khuyến Mãi
        <span
          className={`absolute bottom-0 left-0 h-[2px] bg-gold-gradient transition-all duration-300 ${isActive("/promotions") ? "w-full" : "w-0 hover:w-full"}`}
        />
      </button>

      {/* Search bar */}
      <div className="relative">
        <button
          className="flex items-center gap-2 h-[38px] w-[280px] rounded-full bg-gray-50 border border-gray-200 px-4 text-left text-sm text-gray-400 hover:border-gold-300 hover:bg-gold-50/50 transition-premium focus:outline-none focus:ring-2 focus:ring-gold-300"
          onClick={() => setOpenQuickSearch(true)}
        >
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span>Tìm kiếm sản phẩm...</span>
        </button>
        <QuickSearchPopup
          open={openQuickSearch}
          onClose={() => setOpenQuickSearch(false)}
        />
      </div>
    </nav>
  );
};

export default Header;
