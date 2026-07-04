/**
 * @file designation.service.js
 * @description Business logic for Designation operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Designation/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Designation/Update.txt");

const createDesignation = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validate Code Uniqueness (Always Global within Company)
        if (data.designation_code) {
            const existingCode = await db.Designation.findOne({ where: { company_id: companyId, designation_code: data.designation_code }, transaction });
            if (existingCode) throw new Error("Designation Code must be unique within the company.");
        }

        // Validate Name Uniqueness based on Department ID
        if (data.designation_name) {
            const targetDepartmentId = data.department_id || null;
            const existingName = await db.Designation.findOne({ 
                where: { 
                    company_id: companyId, 
                    designation_name: data.designation_name,
                    department_id: targetDepartmentId
                }, 
                transaction 
            });
            if (existingName) {
                if (targetDepartmentId) {
                    throw new Error("Designation Name must be unique within the assigned Department.");
                } else {
                    throw new Error("A Global Designation with this name already exists.");
                }
            }
        }

        const designationData = {
            ...data,
            company_id: companyId,
            department_id: data.department_id || null,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Designation.create(designationData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DESIGNATION | Code: ${data.designation_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_DESIGNATION | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getDesignations = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, department_id } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;
    if (department_id !== undefined) {
        whereClause.department_id = department_id;
    }

    if (search) {
        whereClause[Op.or] = [
            { designation_code: { [Op.iLike]: `%${search}%` } },
            { designation_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Designation.findAndCountAll({
        where: whereClause,
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] }],
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

const getDesignationById = async (companyId, id) => {
    const record = await db.Designation.findOne({
        where: { id: id, company_id: companyId },
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] }]
    });

    if (!record) throw new Error("Designation not found.");
    return record;
};

const updateDesignation = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Designation.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Designation not found.");

        if (data.designation_code && data.designation_code !== record.designation_code) {
            const existingCode = await db.Designation.findOne({ where: { company_id: companyId, designation_code: data.designation_code }, transaction });
            if (existingCode) throw new Error("Designation Code must be unique within the company.");
        }

        const newName = data.designation_name || record.designation_name;
        const newDeptId = data.hasOwnProperty('department_id') ? (data.department_id || null) : record.department_id;

        if (newName !== record.designation_name || newDeptId !== record.department_id) {
            const existingName = await db.Designation.findOne({ 
                where: { 
                    company_id: companyId, 
                    designation_name: newName,
                    department_id: newDeptId,
                    id: { [Op.ne]: id }
                }, 
                transaction 
            });
            if (existingName) {
                if (newDeptId) {
                    throw new Error("Designation Name must be unique within the assigned Department.");
                } else {
                    throw new Error("A Global Designation with this name already exists.");
                }
            }
        }

        const dataToUpdate = { ...data, department_id: newDeptId, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DESIGNATION | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_DESIGNATION | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Designation.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Designation not found.");
        
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

const deleteDesignation = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Designation.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Designation not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createDesignation,
    getDesignations,
    getDesignationById,
    updateDesignation,
    changeStatus,
    deleteDesignation
};
