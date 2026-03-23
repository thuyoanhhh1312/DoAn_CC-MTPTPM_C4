import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
    order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
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
    tableName: 'order_items',
    timestamps: false,
});

export default OrderItem;
