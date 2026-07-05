/**
 * @file uom.service.js
 * @description Business logic for UOM Master operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/UOM/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/UOM/Update.txt");

const createUOM = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.UOM.findOne({
            where: { company_id: companyId, uom_code: { [Op.iLike]: data.uom_code } },
            transaction
        });
        if (existingCode) throw new Error("UOM Code must be unique within the company.");

        const existingName = await db.UOM.findOne({
            where: { company_id: companyId, uom_name: { [Op.iLike]: data.uom_name } },
            transaction
        });
        if (existingName) throw new Error("UOM Name must be unique within the company.");

        const uomData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.UOM.create(uomData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_UOM | Code: ${data.uom_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_UOM | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getUOMs = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { uom_code: { [Op.iLike]: `%${search}%` } },
            { uom_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.UOM.findAndCountAll({
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

const getUOMById = async (companyId, id) => {
    const record = await db.UOM.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("UOM not found.");
    return record;
};

const updateUOM = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.UOM.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("UOM not found.");

        if (data.uom_code && data.uom_code.toLowerCase() !== record.uom_code.toLowerCase()) {
            const existingCode = await db.UOM.findOne({
                where: { company_id: companyId, uom_code: { [Op.iLike]: data.uom_code } },
                transaction
            });
            if (existingCode) throw new Error("UOM Code must be unique within the company.");
        }

        if (data.uom_name && data.uom_name.toLowerCase() !== record.uom_name.toLowerCase()) {
            const existingName = await db.UOM.findOne({
                where: { company_id: companyId, uom_name: { [Op.iLike]: data.uom_name } },
                transaction
            });
            if (existingName) throw new Error("UOM Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_UOM | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_UOM | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.UOM.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("UOM not found.");

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

const deleteUOM = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.UOM.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("UOM not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createUOM,
    getUOMs,
    getUOMById,
    updateUOM,
    changeStatus,
    deleteUOM
};
