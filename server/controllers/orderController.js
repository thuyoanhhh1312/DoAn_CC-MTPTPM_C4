import db from "../models/index.js";
const { Op } = db.Sequelize;

const includeOrderRelations = [
  {
    model: db.Customer,
    attributes: ["name", "email", "phone"],
  },
  {
    model: db.User,
    attributes: ["name"],
  },
  {
    model: db.Promotion,
    attributes: ["promotion_code"],
  },
  {
    model: db.OrderStatus,
    attributes: ["status_name", "color_code"],
  },
  {
    model: db.OrderItem,
    attributes: ["order_item_id", "quantity", "price", "total_price"],
    include: [
      {
        model: db.Product,
        attributes: ["product_name"],
      },
    ],
  },
];

export const getAllOrders = async (_req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: includeOrderRelations,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng.",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: includeOrderRelations,
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng.",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy chi tiết đơn hàng.",
    });
  }
};

export const updatedOrder = async (req, res) => {
  try {
    const { status_id } = req.body;
    const order = await db.Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng.",
      });
    }

    order.status_id = status_id;
    order.updated_at = new Date();
    await order.save();

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công.",
    });
  } catch (error) {
    console.error("updatedOrder error:", error);
    return res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
    });
  }
};

export const getOrderByCustomer = async (req, res) => {
  try {
    const customer = await db.Customer.findOne({
      where: { user_id: req.params.user_id },
      attributes: ["id"],
    });

    if (!customer) {
      return res.status(404).json({
        message: "Không tìm thấy khách hàng.",
      });
    }

    const orders = await db.Order.findAll({
      where: {
        customer_id: customer.id,
        [Op.or]: [
          { payment_method: { [Op.ne]: "vnpay" } },
          { status_id: { [Op.ne]: 1 } },
          { transaction_id: { [Op.not]: null } },
        ],
      },
      include: includeOrderRelations,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getOrderByCustomer error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy đơn hàng của khách hàng.",
    });
  }
};

export const getOrderByUserId = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      where: {
        user_id: req.params.user_id,
        [Op.or]: [
          { payment_method: { [Op.ne]: "vnpay" } },
          { status_id: { [Op.ne]: 1 } },
          { transaction_id: { [Op.not]: null } },
        ],
      },
      include: includeOrderRelations,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getOrderByUserId error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy đơn hàng theo user.",
    });
  }
};

export const updateIsDeposit = async (req, res) => {
  try {
    const { is_deposit, deposit_status, transaction_id, payment_details } =
      req.body;

    const order = await db.Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng.",
      });
    }

    if (typeof is_deposit === "boolean") {
      order.is_deposit = is_deposit;
    }

    if (deposit_status) {
      order.deposit_status = deposit_status;
    }

    if (transaction_id !== undefined) {
      order.transaction_id = transaction_id || null;
    }

    if (payment_details !== undefined) {
      order.payment_details = payment_details ?? null;
    }

    if (order.deposit_status === "paid") {
      order.is_deposit = true;
    }

    if (!order.is_deposit && order.deposit_status !== "none") {
      order.deposit_status = "none";
    }

    order.updated_at = new Date();
    await order.save();

    const updatedOrder = await db.Order.findByPk(order.order_id, {
      include: includeOrderRelations,
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái đặt cọc thành công.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("updateIsDeposit error:", error);
    return res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đặt cọc.",
    });
  }
};

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
      const product = products.find(
        (entry) => entry.product_id === item.product_id,
      );

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

