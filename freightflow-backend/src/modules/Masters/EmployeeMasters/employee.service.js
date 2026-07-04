/**
 * @file employee.service.js
 * @description Business logic for Employee operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Employee/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Employee/Update.txt");

const generateEmployeeCode = async (companyId, transaction) => {
    const lastEmployee = await db.Employee.findOne({
        where: { company_id: companyId },
        order: [['created_at', 'DESC']],
        transaction,
        paranoid: false
    });

    if (!lastEmployee || !lastEmployee.employee_code) return "EMP-001";
    const lastCode = lastEmployee.employee_code;
    const match = lastCode.match(/EMP-(\d+)/);
    if (match && match[1]) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `EMP-${nextNum.toString().padStart(3, '0')}`;
    }
    return "EMP-001";
};

const validateDesignationDepartmentRule = async (designationId, employeeDepartmentId, companyId, transaction) => {
    const designation = await db.Designation.findOne({
        where: { id: designationId, company_id: companyId },
        transaction
    });

    if (!designation) {
        throw new Error("Invalid Designation ID.");
    }

    if (designation.department_id !== null && designation.department_id !== employeeDepartmentId) {
        throw new Error("The selected Designation is restricted to a different Department.");
    }
};

const createEmployee = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        let empCode = data.employee_code;
        if (!empCode) {
            empCode = await generateEmployeeCode(companyId, transaction);
        } else {
            const existingCode = await db.Employee.findOne({ where: { company_id: companyId, employee_code: empCode }, transaction });
            if (existingCode) throw new Error("Employee Code must be unique within the company.");
        }

        if (data.email) {
            const existingEmail = await db.Employee.findOne({ where: { company_id: companyId, email: data.email }, transaction });
            if (existingEmail) throw new Error("Email must be unique within the company.");
        }

        if (data.mobile) {
            const existingMobile = await db.Employee.findOne({ where: { company_id: companyId, mobile: data.mobile }, transaction });
            if (existingMobile) throw new Error("Mobile must be unique within the company.");
        }

        await validateDesignationDepartmentRule(data.designation_id, data.department_id, companyId, transaction);

        const employeeData = {
            ...data,
            employee_code: empCode,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.Employee.create(employeeData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_EMPLOYEE | Code: ${empCode} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_EMPLOYEE | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getEmployees = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { employee_code: { [Op.iLike]: `%${search}%` } },
            { first_name: { [Op.iLike]: `%${search}%` } },
            { last_name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { mobile: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Employee.findAndCountAll({
        where: whereClause,
        include: [
            { model: db.Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] },
            { model: db.Designation, as: 'designation', attributes: ['id', 'designation_name', 'designation_code'] },
            { model: db.Country, as: 'country', attributes: ['id', 'country_name'] },
            { model: db.State, as: 'state', attributes: ['id', 'state_name'] },
            { model: db.City, as: 'city', attributes: ['id', 'city_name'] }
        ],
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

const getEmployeeById = async (companyId, id) => {
    const record = await db.Employee.findOne({
        where: { id: id, company_id: companyId },
        include: [
            { model: db.Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] },
            { model: db.Designation, as: 'designation', attributes: ['id', 'designation_name', 'designation_code'] },
            { model: db.Country, as: 'country', attributes: ['id', 'country_name'] },
            { model: db.State, as: 'state', attributes: ['id', 'state_name'] },
            { model: db.City, as: 'city', attributes: ['id', 'city_name'] },
            { model: db.Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name', 'employee_code'] }
        ]
    });

    if (!record) throw new Error("Employee not found.");
    return record;
};

const updateEmployee = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Employee.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Employee not found.");

        if (data.employee_code && data.employee_code !== record.employee_code) {
            const existingCode = await db.Employee.findOne({ where: { company_id: companyId, employee_code: data.employee_code }, transaction });
            if (existingCode) throw new Error("Employee Code must be unique within the company.");
        }

        if (data.email && data.email !== record.email) {
            const existingEmail = await db.Employee.findOne({ where: { company_id: companyId, email: data.email }, transaction });
            if (existingEmail) throw new Error("Email must be unique within the company.");
        }

        if (data.mobile && data.mobile !== record.mobile) {
            const existingMobile = await db.Employee.findOne({ where: { company_id: companyId, mobile: data.mobile }, transaction });
            if (existingMobile) throw new Error("Mobile must be unique within the company.");
        }

        const newDesignationId = data.designation_id || record.designation_id;
        const newDepartmentId = data.department_id || record.department_id;
        
        if (data.designation_id || data.department_id) {
            await validateDesignationDepartmentRule(newDesignationId, newDepartmentId, companyId, transaction);
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_EMPLOYEE | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_EMPLOYEE | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Employee.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Employee not found.");
        
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

const deleteEmployee = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Employee.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Employee not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    changeStatus,
    deleteEmployee
};
