/**
 * @file transportMode.service.js
 * @description Business logic for Transport Mode operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const TransportMode = db.TransportMode || require("./transportMode.model");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/TransportMode/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/TransportMode/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/TransportMode/Delete.txt");

const createTransportMode = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Duplicate Code Validation
        const existingCode = await TransportMode.findOne({
            where: { company_id: companyId, mode_code: data.mode_code },
            transaction
        });
        if (existingCode) throw new Error("Mode Code must be unique within the company.");

        // Duplicate Name Validation
        const existingName = await TransportMode.findOne({
            where: { company_id: companyId, mode_name: data.mode_name },
            transaction
        });
        if (existingName) throw new Error("Mode Name must be unique within the company.");

        const dataToInsert = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await TransportMode.create(dataToInsert, { transaction });

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_TRANSPORT_MODE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Code: ${newRecord.mode_code} | Success: true`, createLogPath);

        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_TRANSPORT_MODE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getTransportModes = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;

    const offset = (page - 1) * limit;

    const whereClause = {
        company_id: companyId
    };

    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { mode_code: { [Op.iLike]: `%${search}%` } },
            { mode_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await TransportMode.findAndCountAll({
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

const getTransportModeById = async (companyId, id) => {
    const record = await TransportMode.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) {
        throw new Error("Transport Mode not found.");
    }
    return record;
};

const updateTransportMode = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await TransportMode.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Transport Mode not found.");
        }

        if (data.mode_code && data.mode_code !== record.mode_code) {
            const existingCode = await TransportMode.findOne({
                where: { company_id: companyId, mode_code: data.mode_code },
                transaction
            });
            if (existingCode) throw new Error("Mode Code must be unique within the company.");
        }

        if (data.mode_name && data.mode_name !== record.mode_name) {
            const existingName = await TransportMode.findOne({
                where: { company_id: companyId, mode_name: data.mode_name },
                transaction
            });
            if (existingName) throw new Error("Mode Name must be unique within the company.");
        }

        const dataToUpdate = {
            ...data,
            updated_by: userId
        };

        const updatedRecord = await record.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_TRANSPORT_MODE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_TRANSPORT_MODE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await TransportMode.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Transport Mode not found.");
        }

        record.status = status;
        record.updated_by = userId;
        const updatedRecord = await record.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_TRANSPORT_MODE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_TRANSPORT_MODE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteTransportMode = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await TransportMode.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Transport Mode not found.");
        }

        await record.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_TRANSPORT_MODE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_TRANSPORT_MODE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createTransportMode,
    getTransportModes,
    getTransportModeById,
    updateTransportMode,
    changeStatus,
    deleteTransportMode
};
