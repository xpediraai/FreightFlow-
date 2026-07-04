/**
 * @file port.service.js
 * @description Business logic for Port operations.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const Port = db.Port || require("./port.model"); // Fallback if db not initialized
const Country = db.Country || require("../CountryMasters/country.model");
const State = db.State || require("../StateMasters/state.model");
const City = db.City || require("../CityMasters/city.model");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Port/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Port/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Port/Delete.txt");

const validateHierarchy = async (companyId, countryId, stateId, cityId, transaction) => {
    // Validate Country
    const country = await Country.findOne({
        where: { id: countryId, company_id: companyId },
        transaction
    });
    if (!country) throw new Error("Invalid Country ID or Country does not belong to this company.");

    // Validate State
    if (stateId) {
        const state = await State.findOne({
            where: { id: stateId, company_id: companyId },
            transaction
        });
        if (!state) throw new Error("Invalid State ID or State does not belong to this company.");
        if (state.country_id !== countryId) throw new Error("The selected State does not belong to the selected Country.");
        
        // Validate City
        if (cityId) {
            const city = await City.findOne({
                where: { id: cityId, company_id: companyId },
                transaction
            });
            if (!city) throw new Error("Invalid City ID or City does not belong to this company.");
            if (city.state_id !== stateId) throw new Error("The selected City does not belong to the selected State.");
        }
    } else if (cityId) {
        // If city is provided but state is not, that's invalid hierarchy for our ERP.
        throw new Error("State ID is required if City ID is provided.");
    }
};

const createPort = async (companyId, portData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        await validateHierarchy(companyId, portData.country_id, portData.state_id, portData.city_id, transaction);

        const existingPort = await Port.findOne({
            where: { company_id: companyId, port_code: portData.port_code },
            transaction
        });

        if (existingPort) {
            throw new Error("Port Code must be unique within the company.");
        }

        const dataToInsert = { 
            ...portData, 
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newPort = await Port.create(dataToInsert, { transaction });

        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PORT | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Port Code: ${newPort.port_code} | Success: true`, createLogPath);
        
        return newPort;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PORT | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getPorts = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, country_id, state_id, city_id } = queryOptions;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {
        company_id: companyId
    };

    if (status) whereClause.status = status;
    if (country_id) whereClause.country_id = country_id;
    if (state_id) whereClause.state_id = state_id;
    if (city_id) whereClause.city_id = city_id;

    if (search) {
        whereClause[Op.or] = [
            { port_code: { [Op.iLike]: `%${search}%` } },
            { port_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Port.findAndCountAll({
        where: whereClause,
        include: [
            { model: Country, as: 'country', attributes: ['id', 'country_code', 'country_name'] },
            { model: State, as: 'state', attributes: ['id', 'state_code', 'state_name'] },
            { model: City, as: 'city', attributes: ['id', 'city_code', 'city_name'] }
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

const getPortById = async (companyId, portId) => {
    const port = await Port.findOne({
        where: { id: portId, company_id: companyId },
        include: [
            { model: Country, as: 'country', attributes: ['id', 'country_code', 'country_name'] },
            { model: State, as: 'state', attributes: ['id', 'state_code', 'state_name'] },
            { model: City, as: 'city', attributes: ['id', 'city_code', 'city_name'] }
        ]
    });

    if (!port) {
        throw new Error("Port not found.");
    }
    return port;
};

const updatePort = async (companyId, portId, portData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const port = await Port.findOne({
            where: { id: portId, company_id: companyId },
            transaction
        });

        if (!port) {
            throw new Error("Port not found.");
        }

        let targetCountryId = portData.country_id !== undefined ? portData.country_id : port.country_id;
        let targetStateId = portData.state_id !== undefined ? portData.state_id : port.state_id;
        let targetCityId = portData.city_id !== undefined ? portData.city_id : port.city_id;

        if (portData.country_id || portData.state_id || portData.city_id) {
            await validateHierarchy(companyId, targetCountryId, targetStateId, targetCityId, transaction);
        }

        if (portData.port_code && portData.port_code !== port.port_code) {
            const existingPort = await Port.findOne({
                where: { company_id: companyId, port_code: portData.port_code },
                transaction
            });
            if (existingPort) {
                throw new Error("Port Code must be unique within the company.");
            }
        }

        const dataToUpdate = { 
            ...portData,
            updated_by: userId
        };

        const updatedPort = await port.update(dataToUpdate, { transaction });
        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PORT | Port ID: ${portId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        
        return updatedPort;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PORT | Port ID: ${portId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, portId, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const port = await Port.findOne({
            where: { id: portId, company_id: companyId },
            transaction
        });

        if (!port) {
            throw new Error("Port not found.");
        }

        port.status = status;
        port.updated_by = userId;
        const updatedPort = await port.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_PORT | Port ID: ${portId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedPort;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_PORT | Port ID: ${portId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deletePort = async (companyId, portId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const port = await Port.findOne({
            where: { id: portId, company_id: companyId },
            transaction
        });

        if (!port) {
            throw new Error("Port not found.");
        }

        await port.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_PORT | Port ID: ${portId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_PORT | Port ID: ${portId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createPort,
    getPorts,
    getPortById,
    updatePort,
    changeStatus,
    deletePort
};
