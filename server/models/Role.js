import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "role",
    underscored: true,
    timestamps: true,
  }
);

export default Role;
