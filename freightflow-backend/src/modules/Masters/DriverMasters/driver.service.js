/**
 * @file driver.service.js
 * @description Business logic for Driver operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Driver/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Driver/Update.txt");

const createDriver = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        if (data.driver_code) {
            const existingCode = await db.Driver.findOne({ where: { company_id: companyId, driver_code: data.driver_code }, transaction });
            if (existingCode) throw new Error("Driver Code must be unique within the company.");
        }
        if (data.license_number) {
            const existingLic = await db.Driver.findOne({ where: { company_id: companyId, license_number: data.license_number }, transaction });
            if (existingLic) throw new Error("License Number must be unique within the company.");
        }
        if (data.aadhaar_number) {
            const existingAadhaar = await db.Driver.findOne({ where: { company_id: companyId, aadhaar_number: data.aadhaar_number }, transaction });
            if (existingAadhaar) throw new Error("Aadhaar Number must be unique within the company.");
        }

        const driverData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Driver.create(driverData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DRIVER | Code: ${data.driver_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DRIVER | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getDrivers = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { driver_code: { [Op.iLike]: `%${search}%` } },
            { driver_name: { [Op.iLike]: `%${search}%` } },
            { license_number: { [Op.iLike]: `%${search}%` } },
            { mobile: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Driver.findAndCountAll({
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

const getDriverById = async (companyId, id) => {
    const record = await db.Driver.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Driver not found.");
    return record;
};

const updateDriver = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Driver.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Driver not found.");

        if (data.driver_code && data.driver_code !== record.driver_code) {
            const existingCode = await db.Driver.findOne({ where: { company_id: companyId, driver_code: data.driver_code }, transaction });
            if (existingCode) throw new Error("Driver Code must be unique within the company.");
        }
        if (data.license_number && data.license_number !== record.license_number) {
            const existingLic = await db.Driver.findOne({ where: { company_id: companyId, license_number: data.license_number }, transaction });
            if (existingLic) throw new Error("License Number must be unique within the company.");
        }
        if (data.aadhaar_number && data.aadhaar_number !== record.aadhaar_number) {
            const existingAadhaar = await db.Driver.findOne({ where: { company_id: companyId, aadhaar_number: data.aadhaar_number }, transaction });
            if (existingAadhaar) throw new Error("Aadhaar Number must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DRIVER | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DRIVER | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Driver.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Driver not found.");
        
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

const deleteDriver = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Driver.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Driver not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createDriver,
    getDrivers,
    getDriverById,
    updateDriver,
    changeStatus,
    deleteDriver
};
