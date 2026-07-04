/**
 * @file commodity.service.js
 * @description Business logic for Commodity operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const Commodity = db.Commodity || require("./commodity.model");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Commodity/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Commodity/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Commodity/Delete.txt");

const createCommodity = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Duplicate Code Validation
        const existingCode = await Commodity.findOne({
            where: { company_id: companyId, commodity_code: data.commodity_code },
            transaction
        });
        if (existingCode) throw new Error("Commodity Code must be unique within the company.");

        // Duplicate HS Code Validation
        if (data.hs_code) {
            const existingHsCode = await Commodity.findOne({
                where: { company_id: companyId, hs_code: data.hs_code },
                transaction
            });
            if (existingHsCode) throw new Error("HS Code must be unique within the company.");
        }

        const dataToInsert = { 
            ...data, 
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await Commodity.create(dataToInsert, { transaction });

        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COMMODITY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Code: ${newRecord.commodity_code} | Success: true`, createLogPath);
        
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COMMODITY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCommodities = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, hazardous } = queryOptions;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {
        company_id: companyId
    };

    if (status) whereClause.status = status;
    if (hazardous) whereClause.hazardous = hazardous;

    if (search) {
        whereClause[Op.or] = [
            { commodity_code: { [Op.iLike]: `%${search}%` } },
            { commodity_name: { [Op.iLike]: `%${search}%` } },
            { hs_code: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Commodity.findAndCountAll({
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

const getCommodityById = async (companyId, id) => {
    const record = await Commodity.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) {
        throw new Error("Commodity not found.");
    }
    return record;
};

const updateCommodity = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await Commodity.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Commodity not found.");
        }

        if (data.commodity_code && data.commodity_code !== record.commodity_code) {
            const existingCode = await Commodity.findOne({
                where: { company_id: companyId, commodity_code: data.commodity_code },
                transaction
            });
            if (existingCode) throw new Error("Commodity Code must be unique within the company.");
        }

        if (data.hs_code && data.hs_code !== record.hs_code) {
            const existingHsCode = await Commodity.findOne({
                where: { company_id: companyId, hs_code: data.hs_code },
                transaction
            });
            if (existingHsCode) throw new Error("HS Code must be unique within the company.");
        }

        const dataToUpdate = { 
            ...data,
            updated_by: userId
        };

        const updatedRecord = await record.update(dataToUpdate, { transaction });
        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COMMODITY | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COMMODITY | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await Commodity.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Commodity not found.");
        }

        record.status = status;
        record.updated_by = userId;
        const updatedRecord = await record.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_COMMODITY | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_COMMODITY | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteCommodity = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await Commodity.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Commodity not found.");
        }

        await record.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COMMODITY | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COMMODITY | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createCommodity,
    getCommodities,
    getCommodityById,
    updateCommodity,
    changeStatus,
    deleteCommodity
};
