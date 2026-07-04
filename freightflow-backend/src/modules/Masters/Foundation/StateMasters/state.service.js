/**
 * @file state.service.js
 * @description Business logic for State operations.
 */
const { Op } = require("sequelize");
const State = require("./state.model");
const Country = require("../CountryMasters/country.model");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/State/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/State/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../../logs/State/Delete.txt");

const createState = async (companyId, stateData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validate that the country belongs to the same company
        const country = await Country.findOne({
            where: { id: stateData.country_id, company_id: companyId },
            transaction
        });

        if (!country) {
            throw new Error("Invalid Country ID or Country does not belong to this company.");
        }

        // Check uniqueness of state_code within the country for this company
        const existingState = await State.findOne({
            where: {
                company_id: companyId,
                country_id: stateData.country_id,
                state_code: stateData.state_code
            },
            transaction
        });

        if (existingState) {
            throw new Error("State Code must be unique within the selected country.");
        }

        const dataToInsert = {
            ...stateData,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newState = await State.create(dataToInsert, { transaction });

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_STATE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | State Code: ${newState.state_code} | Success: true`, createLogPath);

        return newState;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_STATE | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getStates = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, country_id } = queryOptions;

    const offset = (page - 1) * limit;

    const whereClause = {
        company_id: companyId
    };

    if (status) {
        whereClause.status = status;
    }

    if (country_id) {
        whereClause.country_id = country_id;
    }

    if (search) {
        whereClause[Op.or] = [
            { state_code: { [Op.iLike]: `%${search}%` } },
            { state_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await State.findAndCountAll({
        where: whereClause,
        include: [{
            model: Country,
            as: 'country',
            attributes: ['id', 'country_code', 'country_name']
        }],
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

const getStateById = async (companyId, stateId) => {
    const state = await State.findOne({
        where: { id: stateId, company_id: companyId },
        include: [{
            model: Country,
            as: 'country',
            attributes: ['id', 'country_code', 'country_name']
        }]
    });

    if (!state) {
        throw new Error("State not found.");
    }
    return state;
};

const updateState = async (companyId, stateId, stateData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const state = await State.findOne({
            where: { id: stateId, company_id: companyId },
            transaction
        });

        if (!state) {
            throw new Error("State not found.");
        }

        // If country_id is being updated, validate it belongs to the company
        let targetCountryId = state.country_id;
        if (stateData.country_id && stateData.country_id !== state.country_id) {
            const country = await Country.findOne({
                where: { id: stateData.country_id, company_id: companyId },
                transaction
            });

            if (!country) {
                throw new Error("Invalid Country ID or Country does not belong to this company.");
            }
            targetCountryId = stateData.country_id;
        }

        // Check unique state_code
        if (stateData.state_code && (stateData.state_code !== state.state_code || stateData.country_id !== state.country_id)) {
            const existingState = await State.findOne({
                where: {
                    company_id: companyId,
                    country_id: targetCountryId,
                    state_code: stateData.state_code
                },
                transaction
            });
            if (existingState && existingState.id !== stateId) {
                throw new Error("State Code must be unique within the selected country.");
            }
        }

        const dataToUpdate = {
            ...stateData,
            updated_by: userId
        };

        const updatedState = await state.update(dataToUpdate, { transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_STATE | State ID: ${stateId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);

        return updatedState;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_STATE | State ID: ${stateId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, stateId, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const state = await State.findOne({
            where: { id: stateId, company_id: companyId },
            transaction
        });

        if (!state) {
            throw new Error("State not found.");
        }

        state.status = status;
        state.updated_by = userId;
        const updatedState = await state.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_STATE | State ID: ${stateId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedState;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_STATE | State ID: ${stateId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteState = async (companyId, stateId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const state = await State.findOne({
            where: { id: stateId, company_id: companyId },
            transaction
        });

        if (!state) {
            throw new Error("State not found.");
        }

        await state.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_STATE | State ID: ${stateId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_STATE | State ID: ${stateId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createState,
    getStates,
    getStateById,
    updateState,
    changeStatus,
    deleteState
};
