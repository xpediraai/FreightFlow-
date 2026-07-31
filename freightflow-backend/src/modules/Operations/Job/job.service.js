/**
 * @file job.service.js
 * @description Business logic layer for Job.
 */
const { Op } = require("sequelize");
const db = require("../../../database");
const { Job, Shipment } = db;

/**
 * Generate a unique Job Number for a company
 * Format: JOB-YYYYMM-XXXX
 */
const generateJobNumber = async (companyId) => {
    const date = new Date();
    const yearMonth = date.getFullYear().toString() + String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `JOB-${yearMonth}-`;

    const lastJob = await Job.findOne({
        where: {
            company_id: companyId,
            job_number: { [Op.like]: `${prefix}%` }
        },
        order: [['created_at', 'DESC']],
        paranoid: false
    });

    let nextNumber = 1;
    if (lastJob && lastJob.job_number) {
        const parts = lastJob.job_number.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) {
            nextNumber = lastSeq + 1;
        }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

const createJob = async (companyId, data, userId, reqInfo = {}) => {
    // Check if shipment exists and belongs to company
    const shipment = await Shipment.findOne({
        where: { id: data.shipment_id, company_id: companyId }
    });

    if (!shipment) {
        throw new Error("Invalid shipment ID. Shipment not found.");
    }

    // Check if a job already exists for this shipment
    const existingJob = await Job.findOne({
        where: { shipment_id: data.shipment_id, company_id: companyId }
    });

    if (existingJob) {
        throw new Error("A job has already been created for this shipment.");
    }

    const job_number = await generateJobNumber(companyId);

    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === "" || sanitized[key] === undefined) {
            sanitized[key] = null;
        }
    });

    const newJob = await Job.create({
        ...sanitized,
        job_number,
        company_id: companyId,
        created_by: userId,
        updated_by: userId
    });

    return getJobById(companyId, newJob.id);
};

const getJobs = async (companyId, query = {}) => {
    const { 
        page = 1, 
        limit = 20, 
        search, 
        status, 
        priority,
        assigned_employee_id, 
        shipment_id
    } = query;

    const offset = (page - 1) * limit;
    const where = { company_id: companyId };

    if (status && status !== "ALL STATUS" && status !== "ALL") {
        where.status = status;
    }

    if (priority && priority !== "ALL") {
        where.priority = priority;
    }

    if (assigned_employee_id) where.assigned_employee_id = assigned_employee_id;
    if (shipment_id) where.shipment_id = shipment_id;

    if (search && search.trim() !== "") {
        where[Op.or] = [
            { job_number: { [Op.iLike]: `%${search.trim()}%` } },
            { remarks: { [Op.iLike]: `%${search.trim()}%` } }
        ];
    }

    const include = [
        {
            model: db.Shipment,
            as: 'shipment',
            attributes: ['id', 'shipment_number', 'shipment_type', 'status'],
            include: [
                { model: db.Customer, as: 'customer', attributes: ['id', 'customer_name', 'customer_code'] }
            ]
        },
        { model: db.Employee, as: 'assignedEmployee', attributes: ['id', 'first_name', 'last_name', 'employee_code'] },
        { model: db.Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] }
    ];

    const { count, rows } = await Job.findAndCountAll({
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

const getJobById = async (companyId, id) => {
    const job = await Job.findOne({
        where: { id, company_id: companyId },
        include: [
            {
                model: db.Shipment,
                as: 'shipment',
                include: [
                    { model: db.Customer, as: 'customer' },
                    { model: db.Vendor, as: 'vendor' },
                    { model: db.Country, as: 'originCountry' },
                    { model: db.Port, as: 'originPort' },
                    { model: db.Country, as: 'destinationCountry' },
                    { model: db.Port, as: 'destinationPort' },
                    { model: db.TransportMode, as: 'transportMode' },
                    { model: db.ShippingLine, as: 'shippingLine' }
                ]
            },
            { model: db.Employee, as: 'assignedEmployee' },
            { model: db.Department, as: 'department' }
        ]
    });

    if (!job) {
        throw new Error("Job not found.");
    }

    return job;
};

const updateJob = async (companyId, id, data, userId, reqInfo = {}) => {
    const job = await Job.findOne({ where: { id, company_id: companyId } });
    if (!job) {
        throw new Error("Job not found.");
    }

    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === "" || sanitized[key] === undefined) {
            sanitized[key] = null;
        }
    });

    await job.update({
        ...sanitized,
        updated_by: userId
    });

    return getJobById(companyId, id);
};

const changeStatus = async (companyId, id, status, userId, reqInfo = {}) => {
    const job = await Job.findOne({ where: { id, company_id: companyId } });
    if (!job) {
        throw new Error("Job not found.");
    }

    await job.update({
        status,
        updated_by: userId
    });

    return getJobById(companyId, id);
};

const deleteJob = async (companyId, id, userId, reqInfo = {}) => {
    const job = await Job.findOne({ where: { id, company_id: companyId } });
    if (!job) {
        throw new Error("Job not found.");
    }

    await job.update({ deleted_by: userId });
    await job.destroy();

    return true;
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    changeStatus,
    deleteJob
};
