import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const SUSPENDED_TOKEN_MARKER = "__ACCOUNT_SUSPENDED__";

const generateFallbackPhone = () => {
  const suffix = String(Date.now()).slice(-9);
  return `0${suffix.padStart(9, "0")}`;
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await db.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tìm thấy" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy khách hàng", error: err.message });
  }
};

export const getCustomerEmails = async (req, res) => {
  try {
    const { keyword } = req.query;
    const where = {};

    if (keyword && keyword.trim() !== "") {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const customers = await db.Customer.findAll({
      attributes: ["customer_id", "name", "email", "segment_type"],
      where,
      include: [
        {
          model: db.User,
          attributes: [],
          where: { role_id: 2 },
          required: true,
        },
      ],
      order: [["name", "ASC"]],
      limit: 500,
    });

    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách email khách hàng",
      error: err.message,
    });
  }
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await db.Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tìm thấy" });
    }

    const user = await db.User.findByPk(customer.user_id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Người dùng liên kết không tồn tại" });
    }

    if (user.refresh_token === SUSPENDED_TOKEN_MARKER) {
      return res.status(200).json({
        message: "Tài khoản khách hàng đã ở trạng thái dừng hoạt động",
      });
    }

    user.refresh_token = SUSPENDED_TOKEN_MARKER;
    await user.save();

    res.status(200).json({
      message: "Đã dừng hoạt động tài khoản khách hàng",
    });
  } catch (err) {
    res.status(400).json({
      message: "Lỗi khi dừng tài khoản khách hàng",
      error: err.message,
    });
  }
};

export const getAllCustomers = async (req, res) => {
  const { keyword } = req.query;

  try {
    let whereClause = {};
    if (keyword && keyword.trim() !== "") {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
          { gender: { [Op.like]: `%${keyword}%` } },
          { address: { [Op.like]: `%${keyword}%` } },
        ],
      };
    }

    const customers = await db.Customer.findAll({
      where: whereClause,
      attributes: {
        include: [
          [fn("COUNT", col("Orders.order_id")), "orderCount"],
          [fn("COALESCE", fn("SUM", col("Orders.total")), 0), "totalOrderAmount"],
          [
            literal(`(
              SELECT COUNT(*) FROM product_review AS pr
              WHERE pr.customer_id = Customer.customer_id AND pr.sentiment = 'POS'
            )`),
            "positiveReviewCount",
          ],
          [
            literal(`(
              SELECT COUNT(*) FROM product_review AS pr
              WHERE pr.customer_id = Customer.customer_id AND pr.sentiment = 'NEG'
            )`),
            "negativeReviewCount",
          ],
          [
            literal(`(
              SELECT COUNT(*) FROM product_review AS pr
              WHERE pr.customer_id = Customer.customer_id AND pr.sentiment = 'NEU'
            )`),
            "neutralReviewCount",
          ],
        ],
      },
      include: [
        {
          model: db.Order,
          attributes: [],
          required: false,
        },
      ],
      group: ["Customer.customer_id"],
      order: [["customer_id", "ASC"]],
      raw: true,
    });

    return res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách khách hàng",
      error: err.message,
    });
  }
};

export const updateCustomerProfile = async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  const {
    fullName,
    name,
    phone,
    gender,
    address,
    birthday,
    password,
  } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Không xác định được người dùng" });
  }

  const normalizedName = fullName ?? name;
  const normalizedGender = gender === "" ? null : gender;
  const normalizedAddress = address === "" ? null : address;
  const normalizedBirthday = birthday === "" ? null : birthday;

  const t = await db.sequelize.transaction();

  try {
    const user = await db.User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    let customer = await db.Customer.findOne({
      where: { user_id: userId },
      transaction: t,
    });

    if (!customer) {
      customer = await db.Customer.create(
        {
          user_id: userId,
          name: normalizedName || user.name,
          email: user.email,
          phone: phone || generateFallbackPhone(),
          gender: normalizedGender,
          address: normalizedAddress,
          birthday: normalizedBirthday,
        },
        { transaction: t },
      );
    } else {
      if (normalizedName !== undefined) customer.name = normalizedName;
      if (phone !== undefined) customer.phone = phone;
      if (gender !== undefined) customer.gender = normalizedGender;
      if (address !== undefined) customer.address = normalizedAddress;
      if (birthday !== undefined) customer.birthday = normalizedBirthday;

      await customer.save({ transaction: t });
    }

    if (normalizedName !== undefined) {
      user.name = normalizedName;
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    if (normalizedName !== undefined || password) {
      await user.save({ transaction: t });
    }

    await t.commit();

    const refreshedCustomer = await db.Customer.findOne({
      where: { user_id: userId },
    });

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      },
      customer: refreshedCustomer,
    });
  } catch (err) {
    await t.rollback();
    return res.status(400).json({
      message: "Lỗi khi cập nhật thông tin cá nhân",
      error: err.message,
    });
  }
};

export const getCustomer = async (req, res) => {
  const { userId } = req.params;

  try {
    const customer = await db.Customer.findOne({ where: { user_id: userId } });
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tìm thấy" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy khách hàng", error: err.message });
  }
};
