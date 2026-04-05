import db from "../models/index.js";

export const calculatePrice = async (req, res) => {
  try {
    const { items, promotion_code, user_id } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Danh sách sản phẩm không được để trống.",
      });
    }

    const customer = await db.Customer.findOne({
      where: { user_id },
      attributes: ["id", "segment_type"],
    });

    if (!customer) {
      return res.status(400).json({
        message: "Không tìm thấy khách hàng với user_id đã cho.",
      });
    }

    const productIds = items.map((item) => item.product_id);
    const products = await db.Product.findAll({
      where: { product_id: productIds },
      attributes: ["product_id", "product_name", "price", "quantity"],
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "Một số sản phẩm không tồn tại trong hệ thống.",
      });
    }

    let sub_total = 0;

    for (const item of items) {
      const product = products.find((entry) => entry.product_id === item.product_id);

      if (!product) {
        return res.status(400).json({
          message: `Sản phẩm có ID ${item.product_id} không tồn tại.`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${product.product_name}" không đủ số lượng trong kho (còn ${product.quantity}).`,
        });
      }

      sub_total += Number(product.price) * item.quantity;
    }

    let discount = 0;
    let valid = false;
    let message = "Không có mã khuyến mãi áp dụng.";
    let promoInfo = null;

    if (promotion_code) {
      const normalizedCode = promotion_code.trim();
      const promo = await db.Promotion.findOne({
        where: { promotion_code: normalizedCode },
        include: [
          {
            model: db.PromotionCampaign,
            as: "campaign",
            attributes: ["start_date", "end_date", "is_active"],
            required: false,
          },
        ],
      });

      const now = new Date();
      const inCampaignWindow = promo?.campaign
        ? promo.campaign.is_active !== false &&
          promo.campaign.start_date <= now &&
          promo.campaign.end_date >= now
        : true;

      const segmentMatched =
        !promo?.segment_target ||
        promo.segment_target === customer.segment_type;

      if (!promo || !inCampaignWindow) {
        message = "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.";
      } else if (!segmentMatched) {
        message = "Mã khuyến mãi không áp dụng cho tài khoản của bạn.";
      } else if (
        promo.usage_limit !== null &&
        promo.usage_count >= promo.usage_limit
      ) {
        message = "Mã khuyến mãi đã hết lượt sử dụng.";
      } else {
        const used = await db.PromotionUsage.findOne({
          where: {
            customer_id: customer.id,
            promotion_id: promo.promotion_id,
          },
          attributes: ["id"],
        });

        if (used) {
          message = "Bạn đã sử dụng mã này rồi.";
        } else {
          discount = sub_total * (Number(promo.discount) / 100);
          valid = true;
          message = `Mã khuyến mãi hợp lệ, giảm ${promo.discount}% (${discount.toLocaleString("vi-VN")} đ).`;
          promoInfo = {
            promotion_id: promo.promotion_id,
            promotion_code: promo.promotion_code,
            description: promo.description,
            discount_percent: promo.discount,
          };
        }
      }
    }

    let total = sub_total - discount;
    if (total < 0) total = 0;

    return res.json({
      sub_total,
      discount,
      total,
      valid,
      message,
      promotion: promoInfo,
    });
  } catch (error) {
    console.error("calculatePrice error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi tính toán giá.",
    });
  }
};
