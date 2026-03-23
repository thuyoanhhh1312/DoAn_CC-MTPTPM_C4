import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Customer extends Model {}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "customer_id",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    segment_type: {
      type: DataTypes.ENUM("vip", "gold", "silver", "bronze"),
      allowNull: false,
      defaultValue: "bronze",
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customer",
    underscored: true,
    timestamps: true,
  }
);

export default Customer;
