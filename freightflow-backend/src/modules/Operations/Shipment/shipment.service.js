/**
 * @file shipment.service.js
 * @description Business logic layer for Shipment.
 */
const { Op } = require("sequelize");
const db = require("../../../database");
const { Shipment } = db;

/**
 * Generate a unique Shipment Number for a company
 * Format: SHP-YYYYMM-XXXX
 */
const generateShipmentNumber = async (companyId) => {
    const date = new Date();
    const yearMonth = date.getFullYear().toString() + String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `SHP-${yearMonth}-`;

    const lastShipment = await Shipment.findOne({
        where: {
            company_id: companyId,
            shipment_number: { [Op.like]: `${prefix}%` }
        },
        order: [['created_at', 'DESC']],
        paranoid: false
    });

    let nextNumber = 1;
    if (lastShipment && lastShipment.shipment_number) {
        const parts = lastShipment.shipment_number.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) {
            nextNumber = lastSeq + 1;
        }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

const createShipment = async (companyId, data, userId, reqInfo = {}) => {
    const shipment_number = await generateShipmentNumber(companyId);

    // Sanitize empty strings to null for UUID fields
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === "" || sanitized[key] === undefined) {
            sanitized[key] = null;
        }
    });

    const newShipment = await Shipment.create({
        ...sanitized,
        shipment_number,
        company_id: companyId,
        created_by: userId,
        updated_by: userId
    });

    return getShipmentById(companyId, newShipment.id);
};

const getShipments = async (companyId, query = {}) => {
    const { 
        page = 1, 
        limit = 20, 
        search, 
        status, 
        customer_id, 
        shipment_type, 
        origin_country_id, 
        destination_country_id,
        origin_port_id,
        destination_port_id
    } = query;

    const offset = (page - 1) * limit;
    const where = { company_id: companyId };

    if (status && status !== "ALL STATUS" && status !== "ALL") {
        where.status = status;
    }

    if (customer_id) {
        where.customer_id = customer_id;
    }

    if (shipment_type && shipment_type !== "ALL") {
        where.shipment_type = shipment_type;
    }

    if (origin_country_id) where.origin_country_id = origin_country_id;
    if (destination_country_id) where.destination_country_id = destination_country_id;
    if (origin_port_id) where.origin_port_id = origin_port_id;
    if (destination_port_id) where.destination_port_id = destination_port_id;

    if (search && search.trim() !== "") {
        where[Op.or] = [
            { shipment_number: { [Op.iLike]: `%${search.trim()}%` } },
            { final_destination: { [Op.iLike]: `%${search.trim()}%` } },
            { remarks: { [Op.iLike]: `%${search.trim()}%` } }
        ];
    }

    const include = [
        { model: db.Customer, as: 'customer', attributes: ['id', 'customer_name', 'customer_code'] },
        { model: db.Vendor, as: 'vendor', attributes: ['id', 'vendor_name', 'vendor_code'] },
        { model: db.Employee, as: 'salesPerson', attributes: ['id', 'first_name', 'last_name', 'employee_code'] },
        { model: db.Employee, as: 'operationExecutive', attributes: ['id', 'first_name', 'last_name', 'employee_code'] },
        { model: db.Country, as: 'originCountry', attributes: ['id', 'country_name', 'country_code'] },
        { model: db.Port, as: 'originPort', attributes: ['id', 'port_name', 'port_code'] },
        { model: db.Country, as: 'destinationCountry', attributes: ['id', 'country_name', 'country_code'] },
        { model: db.Port, as: 'destinationPort', attributes: ['id', 'port_name', 'port_code'] },
        { model: db.TransportMode, as: 'transportMode', attributes: ['id', 'mode_name', 'mode_code'] },
        { model: db.ShippingLine, as: 'shippingLine', attributes: ['id', 'shipping_line_name', 'shipping_line_code'] },
        { model: db.Job, as: 'job', attributes: ['id', 'job_number', 'status', 'priority'] }
    ];

    const { count, rows } = await Shipment.findAndCountAll({
        where,
        include,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        data: rows
    };
};

const getShipmentById = async (companyId, id) => {
    const shipment = await Shipment.findOne({
        where: { id, company_id: companyId },
        include: [
            { model: db.Customer, as: 'customer' },
            { model: db.Vendor, as: 'vendor' },
            { model: db.Employee, as: 'salesPerson' },
            { model: db.Employee, as: 'operationExecutive' },
            { model: db.Commodity, as: 'commodity' },
            { model: db.PackageType, as: 'packageType' },
            { model: db.UOM, as: 'uom' },
            { model: db.Country, as: 'originCountry' },
            { model: db.Port, as: 'originPort' },
            { model: db.Country, as: 'destinationCountry' },
            { model: db.Port, as: 'destinationPort' },
            { model: db.TransportMode, as: 'transportMode' },
            { model: db.ShippingLine, as: 'shippingLine' },
            { model: db.Vehicle, as: 'vehicle' },
            { model: db.Warehouse, as: 'warehouse' },
            { model: db.Currency, as: 'currency' },
            { model: db.PaymentTerm, as: 'paymentTerm' },
            { model: db.Incoterm, as: 'incoterm' },
            { model: db.Charge, as: 'charge' },
            { model: db.Job, as: 'job' }
        ]
    });

    if (!shipment) {
        throw new Error("Shipment not found.");
    }

    return shipment;
};

const updateShipment = async (companyId, id, data, userId, reqInfo = {}) => {
    const shipment = await Shipment.findOne({ where: { id, company_id: companyId } });
    if (!shipment) {
        throw new Error("Shipment not found.");
    }

    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === "" || sanitized[key] === undefined) {
            sanitized[key] = null;
        }
    });

    await shipment.update({
        ...sanitized,
        updated_by: userId
    });

    return getShipmentById(companyId, id);
};

const changeStatus = async (companyId, id, status, userId, reqInfo = {}) => {
    const shipment = await Shipment.findOne({ where: { id, company_id: companyId } });
    if (!shipment) {
        throw new Error("Shipment not found.");
    }

    await shipment.update({
        status,
        updated_by: userId
    });

    return getShipmentById(companyId, id);
};

const deleteShipment = async (companyId, id, userId, reqInfo = {}) => {
    const shipment = await Shipment.findOne({ where: { id, company_id: companyId } });
    if (!shipment) {
        throw new Error("Shipment not found.");
    }

    await shipment.update({ deleted_by: userId });
    await shipment.destroy();

    return true;
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    changeStatus,
    deleteShipment
};
