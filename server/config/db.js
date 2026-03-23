import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const verifyDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

export default sequelize;
