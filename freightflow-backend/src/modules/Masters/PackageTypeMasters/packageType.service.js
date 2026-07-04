/**
 * @file packageType.service.js
 * @description Business logic for Package Type Master operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/PackageType/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/PackageType/Update.txt");

const createPackageType = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.PackageType.findOne({
            where: { company_id: companyId, package_type_code: { [Op.iLike]: data.package_type_code } },
            transaction
        });
        if (existingCode) throw new Error("Package Type Code must be unique within the company.");

        const existingName = await db.PackageType.findOne({
            where: { company_id: companyId, package_type_name: { [Op.iLike]: data.package_type_name } },
            transaction
        });
        if (existingName) throw new Error("Package Type Name must be unique within the company.");

        const ptData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.PackageType.create(ptData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PACKAGE_TYPE | Code: ${data.package_type_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PACKAGE_TYPE | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getPackageTypes = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { package_type_code: { [Op.iLike]: `%${search}%` } },
            { package_type_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.PackageType.findAndCountAll({
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

const getPackageTypeById = async (companyId, id) => {
    const record = await db.PackageType.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Package Type not found.");
    return record;
};

const updatePackageType = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PackageType.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Package Type not found.");

        if (data.package_type_code && data.package_type_code.toLowerCase() !== record.package_type_code.toLowerCase()) {
            const existingCode = await db.PackageType.findOne({
                where: { company_id: companyId, package_type_code: { [Op.iLike]: data.package_type_code } },
                transaction
            });
            if (existingCode) throw new Error("Package Type Code must be unique within the company.");
        }

        if (data.package_type_name && data.package_type_name.toLowerCase() !== record.package_type_name.toLowerCase()) {
            const existingName = await db.PackageType.findOne({
                where: { company_id: companyId, package_type_name: { [Op.iLike]: data.package_type_name } },
                transaction
            });
            if (existingName) throw new Error("Package Type Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PACKAGE_TYPE | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PACKAGE_TYPE | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PackageType.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Package Type not found.");
        
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

const deletePackageType = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PackageType.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Package Type not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createPackageType,
    getPackageTypes,
    getPackageTypeById,
    updatePackageType,
    changeStatus,
    deletePackageType
};