export const checkout = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let committed = false;

  try {
    const {
      user_id = null,
      promotion_code = null,
      payment_method = null,
      shipping_address = null,
      is_deposit = false,
      items = [],
    } = req.body;

    let customer = await db.Customer.findOne({
      where: { user_id },
      transaction,
    });

    if (!customer) {
      const user = await db.User.findOne({
        where: { id: user_id },
        transaction,
      });

      if (!user) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Không tìm thấy người dùng với user_id đã cho.",
        });
      }

      const randomPhone = `0${Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("")}`;

      customer = await db.Customer.create(
        {
          user_id,
          name: user.name,
          email: user.email,
          phone: randomPhone,
          gender: null,
          address: null,
        },
        { transaction },
      );
    }

    const customer_id = customer.id ?? customer.customer_id;
    let deposit_status = req.body.deposit_status ?? "none";

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Danh sách sản phẩm không được để trống.",
      });
    }

    const productIds = items.map((item) => item.product_id);
    const products = await db.Product.findAll({
      where: { product_id: productIds },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (products.length !== productIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Một số sản phẩm không tồn tại trong hệ thống.",
      });
    }

    let sub_total = 0;
    for (const item of items) {
      const product = products.find(
        (entry) => entry.product_id === item.product_id,
      );

      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm có ID ${item.product_id} không tồn tại.`,
        });
      }

      if (product.quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm "${product.product_name}" không đủ số lượng trong kho (còn ${product.quantity}).`,
        });
      }

      sub_total += Number(product.price) * item.quantity;
    }

    let discount = 0;
    let promotion_id = null;

    if (promotion_code) {
      const promo = await db.Promotion.findOne({
        where: { promotion_code },
        include: [
          {
            model: db.PromotionCampaign,
            as: "campaign",
            attributes: ["start_date", "end_date", "is_active"],
            required: false,
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const now = new Date();
      const inCampaignWindow = promo?.campaign
        ? promo.campaign.is_active !== false &&
          promo.campaign.start_date <= now &&
          promo.campaign.end_date >= now
        : true;

      if (!promo || !inCampaignWindow) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.",
        });
      }

      if (
        promo.usage_limit !== null &&
        promo.usage_count >= promo.usage_limit
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Mã khuyến mãi đã hết lượt sử dụng.",
        });
      }

      const used = await db.PromotionUsage.findOne({
        where: {
          customer_id,
          promotion_id: promo.promotion_id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (used) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Bạn đã sử dụng mã này rồi.",
        });
      }

      discount = +(sub_total * (Number(promo.discount) / 100)).toFixed(2);
      promotion_id = promo.promotion_id;
    }

    let total = sub_total - discount;
    if (total < 0) total = 0;

    let deposit = 0;
    if (is_deposit) {
      deposit = Number((total * 0.1).toFixed(2));
      if (!["pending", "paid", "none"].includes(deposit_status)) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Trạng thái đặt cọc không hợp lệ.",
        });
      }
    } else {
      deposit_status = "none";
    }

    const order = await db.Order.create(
      {
        customer_id,
        user_id,
        promotion_id,
        status_id: 1,
        sub_total,
        discount,
        total,
        deposit,
        is_deposit,
        deposit_status,
        shipping_address,
        payment_method,
        transaction_id: null,
        payment_details: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction },
    );

    await db.OrderItem.bulkCreate(
      items.map((item) => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.quantity * item.price,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      { transaction },
    );

    // Luong VNPay: khong tru kho o buoc checkout.
    // Kho chi duoc tru sau khi callback VNPay thanh cong.

    if (promotion_id) {
      await db.Promotion.update(
        {
          usage_count: db.Sequelize.literal("usage_count + 1"),
        },
        {
          where: { promotion_id },
          transaction,
        },
      );

      await db.PromotionUsage.create(
        {
          customer_id,
          promotion_id,
          order_id: order.order_id,
          used_at: new Date(),
        },
        { transaction },
      );
    }

    await transaction.commit();
    committed = true;

    const createdOrder = await db.Order.findOne({
      where: { order_id: order.order_id },
      include: includeOrderRelations,
    });

    return res.status(201).json({
      message: "Tạo đơn hàng thành công.",
      order: createdOrder,
    });
  } catch (error) {
    if (!committed) {
      await transaction.rollback();
    }
    console.error("checkout error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi tạo đơn hàng.",
    });
  }
};
