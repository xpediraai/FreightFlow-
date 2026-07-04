/**
 * @file department.service.js
 * @description Business logic for Department operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/Department/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/Department/Update.txt");

const createDepartment = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        if (data.department_code) {
            const existingCode = await db.Department.findOne({ where: { company_id: companyId, department_code: data.department_code }, transaction });
            if (existingCode) throw new Error("Department Code must be unique within the company.");
        }
        if (data.department_name) {
            const existingName = await db.Department.findOne({ where: { company_id: companyId, department_name: data.department_name }, transaction });
            if (existingName) throw new Error("Department Name must be unique within the company.");
        }

        const deptData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Department.create(deptData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DEPARTMENT | Code: ${data.department_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DEPARTMENT | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getDepartments = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { department_code: { [Op.iLike]: `%${search}%` } },
            { department_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Department.findAndCountAll({
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

const getDepartmentById = async (companyId, id) => {
    const record = await db.Department.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Department not found.");
    return record;
};

const updateDepartment = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Department.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Department not found.");

        if (data.department_code && data.department_code !== record.department_code) {
            const existingCode = await db.Department.findOne({ where: { company_id: companyId, department_code: data.department_code }, transaction });
            if (existingCode) throw new Error("Department Code must be unique within the company.");
        }
        if (data.department_name && data.department_name !== record.department_name) {
            const existingName = await db.Department.findOne({ where: { company_id: companyId, department_name: data.department_name }, transaction });
            if (existingName) throw new Error("Department Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DEPARTMENT | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DEPARTMENT | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Department.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Department not found.");

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

const deleteDepartment = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Department.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Department not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    changeStatus,
    deleteDepartment
};
