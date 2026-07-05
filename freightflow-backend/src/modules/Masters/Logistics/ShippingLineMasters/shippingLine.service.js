/**
 * @file shippingLine.service.js
 * @description Business logic for Shipping Line operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const ShippingLine = db.ShippingLine || require("./shippingLine.model");
const Country = db.Country || require("../CountryMasters/country.model");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/ShippingLine/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/ShippingLine/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/ShippingLine/Delete.txt");

const createShippingLine = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validate Country if provided
        if (data.country_id) {
            const country = await Country.findOne({
                where: { id: data.country_id, company_id: companyId },
                transaction
            });
            if (!country) throw new Error("Invalid Country ID or Country does not belong to this company.");
        }

        // Duplicate Code Validation
        const existingCode = await ShippingLine.findOne({
            where: { company_id: companyId, shipping_line_code: data.shipping_line_code },
            transaction
        });
        if (existingCode) throw new Error("Shipping Line Code must be unique within the company.");

        // Duplicate Name Validation
        const existingName = await ShippingLine.findOne({
            where: { company_id: companyId, shipping_line_name: data.shipping_line_name },
            transaction
        });
        if (existingName) throw new Error("Shipping Line Name must be unique within the company.");

        const dataToInsert = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await ShippingLine.create(dataToInsert, { transaction });

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_SHIPPING_LINE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Code: ${newRecord.shipping_line_code} | Success: true`, createLogPath);

        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_SHIPPING_LINE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getShippingLines = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, country_id } = queryOptions;

    const offset = (page - 1) * limit;

    const whereClause = {
        company_id: companyId
    };

    if (status) whereClause.status = status;
    if (country_id) whereClause.country_id = country_id;

    if (search) {
        whereClause[Op.or] = [
            { shipping_line_code: { [Op.iLike]: `%${search}%` } },
            { shipping_line_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await ShippingLine.findAndCountAll({
        where: whereClause,
        include: [
            { model: Country, as: 'country', attributes: ['id', 'country_code', 'country_name'] }
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

const getShippingLineById = async (companyId, id) => {
    const record = await ShippingLine.findOne({
        where: { id: id, company_id: companyId },
        include: [
            { model: Country, as: 'country', attributes: ['id', 'country_code', 'country_name'] }
        ]
    });

    if (!record) {
        throw new Error("Shipping Line not found.");
    }
    return record;
};

const updateShippingLine = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ShippingLine.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Shipping Line not found.");
        }

        if (data.country_id && data.country_id !== record.country_id) {
            const country = await Country.findOne({
                where: { id: data.country_id, company_id: companyId },
                transaction
            });
            if (!country) throw new Error("Invalid Country ID or Country does not belong to this company.");
        }

        if (data.shipping_line_code && data.shipping_line_code !== record.shipping_line_code) {
            const existingCode = await ShippingLine.findOne({
                where: { company_id: companyId, shipping_line_code: data.shipping_line_code },
                transaction
            });
            if (existingCode) throw new Error("Shipping Line Code must be unique within the company.");
        }

        if (data.shipping_line_name && data.shipping_line_name !== record.shipping_line_name) {
            const existingName = await ShippingLine.findOne({
                where: { company_id: companyId, shipping_line_name: data.shipping_line_name },
                transaction
            });
            if (existingName) throw new Error("Shipping Line Name must be unique within the company.");
        }

        const dataToUpdate = {
            ...data,
            updated_by: userId
        };

        const updatedRecord = await record.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_SHIPPING_LINE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_SHIPPING_LINE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ShippingLine.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Shipping Line not found.");
        }

        record.status = status;
        record.updated_by = userId;
        const updatedRecord = await record.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_SHIPPING_LINE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_SHIPPING_LINE | ID: ${id} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteShippingLine = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await ShippingLine.findOne({
            where: { id: id, company_id: companyId },
            transaction
        });

        if (!record) {
            throw new Error("Shipping Line not found.");
        }

        await record.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_SHIPPING_LINE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_SHIPPING_LINE | ID: ${id} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createShippingLine,
    getShippingLines,
    getShippingLineById,
    updateShippingLine,
    changeStatus,
    deleteShippingLine
};
