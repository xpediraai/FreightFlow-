/**
 * @file warehouse.service.js
 * @description Business logic for Warehouse operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Warehouse/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Warehouse/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Warehouse/Delete.txt");

const createWarehouse = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.Warehouse.findOne({ where: { company_id: companyId, warehouse_code: data.warehouse_code }, transaction });
        if (existingCode) throw new Error("Warehouse Code must be unique within the company.");

        const warehouseData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Warehouse.create(warehouseData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_WAREHOUSE | Code: ${data.warehouse_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_WAREHOUSE | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getWarehouses = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { warehouse_code: { [Op.iLike]: `%${search}%` } },
            { warehouse_name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { mobile: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Warehouse.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit,
        offset
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

const getWarehouseById = async (companyId, id) => {
    const record = await db.Warehouse.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Warehouse not found.");
    return record;
};

const updateWarehouse = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Warehouse.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Warehouse not found.");

        if (data.warehouse_code && data.warehouse_code !== record.warehouse_code) {
            const existingCode = await db.Warehouse.findOne({ where: { company_id: companyId, warehouse_code: data.warehouse_code }, transaction });
            if (existingCode) throw new Error("Warehouse Code must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_WAREHOUSE | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_WAREHOUSE | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Warehouse.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Warehouse not found.");
        
        record.status = status;
        record.updated_by = userId;
        await record.save({ transaction });
        await transaction.commit();
        return record;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteWarehouse = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Warehouse.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Warehouse not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    changeStatus,
    deleteWarehouse
};
