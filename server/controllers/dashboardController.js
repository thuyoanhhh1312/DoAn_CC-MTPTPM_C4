import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";

const parseInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const getCompletedStatusIds = async () => {
  // Allow explicit override from env for deployments with custom status mapping.
  if (process.env.COMPLETED_ORDER_STATUS_IDS) {
    const envIds = process.env.COMPLETED_ORDER_STATUS_IDS.split(",")
      .map((value) => parseInteger(value.trim()))
      .filter((value) => value !== null);
    if (envIds.length > 0) {
      return envIds;
    }
  }

  const statusRows = await db.OrderStatus.findAll({
    attributes: ["status_id", "status_code", "status_name"],
    raw: true,
  });

  const keywords = [
    "completed",
    "complete",
    "done",
    "delivered",
    "success",
    "thanh cong",
    "hoan tat",
  ];

  const matchedIds = statusRows
    .filter((statusRow) => {
      const code = String(statusRow.status_code || "").toLowerCase();
      const name = String(statusRow.status_name || "").toLowerCase();
      return keywords.some(
        (keyword) => code.includes(keyword) || name.includes(keyword),
      );
    })
    .map((statusRow) => statusRow.status_id)
    .filter((statusId) => Number.isInteger(statusId));

  return matchedIds.length > 0 ? matchedIds : [4];
};

export const getRevenueByPeriod = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "year is required" });
    }

    const yearNumber = parseInteger(year);
    if (yearNumber === null || yearNumber < 2000 || yearNumber > 2100) {
      return res
        .status(400)
        .json({
          success: false,
          message: "year must be an integer between 2000 and 2100",
        });
    }

    const monthNumber = month !== undefined ? parseInteger(month) : null;
    if (
      month !== undefined &&
      (monthNumber === null || monthNumber < 1 || monthNumber > 12)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "month must be an integer between 1 and 12",
        });
    }

    let startDate, endDate, groupBy, dateFormat;
    if (monthNumber !== null) {
      // Thống kê theo ngày trong tháng
      startDate = new Date(yearNumber, monthNumber - 1, 1);
      endDate = new Date(yearNumber, monthNumber, 1);
      groupBy = [Sequelize.literal("DATE_FORMAT(created_at, '%Y-%m-%d')")];
      dateFormat = "%Y-%m-%d";
    } else {
      // Thống kê theo tháng trong năm
      startDate = new Date(yearNumber, 0, 1);
      endDate = new Date(yearNumber + 1, 0, 1);
      groupBy = [Sequelize.literal("DATE_FORMAT(created_at, '%Y-%m')")];
      dateFormat = "%Y-%m";
    }

    const completedStatusIds = await getCompletedStatusIds();

    const revenueData = await db.Order.findAll({
      attributes: [
        [
          Sequelize.literal(`DATE_FORMAT(created_at, '${dateFormat}')`),
          "period",
        ],
        [Sequelize.fn("SUM", Sequelize.col("total")), "totalRevenue"],
      ],
      where: {
        status_id: { [Op.in]: completedStatusIds },
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      group: groupBy,
      order: [[Sequelize.literal("period"), "ASC"]],
      raw: true,
    });

    return res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatISOWeek = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber =
    1 + Math.round(((target - firstThursday) / 86400000 - 3) / 7);

  const yyyy = target.getFullYear();
  const ww = String(weekNumber).padStart(2, "0");
  return `${yyyy}-W${ww}`;
};

const formatMonth = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
};

const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const generateWeekRange = (startDate, endDate) => {
  const weeks = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setHours(0, 0, 0, 0);

  const dayNr = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - dayNr);

  while (current <= endDate) {
    weeks.push(formatISOWeek(current));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

const generateMonthRange = (startDate, endDate) => {
  const months = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= endDate) {
    months.push(formatMonth(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

export const getOrderCountByPeriod = async (req, res) => {
  try {
    const { period, startDate: startDateStr, endDate: endDateStr } = req.query;

    if (!period || !["day", "week", "month"].includes(period)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Invalid period. Use "day", "week" or "month".',
        });
    }

    let startDate = startDateStr ? new Date(startDateStr) : null;
    let endDate = endDateStr ? new Date(endDateStr) : new Date();

    if (Number.isNaN(endDate.getTime())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid endDate. Use YYYY-MM-DD format.",
        });
    }

    if (startDate && Number.isNaN(startDate.getTime())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid startDate. Use YYYY-MM-DD format.",
        });
    }

    if (!startDate) {
      if (period === "day" || period === "week") {
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
      } else if (period === "month") {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
      }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "startDate must be less than or equal to endDate",
        });
    }

    let groupField, dateFormatterFn, dateRange;

    switch (period) {
      case "day":
        groupField = Sequelize.literal("DATE(created_at)");
        dateFormatterFn = formatDate;
        dateRange = generateDateRange(startDate, endDate);
        break;
      case "week":
        groupField = Sequelize.literal("YEARWEEK(created_at, 1)");
        dateFormatterFn = (item) => {
          const yw = String(item);
          const year = yw.substring(0, 4);
          const week = yw.substring(4);
          return `${year}-W${week.padStart(2, "0")}`;
        };
        dateRange = generateWeekRange(startDate, endDate);
        break;
      case "month":
        groupField = Sequelize.literal('DATE_FORMAT(created_at, "%Y-%m")');
        dateFormatterFn = formatMonth;
        dateRange = generateMonthRange(startDate, endDate);
        break;
    }

    const ordersRaw = await db.Order.findAll({
      attributes: [
        [groupField, "period"],
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "count"],
      ],
      where: {
        created_at: { [Op.between]: [startDate, endDate] },
      },
      group: ["period"],
      order: [["period", "ASC"]],
      raw: true,
    });

    const countMap = {};
    ordersRaw.forEach((item) => {
      const key =
        period === "week" ? dateFormatterFn(item.period) : item.period;
      countMap[key] = parseInt(item.count, 10);
    });

    const result = dateRange.map((periodKey) => ({
      period: periodKey,
      count: countMap[periodKey] || 0,
    }));

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in getOrderCountByPeriod:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
