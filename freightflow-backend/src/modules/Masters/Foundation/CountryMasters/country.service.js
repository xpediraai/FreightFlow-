/**
 * @file country.service.js
 * @description Business logic for Country operations.
 */
const { Op } = require("sequelize");
const Country = require("./country.model");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/Country/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/Country/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/Country/Delete.txt");

const createCountry = async (companyId, countryData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Check uniqueness of country_code for this company
        const existingCountry = await Country.findOne({
            where: { company_id: companyId, country_code: countryData.country_code },
            transaction
        });

        if (existingCountry) {
            throw new Error("Country Code must be unique within the company.");
        }

        const dataToInsert = {
            ...countryData,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newCountry = await Country.create(dataToInsert, { transaction });

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COUNTRY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Country Code: ${newCountry.country_code} | Success: true`, createLogPath);

        return newCountry;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_COUNTRY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCountries = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;

    const offset = (page - 1) * limit;

    const whereClause = {
        company_id: companyId
    };

    if (status) {
        whereClause.status = status;
    }

    if (search) {
        whereClause[Op.or] = [
            { country_code: { [Op.iLike]: `%${search}%` } },
            { country_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Country.findAndCountAll({
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

const getCountryById = async (companyId, countryId) => {
    const country = await Country.findOne({
        where: { id: countryId, company_id: companyId }
    });

    if (!country) {
        throw new Error("Country not found.");
    }
    return country;
};

const updateCountry = async (companyId, countryId, countryData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const country = await Country.findOne({
            where: { id: countryId, company_id: companyId },
            transaction
        });

        if (!country) {
            throw new Error("Country not found.");
        }

        if (countryData.country_code && countryData.country_code !== country.country_code) {
            const existingCountry = await Country.findOne({
                where: { company_id: companyId, country_code: countryData.country_code },
                transaction
            });
            if (existingCountry) {
                throw new Error("Country Code must be unique within the company.");
            }
        }

        const dataToUpdate = {
            ...countryData,
            updated_by: userId
        };

        const updatedCountry = await country.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COUNTRY | Country ID: ${countryId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedCountry;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_COUNTRY | Country ID: ${countryId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, countryId, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const country = await Country.findOne({
            where: { id: countryId, company_id: companyId },
            transaction
        });

        if (!country) {
            throw new Error("Country not found.");
        }

        country.status = status;
        country.updated_by = userId;
        const updatedCountry = await country.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_COUNTRY | Country ID: ${countryId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedCountry;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_COUNTRY | Country ID: ${countryId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteCountry = async (companyId, countryId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const country = await Country.findOne({
            where: { id: countryId, company_id: companyId },
            transaction
        });

        if (!country) {
            throw new Error("Country not found.");
        }

        await country.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COUNTRY | Country ID: ${countryId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_COUNTRY | Country ID: ${countryId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createCountry,
    getCountries,
    getCountryById,
    updateCountry,
    changeStatus,
    deleteCountry
};
