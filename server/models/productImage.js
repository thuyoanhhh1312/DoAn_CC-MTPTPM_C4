import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductImage = sequelize.define('ProductImage', {
    image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    alt_text: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    tableName: 'product_image',
    timestamps: false,
});

export default ProductImage;
