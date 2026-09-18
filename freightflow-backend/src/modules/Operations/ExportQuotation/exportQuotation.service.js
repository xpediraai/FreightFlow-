/**
 * @file exportQuotation.service.js
 * @description Business logic for Export Quotation operations with nested line charges and auto sequence generation.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");

/**
 * Generate Auto Quotation Number (Format: EQUOT/SS/MM-YY/001)
 */
const generateQuotationNo = async (companyId, transaction) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `EQUOT/SS/${month}-${year}/`;

  const whereClause = {};
  if (companyId) whereClause.company_id = companyId;

  const count = await db.ExportQuotation.count({
    where: whereClause,
    transaction,
  });

  const seq = String(count + 1).padStart(3, '0');
  return `${prefix}${seq}`;
};

/**
 * Calculate total amount from line item charges
 */
const calculateTotalAmount = (charges = []) => {
  return charges.reduce((sum, charge) => {
    if (charge.applicable !== false) {
      const amt = Number(charge.amount) || (Number(charge.quantity || 1) * Number(charge.rate || 0));
      return sum + amt;
    }
    return sum;
  }, 0);
};

/**
 * Create a new Export Quotation with charges
 */
const createExportQuotation = async (companyId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const quotationNo = data.quotation_no || (await generateQuotationNo(companyId, transaction));

    const totalAmount = data.charges && data.charges.length > 0 
      ? calculateTotalAmount(data.charges)
      : (data.total_amount || 0);

    const quotationData = {
      ...data,
      company_id: companyId || data.company_id || null,
      quotation_no: quotationNo,
      total_amount: totalAmount,
      created_by: userId || null,
      updated_by: userId || null,
    };

    const newQuotation = await db.ExportQuotation.create(quotationData, { transaction });

    if (data.charges && data.charges.length > 0) {
      const chargesToCreate = data.charges.map(c => ({
        ...c,
        quotation_id: newQuotation.id,
        amount: c.amount !== undefined ? c.amount : (Number(c.quantity || 1) * Number(c.rate || 0)),
      }));
      await db.ExportQuotationCharge.bulkCreate(chargesToCreate, { transaction });
    }

    await transaction.commit();

    return await getExportQuotationById(newQuotation.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get List of Export Quotations with Filtering, Search & Pagination
 */
const getExportQuotations = async (companyId, queryOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy = "created_at", sortOrder = "DESC", status, priority } = queryOptions;
  const offset = (page - 1) * limit;

  const whereConditions = [];

  if (companyId) {
    whereConditions.push({
      [Op.or]: [
        { company_id: companyId },
        { company_id: null },
      ]
    });
  }

  if (status && status !== "ALL" && status !== "ALL STATUS") {
    whereConditions.push({ status });
  }

  if (priority && priority !== "ALL") {
    whereConditions.push({ priority });
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereConditions.push({
      [Op.or]: [
        { quotation_no: { [Op.iLike]: q } },
        { inquiry_no: { [Op.iLike]: q } },
        { exporter_name: { [Op.iLike]: q } },
        { pol: { [Op.iLike]: q } },
        { pod: { [Op.iLike]: q } },
        { commodity: { [Op.iLike]: q } },
      ]
    });
  }

  const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

  const { rows, count } = await db.ExportQuotation.findAndCountAll({
    where: whereClause,
    include: [
      { model: db.ExportQuotationCharge, as: "charges" },
    ],
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    distinct: true,
  });

  return {
    total: count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(count / limit),
    quotations: rows,
  };
};

/**
 * Get Single Export Quotation by ID
 */
const getExportQuotationById = async (id) => {
  const quotation = await db.ExportQuotation.findByPk(id, {
    include: [
      { model: db.ExportQuotationCharge, as: "charges" },
    ],
  });

  if (!quotation) {
    throw new Error("Export Quotation not found");
  }
  return quotation;
};

/**
 * Update Export Quotation and nested charges
 */
const updateExportQuotation = async (id, companyId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const quotation = await db.ExportQuotation.findByPk(id, { transaction });
    if (!quotation) {
      throw new Error("Export Quotation not found");
    }

    let updatedTotalAmount = data.total_amount;
    if (data.charges && Array.isArray(data.charges)) {
      updatedTotalAmount = calculateTotalAmount(data.charges);
    }

    await quotation.update({
      ...data,
      total_amount: updatedTotalAmount !== undefined ? updatedTotalAmount : quotation.total_amount,
      updated_by: userId || null,
    }, { transaction });

    if (data.charges && Array.isArray(data.charges)) {
      await db.ExportQuotationCharge.destroy({ where: { quotation_id: id }, transaction });
      const chargesToCreate = data.charges.map(c => ({
        ...c,
        quotation_id: id,
        amount: c.amount !== undefined ? c.amount : (Number(c.quantity || 1) * Number(c.rate || 0)),
      }));
      await db.ExportQuotationCharge.bulkCreate(chargesToCreate, { transaction });
    }

    await transaction.commit();
    return await getExportQuotationById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Delete Export Quotation
 */
const deleteExportQuotation = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const quotation = await db.ExportQuotation.findByPk(id, { transaction });
    if (!quotation) {
      throw new Error("Export Quotation not found");
    }

    await db.ExportQuotationCharge.destroy({ where: { quotation_id: id }, transaction });
    await quotation.destroy({ transaction });

    await transaction.commit();
    return { success: true, message: "Export Quotation deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Change Export Quotation Status
 */
const changeStatus = async (id, status, userId) => {
  const quotation = await db.ExportQuotation.findByPk(id);
  if (!quotation) {
    throw new Error("Export Quotation not found");
  }
  await quotation.update({ status, updated_by: userId || null });
  return quotation;
};

module.exports = {
  generateQuotationNo,
  createExportQuotation,
  getExportQuotations,
  getExportQuotationById,
  updateExportQuotation,
  deleteExportQuotation,
  changeStatus,
};
