/**
 * @file customerDocument.model.js
 * @description Sequelize model for Customer Documents.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const CustomerDocument = sequelize.define("CustomerDocument", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    document_type: {
        type: DataTypes.STRING,
        allowNull: false, // e.g. GST, PAN, IEC
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: "customer_documents",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = CustomerDocument;
