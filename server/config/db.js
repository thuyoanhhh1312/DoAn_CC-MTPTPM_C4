// config/db.js
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
  },
);

// Kiểm tra kết nối
sequelize
  .authenticate()
  .then(() => console.log("Kết nối cơ sở dữ liệu thành công!"))
  .catch((err) => {
    console.error("Lỗi kết nối cơ sở dữ liệu:", err);
  });

export default sequelize;
