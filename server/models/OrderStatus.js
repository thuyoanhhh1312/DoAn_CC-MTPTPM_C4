import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OrderStatus = sequelize.define('OrderStatus', {
    status_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    status_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    status_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    color_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'order_status',
    timestamps: false,
});

export default OrderStatus;
