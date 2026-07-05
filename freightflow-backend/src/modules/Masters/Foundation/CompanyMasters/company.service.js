/**
 * @file company.service.js
 * @description Business logic for Company operations.
 */
const Company = require("./company.model");
const UserCompanies = require("./user_companies.model");
const sequelize = require("../../../../config/database");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/Company/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/Company/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/Company/Delete.txt");

/**
 * Creates a new company and links it to the creating user.
 * Uses a Sequelize transaction to ensure atomicity.
 */
const createCompany = async (companyData, userId, files, generatedId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Check uniqueness of company_code
        const existingCompany = await Company.findOne({
            where: { company_code: companyData.company_code },
            transaction
        });

        if (existingCompany) {
            throw new Error("Company Code must be unique.");
        }

        const dataToInsert = { ...companyData, id: generatedId };

        if (files) {
            if (files.logo && files.logo.length > 0) {
                dataToInsert.logo = files.logo[0].path;
            }
            if (files.signature && files.signature.length > 0) {
                dataToInsert.signature = files.signature[0].path;
            }
        }

        const newCompany = await Company.create(dataToInsert, { transaction });

        await UserCompanies.create({
            user_id: userId,
            company_id: newCompany.id,
            is_default: true // Assume first created company is default
        }, { transaction });

        if (companyData.owner_id) {
            await UserCompanies.create({
                user_id: companyData.owner_id,
                company_id: newCompany.id,
                is_default: true
            }, { transaction });
        }

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COMPANY | User: ${userId} | IP: ${reqInfo.ip} | Company Code: ${newCompany.company_code} | Success: true`, createLogPath);

        return newCompany;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COMPANY | User: ${userId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

/**
 * Updates an existing company.
 */
const updateCompany = async (companyId, companyData, files, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const company = await Company.findByPk(companyId, { transaction });
        if (!company) {
            throw new Error("Company not found.");
        }

        if (companyData.company_code && companyData.company_code !== company.company_code) {
            const existingCompany = await Company.findOne({
                where: { company_code: companyData.company_code },
                transaction
            });
            if (existingCompany) {
                throw new Error("Company Code must be unique.");
            }
        }

        const dataToUpdate = { ...companyData };

        if (files) {
            if (files.logo && files.logo.length > 0) {
                dataToUpdate.logo = files.logo[0].path;
            }
            if (files.signature && files.signature.length > 0) {
                dataToUpdate.signature = files.signature[0].path;
            }
        }

        const updatedCompany = await company.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COMPANY | Company ID: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedCompany;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COMPANY | Company ID: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

/**
 * Deletes an existing company (Soft Delete).
 */
const deleteCompany = async (companyId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const company = await Company.findByPk(companyId, { transaction });
        if (!company) {
            throw new Error("Company not found.");
        }

        await company.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COMPANY | Company ID: ${companyId} | User: ${userId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COMPANY | Company ID: ${companyId} | User: ${userId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

const getCompaniesByUser = async (userId) => {
    // Find all mapping records for the user
    const mappings = await UserCompanies.findAll({
        where: { user_id: userId }
    });

    if (!mappings.length) return [];

    const companyIds = mappings.map(m => m.company_id);

    // Fetch actual companies
    const companies = await Company.findAll({
        where: { id: companyIds }
    });

    return companies;
};

const getAllCompanies = async () => {
    return await Company.findAll();
};

const getDashboardStats = async () => {
    const Users = require("../../../Auth/Users/users.model");
    const Employee = require("../../Organization/EmployeeMasters/employee.model");
    const Department = require("../../Organization/DepartmentMasters/department.model");
    const sequelize = require("../../../../config/database");
    
    const totalCompanies = await Company.count();
    const activeCompanies = await Company.count({ where: { status: 'Active' } });
    const totalOwners = await Users.count({ where: { role: 'COMPANY_OWNER' } });
    const totalEmployees = await Employee.count();
    
    // 1. Dynamic Company Growth (Grouped by month of created_at)
    // Using PostgreSQL to_char for month extraction
    const companyGrowthRaw = await Company.findAll({
        attributes: [
            [sequelize.literal("to_char(created_at, 'FMMonth')"), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.literal("to_char(created_at, 'FMMonth')")],
        raw: true
    });

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const chartData = companyGrowthRaw
        .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
        .map(item => ({
            name: item.month ? item.month.substring(0, 3) : 'Unknown',
            companies: parseInt(item.count, 10)
        }));

    // Fallback if DB is empty to show at least one point so the graph doesn't break
    if (chartData.length === 0) {
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        chartData.push({ name: currentMonth, companies: 0 });
    }

    // 2. Dynamic Employee Distribution (Grouped by department)
    const employeeDistRaw = await Employee.findAll({
        attributes: [
            'department_id',
            [sequelize.fn('COUNT', sequelize.col('Employee.id')), 'count']
        ],
        group: ['department_id'],
        raw: true
    });

    // We don't have department names joined here, so we will fetch all departments and map them
    const allDepts = await Department.findAll({ raw: true });
    const deptMap = {};
    allDepts.forEach(d => deptMap[d.id] = d.department_name);

    const employeeDist = employeeDistRaw.map(item => ({
        name: deptMap[item.department_id] || 'Unknown',
        count: parseInt(item.count, 10)
    }));

    if (employeeDist.length === 0) {
        employeeDist.push({ name: 'None', count: 0 });
    }

    const recentActivity = [
        { id: 1, action: 'Dashboard Refreshed', target: 'Live Data Loaded', time: 'Just now' }
    ];

    // Build hierarchy for Employee Overview: Owner -> Company -> Department
    const owners = await Users.findAll({ where: { role: 'COMPANY_OWNER' }, raw: true });
    const allMappings = await UserCompanies.findAll({ raw: true });
    const allCompaniesList = await Company.findAll({ raw: true });
    const allEmployeesList = await Employee.findAll({ raw: true });

    const hierarchy = owners.map(owner => {
        const ownerMappings = allMappings.filter(m => m.user_id === owner.id);
        const companyIds = ownerMappings.map(m => m.company_id);
        
        const ownerCompanies = allCompaniesList.filter(c => companyIds.includes(c.id)).map(company => {
            const companyEmployees = allEmployeesList.filter(e => e.company_id === company.id);
            
            const deptGroups = {};
            companyEmployees.forEach(emp => {
                const dId = emp.department_id;
                if (!deptGroups[dId]) {
                    deptGroups[dId] = { id: dId || 'unknown', name: deptMap[dId] || 'Unknown', total: 0, active: 0, inactive: 0 };
                }
                deptGroups[dId].total += 1;
                // Assuming status defaults to Active if missing or checking specifically for Inactive
                if (emp.status === 'Inactive' || emp.status === false) deptGroups[dId].inactive += 1;
                else deptGroups[dId].active += 1;
            });
            
            return {
                id: company.id,
                name: company.company_name,
                total: companyEmployees.length,
                active: companyEmployees.filter(e => e.status !== 'Inactive' && e.status !== false).length,
                inactive: companyEmployees.filter(e => e.status === 'Inactive' || e.status === false).length,
                departments: Object.values(deptGroups)
            };
        });

        return {
            id: owner.id,
            name: owner.full_name || owner.email || 'Owner',
            totalCompanies: ownerCompanies.length,
            totalEmployees: ownerCompanies.reduce((sum, c) => sum + c.total, 0),
            companies: ownerCompanies
        };
    });

    return {
        totalCompanies,
        activeCompanies,
        totalOwners,
        totalEmployees,
        chartData,
        employeeDist,
        recentActivity,
        hierarchy
    };
};

module.exports = {
    createCompany,
    updateCompany,
    deleteCompany,
    getCompaniesByUser,
    getAllCompanies,
    getDashboardStats
};
