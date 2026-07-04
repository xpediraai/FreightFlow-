/**
 * @file vendor.service.js
 * @description Business logic for Vendor operations with nested transactions.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");
const path = require("path");
const { writeLogToFile } = require("../../../services/loggerService");

const createLogPath = path.join(__dirname, "../../../../logs/Vendor/Create.txt");
const updateLogPath = path.join(__dirname, "../../../../logs/Vendor/Update.txt");
const deleteLogPath = path.join(__dirname, "../../../../logs/Vendor/Delete.txt");

const createVendor = async (companyId, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        // Validation for Duplicates within company
        if (data.vendor_code) {
            const existingCode = await db.Vendor.findOne({ where: { company_id: companyId, vendor_code: data.vendor_code }, transaction });
            if (existingCode) throw new Error("Vendor Code must be unique within the company.");
        }
        if (data.gst_number) {
            const existingGst = await db.Vendor.findOne({ where: { company_id: companyId, gst_number: data.gst_number }, transaction });
            if (existingGst) throw new Error("GST Number must be unique within the company.");
        }

        const vendorData = {
            ...data,
            company_id: companyId,
            created_by: userId,
            updated_by: userId
        };

        const newVendor = await db.Vendor.create(vendorData, { transaction });

        if (data.contacts && data.contacts.length > 0) {
            const contacts = data.contacts.map(c => ({ ...c, vendor_id: newVendor.id }));
            await db.VendorContact.bulkCreate(contacts, { transaction });
        }
        if (data.addresses && data.addresses.length > 0) {
            const addresses = data.addresses.map(a => ({ ...a, vendor_id: newVendor.id }));
            await db.VendorAddress.bulkCreate(addresses, { transaction });
        }
        if (data.banks && data.banks.length > 0) {
            const banks = data.banks.map(b => ({ ...b, vendor_id: newVendor.id }));
            await db.VendorBank.bulkCreate(banks, { transaction });
        }

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_VENDOR | Code: ${data.vendor_code} | Success: true`, createLogPath);
        return newVendor;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CREATE_VENDOR | Success: false | Reason: ${error.message}`, createLogPath);
        throw error;
    }
};

const getVendors = async (companyId, queryOptions) => {
    const { page, limit, search, sortBy, sortOrder, status } = queryOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = { company_id: companyId };
    if (status) whereClause.status = status;

    if (search) {
        whereClause[Op.or] = [
            { vendor_code: { [Op.iLike]: `%${search}%` } },
            { vendor_name: { [Op.iLike]: `%${search}%` } },
            { gst_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await db.Vendor.findAndCountAll({
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

const getVendorById = async (companyId, id) => {
    const record = await db.Vendor.findOne({
        where: { id: id, company_id: companyId },
        include: [
            { model: db.VendorContact, as: 'contacts' },
            { model: db.VendorAddress, as: 'addresses' },
            { model: db.VendorBank, as: 'banks' }
        ]
    });

    if (!record) throw new Error("Vendor not found.");
    return record;
};

const updateVendor = async (companyId, id, data, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vendor.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vendor not found.");

        if (data.vendor_code && data.vendor_code !== record.vendor_code) {
            const existingCode = await db.Vendor.findOne({ where: { company_id: companyId, vendor_code: data.vendor_code }, transaction });
            if (existingCode) throw new Error("Vendor Code must be unique within the company.");
        }
        if (data.gst_number && data.gst_number !== record.gst_number) {
            const existingGst = await db.Vendor.findOne({ where: { company_id: companyId, gst_number: data.gst_number }, transaction });
            if (existingGst) throw new Error("GST Number must be unique within the company.");
        }

        const dataToUpdate = { ...data, updated_by: userId };
        delete dataToUpdate.contacts;
        delete dataToUpdate.addresses;
        delete dataToUpdate.banks;

        await record.update(dataToUpdate, { transaction });

        if (data.contacts) {
            await db.VendorContact.destroy({ where: { vendor_id: id }, transaction });
            const contacts = data.contacts.map(c => ({ ...c, id: undefined, vendor_id: id }));
            await db.VendorContact.bulkCreate(contacts, { transaction });
        }
        if (data.addresses) {
            await db.VendorAddress.destroy({ where: { vendor_id: id }, transaction });
            const addresses = data.addresses.map(a => ({ ...a, id: undefined, vendor_id: id }));
            await db.VendorAddress.bulkCreate(addresses, { transaction });
        }
        if (data.banks) {
            await db.VendorBank.destroy({ where: { vendor_id: id }, transaction });
            const banks = data.banks.map(b => ({ ...b, id: undefined, vendor_id: id }));
            await db.VendorBank.bulkCreate(banks, { transaction });
        }

        await transaction.commit();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_VENDOR | ID: ${id} | Success: true`, updateLogPath);
        return record;
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: UPDATE_VENDOR | ID: ${id} | Success: false | Reason: ${error.message}`, updateLogPath);
        throw error;
    }
};

const changeStatus = async (companyId, id, status, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vendor.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vendor not found.");
        
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

const deleteVendor = async (companyId, id, userId, reqInfo) => {
    const transaction = await sequelize.transaction();
    try {
        const record = await db.Vendor.findOne({ where: { id, company_id: companyId }, transaction });
        if (!record) throw new Error("Vendor not found.");

        await db.VendorContact.destroy({ where: { vendor_id: id }, transaction });
        await db.VendorAddress.destroy({ where: { vendor_id: id }, transaction });
        await db.VendorBank.destroy({ where: { vendor_id: id }, transaction });
        await record.destroy({ transaction });

        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    changeStatus,
    deleteVendor
};
