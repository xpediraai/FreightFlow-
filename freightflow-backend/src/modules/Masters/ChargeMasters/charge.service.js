/**
 * @file charge.service.js
 * @description Business logic for Charge Master operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Charge/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Charge/Update.txt");

const createCharge = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.Charge.findOne({
            where: { company_id: companyId, charge_code: { [Op.iLike]: data.charge_code } },
            transaction
        });
        if (existingCode) throw new Error("Charge Code must be unique within the company.");

        const existingName = await db.Charge.findOne({
            where: { company_id: companyId, charge_name: { [Op.iLike]: data.charge_name } },
            transaction
        });
        if (existingName) throw new Error("Charge Name must be unique within the company.");

        const chargeData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Charge.create(chargeData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CHARGE | Code: ${data.charge_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CHARGE | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCharges = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { charge_code: { [Op.iLike]: `%${search}%` } },
            { charge_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Charge.findAndCountAll({
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

const getChargeById = async (companyId, id) => {
    const record = await db.Charge.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Charge not found.");
    return record;
};

const updateCharge = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Charge.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Charge not found.");

        if (data.charge_code && data.charge_code.toLowerCase() !== record.charge_code.toLowerCase()) {
            const existingCode = await db.Charge.findOne({
                where: { company_id: companyId, charge_code: { [Op.iLike]: data.charge_code } },
                transaction
            });
            if (existingCode) throw new Error("Charge Code must be unique within the company.");
        }

        if (data.charge_name && data.charge_name.toLowerCase() !== record.charge_name.toLowerCase()) {
            const existingName = await db.Charge.findOne({
                where: { company_id: companyId, charge_name: { [Op.iLike]: data.charge_name } },
                transaction
            });
            if (existingName) throw new Error("Charge Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CHARGE | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CHARGE | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Charge.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Charge not found.");
        
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

const deleteCharge = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Charge.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Charge not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createCharge,
    getCharges,
    getChargeById,
    updateCharge,
    changeStatus,
    deleteCharge
};
