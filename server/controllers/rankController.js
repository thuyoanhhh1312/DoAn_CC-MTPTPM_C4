import {
  previewRankUpdate,
  runRankUpdateNow,
} from "../jobs/monthlyRankUpdateJob.js";
import db from "../models/index.js";
import { formatVND } from "../utils/emailHelper.js";
import { QueryTypes } from "sequelize";

const { CustomerRankHistory, Customer } = db;

let rankHistoryTableColumnsCache = null;

const getRankHistoryTableColumns = async () => {
  if (rankHistoryTableColumnsCache) {
    return rankHistoryTableColumnsCache;
  }

  const queryInterface = db.sequelize.getQueryInterface();
  const tableDef = await queryInterface.describeTable("customer_rank_history");
  rankHistoryTableColumnsCache = new Set(Object.keys(tableDef));
  return rankHistoryTableColumnsCache;
};

/**
 * Preview xếp hạng (không commit vào database)
 */
export const previewRank = async (req, res) => {
  try {
    const preview = await previewRankUpdate();

    res.status(200).json({
      success: true,
      message: "Rank preview generated successfully",
      data: preview.map((item) => ({
        ...item,
        total_spent_formatted: formatVND(item.total_spent),
      })),
    });
  } catch (error) {
    console.error("Error previewing rank:", error);
    res.status(500).json({
      success: false,
      message: "Failed to preview rank",
      error: error.message,
    });
  }
};

/**
 * Chạy cập nhật rank ngay lập tức
 */
export const recalculateRank = async (req, res) => {
  try {
    const results = await runRankUpdateNow();

    res.status(200).json({
      success: true,
      message: "Rank recalculation completed successfully",
      updated_count: results.length,
      data: results.map((item) => ({
        ...item,
        total_spent_formatted: formatVND(item.total_spent),
      })),
    });
  } catch (error) {
    console.error("Error recalculating rank:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recalculate rank",
      error: error.message,
    });
  }
};

/**
 * Lấy lịch sử thay đổi rank
 */
export const getRankHistory = async (req, res) => {
  try {
    const { customer_id, period_month, period_year } = req.query;
    const existingColumns = await getRankHistoryTableColumns();

    const whereSql = [];
    const replacements = {};

    if (customer_id && existingColumns.has("customer_id")) {
      whereSql.push("h.customer_id = :customer_id");
      replacements.customer_id = customer_id;
    }

    if (period_month && existingColumns.has("period_month")) {
      whereSql.push("h.period_month = :period_month");
      replacements.period_month = period_month;
    }

    if (period_year && existingColumns.has("period_year")) {
      whereSql.push("h.period_year = :period_year");
      replacements.period_year = period_year;
    }

    const selectFields = [
      existingColumns.has("customer_id")
        ? "h.customer_id"
        : "NULL AS customer_id",
      existingColumns.has("old_rank") ? "h.old_rank" : "NULL AS old_rank",
      existingColumns.has("new_rank") ? "h.new_rank" : "NULL AS new_rank",
      existingColumns.has("changed_at") ? "h.changed_at" : "NULL AS changed_at",
      existingColumns.has("period_month")
        ? "h.period_month"
        : "NULL AS period_month",
      existingColumns.has("period_year")
        ? "h.period_year"
        : "NULL AS period_year",
      existingColumns.has("total_spent") ? "h.total_spent" : "0 AS total_spent",
      "c.customer_id AS `Customer.id`",
      "c.name AS `Customer.name`",
      "c.email AS `Customer.email`",
      "c.segment_type AS `Customer.segment_type`",
    ];

    const whereClause =
      whereSql.length > 0 ? `WHERE ${whereSql.join(" AND ")}` : "";

    const history = await db.sequelize.query(
      `
        SELECT ${selectFields.join(", ")}
        FROM customer_rank_history h
        LEFT JOIN customer c ON c.customer_id = h.customer_id
        ${whereClause}
        ORDER BY h.changed_at DESC
        LIMIT 500
      `,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    res.status(200).json({
      success: true,
      data: history.map((item) => ({
        ...item,
        total_spent_formatted: formatVND(item.total_spent || 0),
      })),
      count: history.length,
    });
  } catch (error) {
    console.error("Error getting rank history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get rank history",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê phân bố rank hiện tại
 */
export const getRankDistribution = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: ["segment_type"],
    });

    const distribution = {
      bronze: 0,
      silver: 0,
      gold: 0,
      vip: 0,
    };

    customers.forEach((customer) => {
      if (distribution[customer.segment_type] !== undefined) {
        distribution[customer.segment_type]++;
      }
    });

    const total = customers.length;
    const toPercent = (count) =>
      total === 0 ? "0.00%" : ((count / total) * 100).toFixed(2) + "%";

    res.status(200).json({
      success: true,
      data: {
        distribution,
        total,
        percentages: {
          bronze: toPercent(distribution.bronze),
          silver: toPercent(distribution.silver),
          gold: toPercent(distribution.gold),
          vip: toPercent(distribution.vip),
        },
      },
    });
  } catch (error) {
    console.error("Error getting rank distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get rank distribution",
      error: error.message,
    });
  }
};
