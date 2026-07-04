/**
 * @file customer.service.js
 * @description Business logic for Customer operations with nested transactions.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Customer/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Customer/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Customer/Delete.txt");

const generateCustomerCode = async (companyId, transaction) => {
    const lastCustomer = await db.Customer.findOne({
        where: { company_id: companyId },
        order: [['created_at', 'DESC']],
        paranoid: false,
        transaction
    });

    if (!lastCustomer || !lastCustomer.customer_code) {
        return "CUST-0001";
    }

    const lastCode = lastCustomer.customer_code; // e.g., CUST-0042
    const parts = lastCode.split('-');
    if (parts.length === 2 && !isNaN(parts[1])) {
        const num = parseInt(parts[1], 10) + 1;
        return `CUST-${num.toString().padStart(4, '0')}`;
    }
    return `CUST-${Date.now().toString().slice(-4)}`;
};

const createCustomer = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validation for Duplicates within company
        if (data.gst_number) {
            const existingGst = await db.Customer.findOne({ where: { company_id: companyId, gst_number: data.gst_number }, transaction });
            if (existingGst) throw new Error("GST Number must be unique within the company.");
        }
        if (data.pan_number) {
            const existingPan = await db.Customer.findOne({ where: { company_id: companyId, pan_number: data.pan_number }, transaction });
            if (existingPan) throw new Error("PAN Number must be unique within the company.");
        }
        if (data.iec_code) {
            const existingIec = await db.Customer.findOne({ where: { company_id: companyId, iec_code: data.iec_code }, transaction });
            if (existingIec) throw new Error("IEC Code must be unique within the company.");
        }

        const customerCode = await generateCustomerCode(companyId, transaction);

        const customerData = {
            ...data,
            company_id: companyId,
            customer_code: customerCode,
            created_by: userId,
            updated_by: userId
        };

        const newCustomer = await db.Customer.create(customerData, { transaction });

        if (data.contacts && data.contacts.length > 0) {
            const contacts = data.contacts.map(c => ({ ...c, customer_id: newCustomer.id }));
            await db.CustomerContact.bulkCreate(contacts, { transaction });
        }
        if (data.addresses && data.addresses.length > 0) {
            const addresses = data.addresses.map(a => ({ ...a, customer_id: newCustomer.id }));
            await db.CustomerAddress.bulkCreate(addresses, { transaction });
        }
        if (data.banks && data.banks.length > 0) {
            const banks = data.banks.map(b => ({ ...b, customer_id: newCustomer.id }));
            await db.CustomerBank.bulkCreate(banks, { transaction });
        }
        if (data.documents && data.documents.length > 0) {
            const docs = data.documents.map(d => ({ ...d, customer_id: newCustomer.id }));
            await db.CustomerDocument.bulkCreate(docs, { transaction });
        }

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CUSTOMER | Code: ${customerCode} | Success: true`, createLogPath);
        return newCustomer;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_CUSTOMER | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getCustomers = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { customer_code: { [Op.iLike]: `%${search}%` } },
            { customer_name: { [Op.iLike]: `%${search}%` } },
            { gst_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Customer.findAndCountAll({
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

const getCustomerById = async (companyId, id) => {
    const record = await db.Customer.findOne({
        where: { id: id, company_id: companyId },
        include: [
            { model: db.CustomerContact, as: 'contacts' },
            { model: db.CustomerAddress, as: 'addresses' },
            { model: db.CustomerBank, as: 'banks' },
            { model: db.CustomerDocument, as: 'documents' }
        ]
    });

    if (!record) throw new Error("Customer not found.");
    return record;
};

const updateCustomer = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Customer.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Customer not found.");

        if (data.gst_number && data.gst_number !== record.gst_number) {
            const existingGst = await db.Customer.findOne({ where: { company_id: companyId, gst_number: data.gst_number }, transaction });
            if (existingGst) throw new Error("GST Number must be unique within the company.");
        }
        if (data.pan_number && data.pan_number !== record.pan_number) {
            const existingPan = await db.Customer.findOne({ where: { company_id: companyId, pan_number: data.pan_number }, transaction });
            if (existingPan) throw new Error("PAN Number must be unique within the company.");
        }
        if (data.iec_code && data.iec_code !== record.iec_code) {
            const existingIec = await db.Customer.findOne({ where: { company_id: companyId, iec_code: data.iec_code }, transaction });
            if (existingIec) throw new Error("IEC Code must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        delete dataToUpdate.contacts;
        delete dataToUpdate.addresses;
        delete dataToUpdate.banks;
        delete dataToUpdate.documents;

        await record.update(dataToUpdate, { transaction });

        // Update Contacts (simplistic wipe-and-replace or diff. Going with destroy & insert for simplicity, though diffing is better for production if ids matter. We will destroy and bulk create).
        if (data.contacts) {
            await db.CustomerContact.destroy({ where: { customer_id: id }, transaction });
            const contacts = data.contacts.map(c => ({ ...c, id: undefined, customer_id: id }));
            await db.CustomerContact.bulkCreate(contacts, { transaction });
        }
        if (data.addresses) {
            await db.CustomerAddress.destroy({ where: { customer_id: id }, transaction });
            const addresses = data.addresses.map(a => ({ ...a, id: undefined, customer_id: id }));
            await db.CustomerAddress.bulkCreate(addresses, { transaction });
        }
        if (data.banks) {
            await db.CustomerBank.destroy({ where: { customer_id: id }, transaction });
            const banks = data.banks.map(b => ({ ...b, id: undefined, customer_id: id }));
            await db.CustomerBank.bulkCreate(banks, { transaction });
        }
        if (data.documents) {
            await db.CustomerDocument.destroy({ where: { customer_id: id }, transaction });
            const docs = data.documents.map(d => ({ ...d, id: undefined, customer_id: id }));
            await db.CustomerDocument.bulkCreate(docs, { transaction });
        }

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CUSTOMER | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_CUSTOMER | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Customer.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Customer not found.");
        
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

const deleteCustomer = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Customer.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Customer not found.");

        await db.CustomerContact.destroy({ where: { customer_id: id }, transaction });
        await db.CustomerAddress.destroy({ where: { customer_id: id }, transaction });
        await db.CustomerBank.destroy({ where: { customer_id: id }, transaction });
        await db.CustomerDocument.destroy({ where: { customer_id: id }, transaction });
        await record.destroy({ transaction });

        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    changeStatus,
    deleteCustomer
};
