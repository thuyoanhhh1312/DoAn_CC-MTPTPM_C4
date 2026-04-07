import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const filterProducts = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/products/filter`, { params });
    return response.data;
  } catch (error) {
    console.error("Error filtering products:", error);
    throw error;
  }
};
const getProducts = async (keyword = "") => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      params: { keyword },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getProductWithReviewSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/with-review-summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Tạo một sản phẩm mới
const createProduct = async (
  productName,
  description,
  price,
  quantity,
  categoryId,
  subcategoryId,
  images = [],
  accessToken,
  isActive = false,
) => {
  try {
    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("category_id", categoryId);
    formData.append("subcategory_id", subcategoryId);
    formData.append("is_active", isActive); // ✅ gửi trạng thái

    // Thêm tất cả ảnh
    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await axiosInstance.post(`${API_URL}/products`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error; // Đảm bảo lỗi được ném ra để xử lý ở nơi gọi
  }
};

const getProductBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_URL}/get-product-by-slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    throw error;
  }
};

// // Cập nhật sản phẩm
// const updateProduct = async (
//   id,
//   productName,
//   description,
//   price,
//   quantity,
//   categoryId,
//   subcategoryId,
//   imageUrl,
//   isActive,
// ) => {
//   try {
//     const response = await axiosInstance.put(`${API_URL}/products/${id}`, {
//       product_name: productName,
//       description: description,
//       price: price,
//       quantity: quantity,
//       category_id: categoryId,
//       subcategory_id: subcategoryId,
//       is_active: isActive,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error updating product:', error);
//     throw error; // Đảm bảo lỗi được ném ra để xử lý ở nơi gọi
//   }
// };
// Thay thế hàm updateProduct hiện tại bằng hàm nhận FormData

const updateProduct = async (id, formData, accessToken) => {
  try {
    const safeToken = encodeURIComponent(accessToken);
    const response = await axiosInstance.put(
      `${API_URL}/products/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          //'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Xóa sản phẩm
const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error; // Đảm bảo lỗi được ném ra để xử lý ở nơi gọi
  }
};
// lấy sản phẩm tương tự theo category_id

// API call for similar products
const getSimilarProducts = async (categoryId, subcategoryId) => {
  try {
    const response = await axios.get(`${API_URL}/products/similar`, {
      params: { category_id: categoryId, subcategory_id: subcategoryId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching similar products:", error);
    throw error;
  }
};

//Lấy danh sách đánh giá sản phẩm
const getProductReviews = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}/reviews`, id);
    return response.data;
  } catch (error) {
    console.error("Error fetching product review:", error);
    throw error;
  }
};

// Thêm đánh giá mới cho sản phẩm
const addProductReview = async (productId, reviewData, accessToken) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/products/${productId}/reviews`,
      {
        user_id: reviewData?.user_id,
        rating: reviewData?.rating,
        content: reviewData?.content,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product review:", error);
    throw error;
  }
};

const getProductReviewSummary = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/products/${productId}/reviews/summary`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product review summary:", error);
    throw error;
  }
};

const getProductReviewSummaryDetailed = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/products/${productId}/reviews/summary-detailed`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product review summary detailed:", error);
    throw error;
  }
};

// PUBLIC: Lấy tóm tắt đánh giá công khai (chỉ rating)
const getProductReviewSummaryPublic = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/products/${productId}/reviews/summary-public`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product review summary (public):", error);
    throw error;
  }
};

// ADMIN: Lấy tóm tắt đánh giá quản lý (sentiment + rating + suspicious)
const getProductReviewSummaryAdmin = async (productId, accessToken) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/products/${productId}/reviews/summary`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product review summary (admin):", error);
    throw error;
  }
};

