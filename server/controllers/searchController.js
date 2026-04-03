import { Op, fn, col, Sequelize } from "sequelize";
import db from "../models/index.js";

export const searchProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      price_min,
      price_max,
      rating_max, // rating trung bình <= rating_max
      keyword,
      limit = 20,
      page = 1,
      sort_field = "product_name",
      sort_order = "ASC",
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereProduct = {};

    if (category) {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) whereProduct.category_id = catId;
    }

    if (subcategory) {
      const subcatId = parseInt(subcategory, 10);
      if (!isNaN(subcatId)) whereProduct.subcategory_id = subcatId;
    }

    if (price_min || price_max) {
      whereProduct.price = {};
      if (price_min) {
        const min = parseFloat(price_min);
        if (!isNaN(min)) whereProduct.price[Op.gte] = min;
      }
      if (price_max) {
        const max = parseFloat(price_max);
        if (!isNaN(max)) whereProduct.price[Op.lte] = max;
      }
    }

    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      whereProduct[Op.or] = [
        { product_name: { [Op.like]: `%${kw}%` } },
      ];
    }

    let havingCondition = undefined;
    if (rating_max) {
      const ratingMaxNum = parseFloat(rating_max);
      if (!isNaN(ratingMaxNum)) {
        havingCondition = Sequelize.where(
          fn("AVG", col("ProductReviews.rating")),
          { [Op.lte]: ratingMaxNum }
        );
      }
    }

    const validSortFields = ["product_name", "price", "avgRating"];
    const orderField = validSortFields.includes(sort_field) ? sort_field : "product_name";
    const orderDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const products = await db.Product.findAndCountAll({
      where: whereProduct,
      attributes: {
        include: [
          [fn("AVG", col("ProductReviews.rating")), "avgRating"],
          [fn("COUNT", col("ProductReviews.review_id")), "totalReviews"],
          [
            fn(
              "SUM",
              Sequelize.literal(`CASE WHEN ProductReviews.sentiment = 'POS' THEN 1 ELSE 0 END`)
            ),
            "positiveCount",
          ],
        ],
      },
      include: [
        {
          model: db.ProductReview,
          attributes: [],
          required: rating_max ? true : false,
        },
        {
          model: db.Category,
          attributes: ["category_id", "category_name"],
        },
        {
          model: db.SubCategory,
          attributes: ["subcategory_id", "subcategory_name"],
        },
        {
          model: db.ProductImage,
          attributes: ["image_id", "image_url", "is_main"],
          where: { is_main: true },
          required: false,
        },
      ],
      group: [
        "Product.product_id",
        "Category.category_id",
        "SubCategory.subcategory_id",
        "ProductImages.image_id",
      ],
      having: havingCondition,
      order: [[orderField, orderDirection]],
      limit: parsedLimit,
      offset,
      subQuery: false,
      distinct: true,
    });

    let totalCount;
    if (Array.isArray(products.count)) {
      totalCount = products.count.length;
    } else {
      totalCount = products.count;
    }

    res.json({
      data: products.rows,
      pagination: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const quickSearchProducts = async (req, res) => {
  try {
    const { keyword = "", limit = 8, sort_by = "product_name" } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 8, 20);
    const keywordTrimmed = keyword.trim();

    if (!keywordTrimmed) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    const validSortFields = ["product_name", "avg_rating"];
    const orderField = validSortFields.includes(sort_by) ? sort_by : "product_name";

    let orderDirection = "ASC";
    if (orderField === "avg_rating") {
      orderDirection = "DESC";
    }

    const products = await db.Product.findAll({
      where: {
        product_name: {
          [Op.like]: `%${keywordTrimmed}%`,
        },
      },
      attributes: [
        "product_id",
        "product_name",
        "price",
        "slug",
        [fn("AVG", col("ProductReviews.rating")), "avg_rating"],
      ],
      include: [
        {
          model: db.ProductImage,
          attributes: ["image_url"],
          where: { is_main: true },
          required: false,
        },
        {
          model: db.Category,
          attributes: ["category_name"],
        },
        {
          model: db.SubCategory,
          attributes: ["subcategory_name"],
        },
        {
          model: db.ProductReview,
          attributes: [],
          required: false,
        },
      ],
      group: [
        "Product.product_id",
        "Category.category_id",
        "SubCategory.subcategory_id",
        "ProductImages.image_id",
      ],
      limit: parsedLimit,
      order: [[orderField, orderDirection]],
      distinct: true,
      subQuery: false,
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    return res.json({ data: products });
  } catch (error) {
    console.error("Error in quickSearchProducts:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
