/**
 * @file city.service.js
 * @description Business logic for City operations.
 */
const { Op } = require("sequelize");
const City = require("./city.model");
const State = require("../StateMasters/state.model");
const Country = require("../CountryMasters/country.model");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/City/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/City/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/City/Delete.txt");

const createCity = async (companyId, cityData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validate Hierarchy: state_id must belong to country_id, and both to company_id
        const state = await State.findOne({
            where: { id: cityData.state_id, company_id: companyId },
            transaction
        });

        if (!state) {
            throw new Error("Invalid State ID or State does not belong to this company.");
        }

        if (state.country_id !== cityData.country_id) {
            throw new Error("The selected State does not belong to the selected Country.");
        }

        const country = await Country.findOne({
            where: { id: cityData.country_id, company_id: companyId },
            transaction
        });

        if (!country) {
            throw new Error("Invalid Country ID or Country does not belong to this company.");
        }

        // Check uniqueness of city_code within the state for this company
        const existingCity = await City.findOne({
            where: { 
                company_id: companyId, 
                state_id: cityData.state_id,
                city_code: cityData.city_code 
            },
            transaction
        });

        if (existingCity) {
            throw new Error("City Code must be unique within the selected state.");
        }

        const dataToInsert = { 
            ...cityData, 
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newCity = await City.create(dataToInsert, { transaction });

        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CITY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | City Code: ${newCity.city_code} | Success: true`, createLogPath);
        
        return newCity;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CITY | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCities = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status, country_id, state_id } = queryOptions;
    
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

    if (state_id) {
        whereClause.state_id = state_id;
    }

    if (search) {
        whereClause[Op.or] = [
            { city_code: { [Op.iLike]: `%${search}%` } },
            { city_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await City.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Country,
                as: 'country',
                attributes: ['id', 'country_code', 'country_name']
            },
            {
                model: State,
                as: 'state',
                attributes: ['id', 'state_code', 'state_name']
            }
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

const getCityById = async (companyId, cityId) => {
    const city = await City.findOne({
        where: { id: cityId, company_id: companyId },
        include: [
            {
                model: Country,
                as: 'country',
                attributes: ['id', 'country_code', 'country_name']
            },
            {
                model: State,
                as: 'state',
                attributes: ['id', 'state_code', 'state_name']
            }
        ]
    });

    if (!city) {
        throw new Error("City not found.");
    }
    return city;
};

const updateCity = async (companyId, cityId, cityData, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const city = await City.findOne({
            where: { id: cityId, company_id: companyId },
            transaction
        });

        if (!city) {
            throw new Error("City not found.");
        }

        let targetCountryId = city.country_id;
        let targetStateId = city.state_id;

        if (cityData.country_id || cityData.state_id) {
            targetCountryId = cityData.country_id || targetCountryId;
            targetStateId = cityData.state_id || targetStateId;

            const state = await State.findOne({
                where: { id: targetStateId, company_id: companyId },
                transaction
            });

            if (!state) {
                throw new Error("Invalid State ID or State does not belong to this company.");
            }

            if (state.country_id !== targetCountryId) {
                throw new Error("The selected State does not belong to the selected Country.");
            }
            
            const country = await Country.findOne({
                where: { id: targetCountryId, company_id: companyId },
                transaction
            });

            if (!country) {
                throw new Error("Invalid Country ID or Country does not belong to this company.");
            }
        }

        // Check unique city_code
        if (cityData.city_code && (cityData.city_code !== city.city_code || targetStateId !== city.state_id)) {
            const existingCity = await City.findOne({
                where: { 
                    company_id: companyId, 
                    state_id: targetStateId,
                    city_code: cityData.city_code 
                },
                transaction
            });
            if (existingCity && existingCity.id !== cityId) {
                throw new Error("City Code must be unique within the selected state.");
            }
        }

        const dataToUpdate = { 
            ...cityData,
            updated_by: userId
        };

        const updatedCity = await city.update(dataToUpdate, { transaction });
        await transaction.commit();
        
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CITY | City ID: ${cityId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        
        return updatedCity;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CITY | City ID: ${cityId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, cityId, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const city = await City.findOne({
            where: { id: cityId, company_id: companyId },
            transaction
        });

        if (!city) {
            throw new Error("City not found.");
        }

        city.status = status;
        city.updated_by = userId;
        const updatedCity = await city.save({ transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CITY | City ID: ${cityId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, updateLogPath);
        return updatedCity;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: STATUS_CHANGE_CITY | City ID: ${cityId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const deleteCity = async (companyId, cityId, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const city = await City.findOne({
            where: { id: cityId, company_id: companyId },
            transaction
        });

        if (!city) {
            throw new Error("City not found.");
        }

        await city.destroy({ transaction });
        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CITY | City ID: ${cityId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: true`, deleteLogPath);

        return true;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: DELETE_CITY | City ID: ${cityId} | User: ${userId} | Company: ${companyId} | IP: ${reqInfo.ip} | Success: false | Reason: ${error.message}`, deleteLogPath);
        throw error;
    }
};

module.exports = {
    createCity,
    getCities,
    getCityById,
    updateCity,
    changeStatus,
    deleteCity
};
