import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ArticleCategory = sequelize.define('ArticleCategory', {
  article_category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'article_category', timestamps: false });

export default ArticleCategory;
