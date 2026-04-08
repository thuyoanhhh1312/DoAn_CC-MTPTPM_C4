import { Op } from "sequelize";
import db from "../models/index.js";
import { sendEmail } from "../utils/emailHelperV2.js";

const { PromotionLog, Customer, Promotion, PromotionCampaign } = db;

const getCustomersBySegment = async (segmentType) => {
  return Customer.findAll({
    where: { segment_type: segmentType },
  });
};

const hasPromotionLogSent = async (customerId, promotionId) => {
  const log = await PromotionLog.findOne({
    where: {
      customer_id: customerId,
      promotion_id: promotionId,
    },
  });

  return Boolean(log);
};

const createPromotionLog = async (
  customerId,
  promotionId,
  emailStatus = "sent",
  errorMessage = null,
) => {
  const existingLog = await PromotionLog.findOne({
    where: {
      customer_id: customerId,
      promotion_id: promotionId,
    },
  });

  if (existingLog) {
    return existingLog.update({
      sent_at: new Date(),
      email_status: emailStatus,
      error_message: errorMessage,
    });
  }

  return PromotionLog.create({
    customer_id: customerId,
    promotion_id: promotionId,
    sent_at: new Date(),
    email_status: emailStatus,
    error_message: errorMessage,
  });
};

const sendPromotionEmail = async ({ to, customerName, promotion }) => {
  if (!to) {
    throw new Error("Customer email is missing");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.6;">
      <h2 style="color: #c58c46;">Ưu đãi dành cho bạn</h2>
      <p>Xin chào ${customerName || "quý khách"},</p>
      <p>Chúng tôi gửi tới bạn mã khuyến mãi <strong>${promotion.promotion_code}</strong>.</p>
      <p>Mức ưu đãi: <strong>${promotion.discount}%</strong></p>
      ${
        promotion.description
          ? `<p>${promotion.description}</p>`
          : ""
      }
      <p>Cảm ơn bạn đã đồng hành cùng cửa hàng.</p>
    </div>
  `;

  /* const sent = await sendEmail(
    to,
    subject: `Ưu đãi ${promotion.promotion_code} dành cho bạn`,
    html,
  }); */
  const sent = await sendEmail(
    to,
    `Uu dai ${promotion.promotion_code} danh cho ban`,
    html,
  );

  if (!sent) {
    throw new Error(
      "Unable to send promotion email. Check SENDGRID or Gmail mail configuration.",
    );
  }
};

export const getAllPromotionLogs = async (req, res) => {
  try {
    const {
      campaign_id,
      promotion_id,
      customer_id,
      start_date,
      end_date,
      email_status,
    } = req.query;

    const where = {};

    if (customer_id) where.customer_id = Number(customer_id);
    if (promotion_id) where.promotion_id = Number(promotion_id);
    if (email_status) where.email_status = email_status;

    if (start_date && end_date) {
      where.sent_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const include = [
      {
        model: Customer,
        attributes: ["id", "name", "email", "segment_type"],
        required: false,
      },
      {
        model: Promotion,
        attributes: [
          "promotion_id",
          "promotion_code",
          "discount",
          "segment_target",
          "campaign_id",
        ],
        required: false,
      },
    ];

    if (campaign_id) {
      include[1] = {
        ...include[1],
        where: { campaign_id: Number(campaign_id) },
        required: true,
      };
    }

    const logs = await PromotionLog.findAll({
      where,
      include,
      order: [["log_id", "DESC"]],
      limit: 1000,
      subQuery: false,
    });

    return res.status(200).json({
      success: true,
      data: logs || [],
      count: logs?.length || 0,
    });
  } catch (error) {
    console.error("getAllPromotionLogs error:", error);
    return res.status(200).json({
      success: true,
      data: [],
      count: 0,
    });
  }
};

export const sendPromotionManually = async (req, res) => {
  try {
    const { campaign_id, promotion_id, customer_ids, force_resend } = req.body;

    if (!promotion_id && !campaign_id) {
      return res.status(400).json({
        success: false,
        message: "Either promotion_id or campaign_id is required",
      });
    }

    let targetPromotions = [];

    if (promotion_id) {
      const promotion = await Promotion.findByPk(promotion_id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: "Promotion not found",
        });
      }
      targetPromotions.push(promotion);
    } else {
      const campaign = await PromotionCampaign.findByPk(campaign_id, {
        include: [
          {
            model: Promotion,
            as: "promotions",
          },
        ],
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      targetPromotions = campaign.promotions || [];
    }

    if (!targetPromotions.length) {
      return res.status(400).json({
        success: false,
        message: "No promotions found to send",
      });
    }

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let firstErrorMessage = null;

    for (const promotion of targetPromotions) {
      let targetCustomers = [];

      if (Array.isArray(customer_ids) && customer_ids.length > 0) {
        targetCustomers = await Customer.findAll({
          where: {
            id: { [Op.in]: customer_ids },
          },
        });
      } else if (
        promotion.segment_target &&
        ["vip", "gold", "silver", "bronze"].includes(
          promotion.segment_target,
        )
      ) {
        targetCustomers = await getCustomersBySegment(promotion.segment_target);
      } else {
        for (const segment of ["vip", "gold", "silver", "bronze"]) {
          const customers = await getCustomersBySegment(segment);
          targetCustomers.push(...customers);
        }
      }

      for (const customer of targetCustomers) {
        if (!force_resend) {
          const alreadySent = await hasPromotionLogSent(
            customer.id,
            promotion.promotion_id,
          );
          if (alreadySent) {
            skippedCount += 1;
            continue;
          }
        }

        try {
          await sendPromotionEmail({
            to: customer.email,
            customerName: customer.name,
            promotion,
          });

          await createPromotionLog(customer.id, promotion.promotion_id, "sent");
          sentCount += 1;
        } catch (error) {
          console.error(
            `Promotion email failed for ${customer.email}:`,
            error.message,
          );
          await createPromotionLog(
            customer.id,
            promotion.promotion_id,
            "failed",
            error.message,
          );
          if (!firstErrorMessage) {
            firstErrorMessage = error.message;
          }
          errorCount += 1;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (sentCount === 0 && errorCount > 0) {
      return res.status(502).json({
        success: false,
        message: firstErrorMessage || "Failed to send promotion email.",
        summary: {
          sent: sentCount,
          skipped: skippedCount,
          failed: errorCount,
        },
      });
    }

    if (sentCount === 0 && skippedCount === 0 && errorCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Khong co khach hang phu hop de gui email.",
        summary: {
          sent: sentCount,
          skipped: skippedCount,
          failed: errorCount,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Manual promotion sending completed",
      summary: {
        sent: sentCount,
        skipped: skippedCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("sendPromotionManually error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send promotion manually",
      error: error.message,
    });
  }
};

export const deletePromotionLogs = async (req, res) => {
  try {
    const { log_ids } = req.body;

    if (!Array.isArray(log_ids) || log_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "log_ids array is required",
      });
    }

    const deleted = await PromotionLog.destroy({
      where: {
        log_id: { [Op.in]: log_ids },
      },
    });

    return res.status(200).json({
      success: true,
      message: `${deleted} promotion logs deleted successfully`,
      deleted_count: deleted,
    });
  } catch (error) {
    console.error("deletePromotionLogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete promotion logs",
      error: error.message,
    });
  }
};
