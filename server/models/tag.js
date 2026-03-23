import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Tag = sequelize.define('Tag', {
  tag_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:   { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug:   { type: DataTypes.STRING(120), allowNull: false, unique: true },
}, { tableName: 'tag', timestamps: false });

export default Tag;