const searchProduct = async ({
  keyword = "",
  categoryId = null,
  subcategoryId = null,
  priceMin = null,
  priceMax = null,
  ratingMax = null,
  limit = 20,
  page = 1,
  sortField = "product_name",
  sortOrder = "ASC",
}) => {
  try {
    const params = {};

    if (keyword) params.keyword = keyword;
    if (categoryId) params.category = categoryId;
    if (subcategoryId) params.subcategory = subcategoryId;
    if (priceMin !== null) params.price_min = priceMin;
    if (priceMax !== null) params.price_max = priceMax;
    if (ratingMax !== null) params.rating_max = ratingMax;
    if (limit) params.limit = limit;
    if (page) params.page = page;
    if (sortField) params.sort_field = sortField;
    if (sortOrder) params.sort_order = sortOrder;

    const response = await axios.get(`${API_URL}/search-product`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

const quickSearchProducts = async (keyword, limit = 8) => {
  try {
    const res = await axios.get(`${API_URL}/quick-search-products`, {
      params: { keyword, limit },
    });
    return res.data.data;
  } catch (error) {
    console.error("Quick Search API error:", error);
    return [];
  }
};

const getProductsByCategory = async (categoryName) => {
  try {
    const response = await axios.get(`${API_URL}/product-by-category`, {
      params: {
        category_name: categoryName,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

// Get products by category with pagination (new API)
const getProductsByCategoryWithPagination = async (categoryId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/product-by-category`, {
      params: {
        categoryId,
        page,
        limit,
      },
    });
    // New API returns { code, data: { items, total, page, limit } }
    return response.data;
  } catch (error) {
    console.error("Error fetching products by category with pagination:", error);
    throw error;
  }
};

const getCategoriesWithSubCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-category-subcategory`); // API trả về danh sách category kèm theo SubCategories
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    throw error;
  }
};

const getTopRatedProductsBySentiment = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/get-product-top-rated-by-sentiment`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top rated products by sentiment:", error);
    throw error;
  }
};

// ✅ TOXIC REVIEW ADMIN ENDPOINTS
const getToxicReviewsPending = async (status = "pending", page = 1, limit = 10, sort = "-created_at") => {
  try {
    const response = await axiosInstance.get(`${API_URL}/admin/toxic-reviews`, {
      params: { status, page, limit, sort },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching toxic reviews:", error);
    throw error;
  }
};

const getToxicReviewDetail = async (reviewId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/admin/toxic-reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching toxic review detail:", error);
    throw error;
  }
};

const approveToxicReview = async (reviewId, note = "") => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/admin/toxic-reviews/${reviewId}/approve`, {
      note,
    });
    return response.data;
  } catch (error) {
    console.error("Error approving toxic review:", error);
    throw error;
  }
};

const rejectToxicReview = async (reviewId, note = "") => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/admin/toxic-reviews/${reviewId}/reject`, {
      note,
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting toxic review:", error);
    throw error;
  }
};

const bulkUpdateToxicReviews = async (reviewIds, action, note = "") => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/admin/toxic-reviews/bulk-update`, {
      review_ids: reviewIds,
      action,
      note,
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk updating toxic reviews:", error);
    throw error;
  }
};

const getToxicReviewStats = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/admin/toxic-reviews/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching toxic review stats:", error);
    throw error;
  }
};

const getHighestScoringToxicReviews = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/admin/toxic-reviews/highest-score`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching highest scoring toxic reviews:", error);
    throw error;
  }
};

// ✅ SENTIMENT LABELING ENDPOINTS
const adminLabelSentiment = async (reviewId, sentiment) => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/admin/reviews/${reviewId}/label-sentiment`, {
      sentiment,
    });
    return response.data;
  } catch (error) {
    console.error("Error labeling sentiment:", error);
    throw error;
  }
};

const bulkLabelSentiment = async (reviewIds, sentiment) => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/admin/reviews/bulk-label-sentiment`, {
      review_ids: reviewIds,
      sentiment,
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk labeling sentiment:", error);
    throw error;
  }
};

// Xuất các phương thức để sử dụng ở nơi khác
export default {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  getProductReviews,
  addProductReview,
  getProductReviewSummary,
  getProductReviewSummaryDetailed,
  getProductReviewSummaryPublic,
  getProductReviewSummaryAdmin,
  searchProduct,
  getProductWithReviewSummary,
  getProductsByCategory,
  getProductsByCategoryWithPagination,
  filterProducts,
  getCategoriesWithSubCategories,
  quickSearchProducts,
  getProductBySlug,
  getTopRatedProductsBySentiment,
  // Toxic Review APIs
  getToxicReviewsPending,
  getToxicReviewDetail,
  approveToxicReview,
  rejectToxicReview,
  bulkUpdateToxicReviews,
  getToxicReviewStats,
  getHighestScoringToxicReviews,
  // Sentiment Labeling APIs
  adminLabelSentiment,
  bulkLabelSentiment,
};
