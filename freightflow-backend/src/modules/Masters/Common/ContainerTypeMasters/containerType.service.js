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

const DEFAULT_SEED_CONTAINER_TYPES = [
    { container_code: "20GP", container_name: "20' Standard Dry (20GP)", iso_code: "22G1", size: "20", category: "Dry", capacity_cbm: 33.2, max_weight: 28000, status: "Active" },
    { container_code: "40GP", container_name: "40' Standard Dry (40GP)", iso_code: "42G1", size: "40", category: "Dry", capacity_cbm: 67.7, max_weight: 28800, status: "Active" },
    { container_code: "40HC", container_name: "40' High Cube (40HC)", iso_code: "45G1", size: "40", category: "Dry", capacity_cbm: 76.4, max_weight: 28600, status: "Active" },
    { container_code: "45HC", container_name: "45' High Cube (45HC)", iso_code: "L5G1", size: "45", category: "Dry", capacity_cbm: 86.0, max_weight: 29500, status: "Active" },
    { container_code: "20RF", container_name: "20' Reefer Container", iso_code: "22R1", size: "20", category: "Reefer", capacity_cbm: 28.3, max_weight: 27000, status: "Active" },
    { container_code: "40RF", container_name: "40' Reefer Container", iso_code: "45R1", size: "40", category: "Reefer", capacity_cbm: 59.3, max_weight: 29000, status: "Active" },
    { container_code: "20OT", container_name: "20' Open Top", iso_code: "22U1", size: "20", category: "Open Top", capacity_cbm: 32.5, max_weight: 28000, status: "Active" },
    { container_code: "40OT", container_name: "40' Open Top", iso_code: "45U1", size: "40", category: "Open Top", capacity_cbm: 66.0, max_weight: 28500, status: "Active" },
    { container_code: "20FR", container_name: "20' Flat Rack", iso_code: "22P1", size: "20", category: "Flat Rack", capacity_cbm: 30.0, max_weight: 31000, status: "Active" },
    { container_code: "40FR", container_name: "40' Flat Rack", iso_code: "45P1", size: "40", category: "Flat Rack", capacity_cbm: 60.0, max_weight: 45000, status: "Active" },
    { container_code: "20TK", container_name: "20' ISO Tank Container", iso_code: "22T1", size: "20", category: "Tank", capacity_cbm: 26.0, max_weight: 32000, status: "Active" }
];

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

    let { count, rows } = await ContainerType.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit,
        offset
    });

    // Auto-seed default Container Types if empty for company
    if (count === 0 && !search && !status && !size && !category) {
        try {
            const seedData = DEFAULT_SEED_CONTAINER_TYPES.map(item => ({
                ...item,
                company_id: companyId
            }));
            await ContainerType.bulkCreate(seedData, { ignoreDuplicates: true });
            
            const recheck = await ContainerType.findAndCountAll({
                where: whereClause,
                order: [[sortBy, sortOrder]],
                limit,
                offset
            });
            count = recheck.count;
            rows = recheck.rows;
        } catch (seedErr) {
            console.warn("Auto-seeding ContainerTypes warning:", seedErr);
        }
    }

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
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
