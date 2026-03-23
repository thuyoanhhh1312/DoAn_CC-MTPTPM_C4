import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BankAccount = sequelize.define('BankAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    account_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    account_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'bank_account',
    timestamps: false,
});

export default BankAccount;
