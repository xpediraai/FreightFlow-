/**
 * @file currency.service.js
 * @description Business logic for Currency operations.
 */
const { Op } = require("sequelize");
const Currency = require("./currency.model");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Currency/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Currency/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Currency/Delete.txt");

const createCurrency = async (companyId, currencyData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Check uniqueness of currency_code for this company
        const existingCurrency = await Currency.findOne({
            where: { company_id: companyId, currency_code: currencyData.currency_code },
            transaction
        });

        if (existingCurrency) {
            throw new Error("Currency Code must be unique within the company.");
        }

        // Handle Base Currency Logic: Only one Base Currency per Company
        if (currencyData.base_currency === "Yes") {
            await Currency.update(
                { base_currency: "No" },
                { 
                    where: { company_id: companyId, base_currency: "Yes" },
                    transaction 
                }
            );
        }

        const dataToInsert = { 
            ...currencyData, 
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newCurrency = await Currency.create(dataToInsert, { transaction });

        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CURRENCY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Currency Code: ${newCurrency.currency_code} | Success: true`, createLogPath);
        
        return newCurrency;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CURRENCY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCurrencies = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, base_currency } = queryOptions;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {
        company_id: companyId
    };

    if (status) {
        whereClause.status = status;
    }

    if (base_currency) {
        whereClause.base_currency = base_currency;
    }

    if (search) {
        whereClause[Op.or] = [
            { currency_code: { [Op.iLike]: `%${search}%` } },
            { currency_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Currency.findAndCountAll({
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

const getCurrencyById = async (companyId, currencyId) => {
    const currency = await Currency.findOne({
        where: { id: currencyId, company_id: companyId }
    });

    if (!currency) {
        throw new Error("Currency not found.");
    }
    return currency;
};

const updateCurrency = async (companyId, currencyId, currencyData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const currency = await Currency.findOne({
            where: { id: currencyId, company_id: companyId },
            transaction
        });

        if (!currency) {
            throw new Error("Currency not found.");
        }

        if (currencyData.currency_code && currencyData.currency_code !== currency.currency_code) {
            const existingCurrency = await Currency.findOne({
                where: { company_id: companyId, currency_code: currencyData.currency_code },
                transaction
            });
            if (existingCurrency) {
                throw new Error("Currency Code must be unique within the company.");
            }
        }

        // Handle Base Currency Logic
        if (currencyData.base_currency === "Yes" && currency.base_currency !== "Yes") {
            await Currency.update(
                { base_currency: "No" },
                { 
                    where: { company_id: companyId, base_currency: "Yes", id: { [Op.ne]: currencyId } },
                    transaction 
                }
            );
        }

        const dataToUpdate = { 
            ...currencyData,
            updated_by: userId
        };

        const updatedCurrency = await currency.update(dataToUpdate, { transaction });
        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CURRENCY | Currency ID: ${currencyId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        
        return updatedCurrency;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CURRENCY | Currency ID: ${currencyId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, currencyId, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const currency = await Currency.findOne({
            where: { id: currencyId, company_id: companyId },
            transaction
        });

        if (!currency) {
            throw new Error("Currency not found.");
        }

        currency.status = status;
        currency.updated_by = userId;
        const updatedCurrency = await currency.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CURRENCY | Currency ID: ${currencyId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedCurrency;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CURRENCY | Currency ID: ${currencyId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteCurrency = async (companyId, currencyId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const currency = await Currency.findOne({
            where: { id: currencyId, company_id: companyId },
            transaction
        });

        if (!currency) {
            throw new Error("Currency not found.");
        }

        // Optional: If deleting a base currency, you might want to prevent it, but logic wasn't specified. We'll allow it for now.
        
        await currency.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CURRENCY | Currency ID: ${currencyId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CURRENCY | Currency ID: ${currencyId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createCurrency,
    getCurrencies,
    getCurrencyById,
    updateCurrency,
    changeStatus,
    deleteCurrency
};
