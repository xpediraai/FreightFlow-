/**
 * @file containerType.service.js
 * @description Business logic for Container Type operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const ContainerType = db.ContainerType || require("./containerType.model");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/ContainerType/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/ContainerType/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/ContainerType/Delete.txt");

const createContainerType = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Duplicate Code Validation
        const existingCode = await ContainerType.findOne({
            where: { company_id: companyId, container_code: data.container_code },
            transaction
        });
        if (existingCode) throw new Error("Container Code must be unique within the company.");

        // Duplicate ISO Code Validation
        const existingIso = await ContainerType.findOne({
            where: { company_id: companyId, iso_code: data.iso_code },
            transaction
        });
        if (existingIso) throw new Error("ISO Code must be unique within the company.");

        const dataToInsert = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await ContainerType.create(dataToInsert, { transaction });

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CONTAINER_TYPE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Code: ${newRecord.container_code} | Success: true`, createLogPath);

        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CONTAINER_TYPE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getContainerTypes = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, size, category } = queryOptions;

    const offset = (page - 1) * limit;

    const whereClause = {
        company_id: companyId
    };

    if (status) whereClause.status = status;
    if (size) whereClause.size = size;
    if (category) whereClause.category = category;

    if (search) {
        whereClause[Op.or] = [
            { container_code: { [Op.iLike]: `%${search}%` } },
            { container_name: { [Op.iLike]: `%${search}%` } },
            { iso_code: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await ContainerType.findAndCountAll({
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

const getContainerTypeById = async (companyId, id) => {
    const record = await ContainerType.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) {
        throw new Error("Container Type not found.");
    }
    return record;
};

const updateContainerType = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ContainerType.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Container Type not found.");
        }

        if (data.container_code && data.container_code !== record.container_code) {
            const existingCode = await ContainerType.findOne({
                where: { company_id: companyId, container_code: data.container_code },
                transaction
            });
            if (existingCode) throw new Error("Container Code must be unique within the company.");
        }

        if (data.iso_code && data.iso_code !== record.iso_code) {
            const existingIso = await ContainerType.findOne({
                where: { company_id: companyId, iso_code: data.iso_code },
                transaction
            });
            if (existingIso) throw new Error("ISO Code must be unique within the company.");
        }

        const dataToUpdate = {
            ...data,
            updated_by: userId
        };

        const updatedRecord = await record.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CONTAINER_TYPE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CONTAINER_TYPE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ContainerType.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Container Type not found.");
        }

        record.status = status;
        record.updated_by = userId;
        const updatedRecord = await record.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CONTAINER_TYPE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CONTAINER_TYPE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteContainerType = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ContainerType.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Container Type not found.");
        }

        await record.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CONTAINER_TYPE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CONTAINER_TYPE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createContainerType,
    getContainerTypes,
    getContainerTypeById,
    updateContainerType,
    changeStatus,
    deleteContainerType
};
