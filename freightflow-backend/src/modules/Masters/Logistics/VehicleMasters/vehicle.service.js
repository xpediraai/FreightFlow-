/**
 * @file vehicle.service.js
 * @description Business logic for Vehicle operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/Vehicle/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/Vehicle/Update.txt");

const createVehicle = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        if (data.vehicle_number) {
            const existingNum = await db.Vehicle.findOne({ where: { company_id: companyId, vehicle_number: data.vehicle_number }, transaction });
            if (existingNum) throw new Error("Vehicle Number must be unique within the company.");
        }
        if (data.registration_number) {
            const existingReg = await db.Vehicle.findOne({ where: { company_id: companyId, registration_number: data.registration_number }, transaction });
            if (existingReg) throw new Error("Registration Number must be unique within the company.");
        }

        const vehicleData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Vehicle.create(vehicleData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_VEHICLE | Num: ${data.vehicle_number} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_VEHICLE | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getVehicles = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { vehicle_number: { [Op.iLike]: `%${search}%` } },
            { registration_number: { [Op.iLike]: `%${search}%` } },
            { vehicle_type: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Vehicle.findAndCountAll({
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

const getVehicleById = async (companyId, id) => {
    const record = await db.Vehicle.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Vehicle not found.");
    return record;
};

const updateVehicle = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vehicle.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vehicle not found.");

        if (data.vehicle_number && data.vehicle_number !== record.vehicle_number) {
            const existingNum = await db.Vehicle.findOne({ where: { company_id: companyId, vehicle_number: data.vehicle_number }, transaction });
            if (existingNum) throw new Error("Vehicle Number must be unique within the company.");
        }
        if (data.registration_number && data.registration_number !== record.registration_number) {
            const existingReg = await db.Vehicle.findOne({ where: { company_id: companyId, registration_number: data.registration_number }, transaction });
            if (existingReg) throw new Error("Registration Number must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_VEHICLE | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_VEHICLE | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vehicle.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vehicle not found.");

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

const deleteVehicle = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vehicle.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vehicle not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    changeStatus,
    deleteVehicle
};
