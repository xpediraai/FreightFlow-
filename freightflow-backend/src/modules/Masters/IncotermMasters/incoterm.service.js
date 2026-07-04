/**
 * @file incoterm.service.js
 * @description Business logic for Incoterm Master operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Incoterm/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Incoterm/Update.txt");

const createIncoterm = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.Incoterm.findOne({
            where: { company_id: companyId, incoterm_code: { [Op.iLike]: data.incoterm_code } },
            transaction
        });
        if (existingCode) throw new Error("Incoterm Code must be unique within the company.");

        const existingName = await db.Incoterm.findOne({
            where: { company_id: companyId, incoterm_name: { [Op.iLike]: data.incoterm_name } },
            transaction
        });
        if (existingName) throw new Error("Incoterm Name must be unique within the company.");

        const incoData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Incoterm.create(incoData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_INCOTERM | Code: ${data.incoterm_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_INCOTERM | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getIncoterms = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { incoterm_code: { [Op.iLike]: `%${search}%` } },
            { incoterm_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Incoterm.findAndCountAll({
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

const getIncotermById = async (companyId, id) => {
    const record = await db.Incoterm.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Incoterm not found.");
    return record;
};

const updateIncoterm = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Incoterm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Incoterm not found.");

        if (data.incoterm_code && data.incoterm_code.toLowerCase() !== record.incoterm_code.toLowerCase()) {
            const existingCode = await db.Incoterm.findOne({
                where: { company_id: companyId, incoterm_code: { [Op.iLike]: data.incoterm_code } },
                transaction
            });
            if (existingCode) throw new Error("Incoterm Code must be unique within the company.");
        }

        if (data.incoterm_name && data.incoterm_name.toLowerCase() !== record.incoterm_name.toLowerCase()) {
            const existingName = await db.Incoterm.findOne({
                where: { company_id: companyId, incoterm_name: { [Op.iLike]: data.incoterm_name } },
                transaction
            });
            if (existingName) throw new Error("Incoterm Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_INCOTERM | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_INCOTERM | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Incoterm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Incoterm not found.");
        
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

const deleteIncoterm = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Incoterm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Incoterm not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createIncoterm,
    getIncoterms,
    getIncotermById,
    updateIncoterm,
    changeStatus,
    deleteIncoterm
};
