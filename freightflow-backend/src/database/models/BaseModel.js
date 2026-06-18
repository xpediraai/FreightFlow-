/**
 * @file BaseModel.js
 * @description Defines standard, reusable schema fields for auditing, tracking, and soft deletion.
 * Instead of repeating these fields across every Sequelize model (e.g., Company, User, Role, Job, etc.),
 * this BaseModel configuration is spread/inherited to maintain schema consistency and DRY principles.
 * @module database/models/BaseModel
 * @requires sequelize
 */

const { DataTypes } = require("sequelize");

/**
 * Reusable base schema fields.
 * Includes UUID primary key, audit trails (created_by, updated_by),
 * and soft-delete fields (deleted_by, deleted_at, is_deleted).
 * 
 * @type {Object}
 * @property {string} id - Unique primary key (UUID v4)
 * @property {string} created_by - UUID of the user who created the record
 * @property {string} updated_by - UUID of the user who last updated the record
 * @property {string} deleted_by - UUID of the user who soft-deleted the record
 * @property {Date} deleted_at - Timestamp when the record was soft-deleted
 * @property {boolean} is_deleted - Soft-delete status flag
 */
const BaseModel = {
    // Unique identifier automatically initialized as a UUID v4
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    // Audit field tracking the creator of the record
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },

    // Audit field tracking the user who last modified the record
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },

    // Tracking field storing the user responsible for soft deletion
    deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },

    // Timestamp representing when soft deletion occurred
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    // Status flag indicating if the record is soft-deleted (soft deletes retain history in DB)
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}

module.exports = BaseModel;