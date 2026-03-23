import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PromotionUsage = sequelize.define('PromotionUsage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'promotion_usage',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['customer_id', 'promotion_id'],
            name: 'uniq_customer_promotion',
        },
    ],
});

export default PromotionUsage;