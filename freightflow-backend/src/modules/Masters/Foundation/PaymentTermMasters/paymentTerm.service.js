/**
 * @file paymentTerm.service.js
 * @description Business logic for Payment Term Master operations.
 */
const { Op } = require("sequelize");
const db = require("../../../../database/index");
const sequelize = require("../../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../../logs/PaymentTerm/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../../logs/PaymentTerm/Update.txt");

const createPaymentTerm = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const existingCode = await db.PaymentTerm.findOne({
            where: { company_id: companyId, payment_term_code: { [Op.iLike]: data.payment_term_code } },
            transaction
        });
        if (existingCode) throw new Error("Payment Term Code must be unique within the company.");

        const existingName = await db.PaymentTerm.findOne({
            where: { company_id: companyId, payment_term_name: { [Op.iLike]: data.payment_term_name } },
            transaction
        });
        if (existingName) throw new Error("Payment Term Name must be unique within the company.");

        const ptData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newRecord = await db.PaymentTerm.create(ptData, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PAYMENT_TERM | Code: ${data.payment_term_code} | Success: true`, createLogPath);
        return newRecord;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_PAYMENT_TERM | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getPaymentTerms = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { payment_term_code: { [Op.iLike]: `%${search}%` } },
            { payment_term_name: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.PaymentTerm.findAndCountAll({
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

const getPaymentTermById = async (companyId, id) => {
    const record = await db.PaymentTerm.findOne({
        where: { id: id, company_id: companyId }
    });

    if (!record) throw new Error("Payment Term not found.");
    return record;
};

const updatePaymentTerm = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PaymentTerm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Payment Term not found.");

        if (data.payment_term_code && data.payment_term_code.toLowerCase() !== record.payment_term_code.toLowerCase()) {
            const existingCode = await db.PaymentTerm.findOne({
                where: { company_id: companyId, payment_term_code: { [Op.iLike]: data.payment_term_code } },
                transaction
            });
            if (existingCode) throw new Error("Payment Term Code must be unique within the company.");
        }

        if (data.payment_term_name && data.payment_term_name.toLowerCase() !== record.payment_term_name.toLowerCase()) {
            const existingName = await db.PaymentTerm.findOne({
                where: { company_id: companyId, payment_term_name: { [Op.iLike]: data.payment_term_name } },
                transaction
            });
            if (existingName) throw new Error("Payment Term Name must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        await record.update(dataToUpdate, { transaction });

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PAYMENT_TERM | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_PAYMENT_TERM | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PaymentTerm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Payment Term not found.");

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

const deletePaymentTerm = async (companyId, id) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.PaymentTerm.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Payment Term not found.");

        await record.destroy({ transaction });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createPaymentTerm,
    getPaymentTerms,
    getPaymentTermById,
    updatePaymentTerm,
    changeStatus,
    deletePaymentTerm
};
