/**
 * @file shippingInquiry.service.js
 * @description Business logic for Shipping Inquiry operations with nested cargo and container transactions.
 */
const { Op } = require("sequelize");
const db = require("../../../database/index");
const sequelize = require("../../../config/database");

/**
 * Generate Auto Inquiry Number (Format: ESI/SS/MM-YY/001)
 */
const generateInquiryNo = async (companyId, transaction) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `ESI/SS/${month}-${year}/`;

  const whereClause = {};
  if (companyId) whereClause.company_id = companyId;

  const count = await db.ShippingInquiry.count({
    where: whereClause,
    transaction,
  });

  const seq = String(count + 1).padStart(3, '0');
  return `${prefix}${seq}`;
};

/**
 * Create a new Shipping Inquiry with cargo and container details
 */
const createShippingInquiry = async (companyId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const inquiryNo = data.inquiry_no || (await generateInquiryNo(companyId, transaction));

    const inquiryData = {
      ...data,
      company_id: companyId || data.company_id || null,
      inquiry_no: inquiryNo,
      created_by: userId || null,
      updated_by: userId || null,
    };

    const newInquiry = await db.ShippingInquiry.create(inquiryData, { transaction });

    if (data.cargoDetails && data.cargoDetails.length > 0) {
      const cargos = data.cargoDetails.map(c => ({
        ...c,
        inquiry_id: newInquiry.id,
      }));
      await db.ShippingInquiryCargo.bulkCreate(cargos, { transaction });
    }

    if (data.containerDetails && data.containerDetails.length > 0) {
      const containers = data.containerDetails.map(c => ({
        ...c,
        inquiry_id: newInquiry.id,
      }));
      await db.ShippingInquiryContainer.bulkCreate(containers, { transaction });
    }

    await transaction.commit();

    return await getShippingInquiryById(newInquiry.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get List of Shipping Inquiries with Filtering, Search & Pagination
 */
const getShippingInquiries = async (companyId, queryOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy = "created_at", sortOrder = "DESC", status } = queryOptions;
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

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereConditions.push({
      [Op.or]: [
        { inquiry_no: { [Op.iLike]: q } },
        { exporter_name: { [Op.iLike]: q } },
        { pol: { [Op.iLike]: q } },
        { pod: { [Op.iLike]: q } },
        { fpod: { [Op.iLike]: q } },
        { shipping_line_preference: { [Op.iLike]: q } },
      ]
    });
  }

  const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

  const { rows, count } = await db.ShippingInquiry.findAndCountAll({
    where: whereClause,
    include: [
      { model: db.ShippingInquiryCargo, as: "cargoDetails" },
      { model: db.ShippingInquiryContainer, as: "containerDetails" },
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
    inquiries: rows,
  };
};

/**
 * Get Single Shipping Inquiry by ID
 */
const getShippingInquiryById = async (id) => {
  const inquiry = await db.ShippingInquiry.findByPk(id, {
    include: [
      { model: db.ShippingInquiryCargo, as: "cargoDetails" },
      { model: db.ShippingInquiryContainer, as: "containerDetails" },
    ],
  });

  if (!inquiry) {
    throw new Error("Shipping Inquiry not found");
  }
  return inquiry;
};

/**
 * Update Shipping Inquiry and replacing line items
 */
const updateShippingInquiry = async (id, companyId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const inquiry = await db.ShippingInquiry.findByPk(id, { transaction });
    if (!inquiry) {
      throw new Error("Shipping Inquiry not found");
    }

    await inquiry.update({
      ...data,
      updated_by: userId || null,
    }, { transaction });

    if (data.cargoDetails && Array.isArray(data.cargoDetails)) {
      await db.ShippingInquiryCargo.destroy({ where: { inquiry_id: id }, transaction });
      const cargos = data.cargoDetails.map(c => ({
        ...c,
        inquiry_id: id,
      }));
      await db.ShippingInquiryCargo.bulkCreate(cargos, { transaction });
    }

    if (data.containerDetails && Array.isArray(data.containerDetails)) {
      await db.ShippingInquiryContainer.destroy({ where: { inquiry_id: id }, transaction });
      const containers = data.containerDetails.map(c => ({
        ...c,
        inquiry_id: id,
      }));
      await db.ShippingInquiryContainer.bulkCreate(containers, { transaction });
    }

    await transaction.commit();
    return await getShippingInquiryById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Delete Shipping Inquiry
 */
const deleteShippingInquiry = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const inquiry = await db.ShippingInquiry.findByPk(id, { transaction });
    if (!inquiry) {
      throw new Error("Shipping Inquiry not found");
    }

    await db.ShippingInquiryCargo.destroy({ where: { inquiry_id: id }, transaction });
    await db.ShippingInquiryContainer.destroy({ where: { inquiry_id: id }, transaction });
    await inquiry.destroy({ transaction });

    await transaction.commit();
    return { success: true, message: "Shipping Inquiry deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Change Shipping Inquiry Status
 */
const changeStatus = async (id, status, userId) => {
  const inquiry = await db.ShippingInquiry.findByPk(id);
  if (!inquiry) {
    throw new Error("Shipping Inquiry not found");
  }
  await inquiry.update({ status, updated_by: userId || null });
  return inquiry;
};

module.exports = {
  createShippingInquiry,
  getShippingInquiries,
  getShippingInquiryById,
  updateShippingInquiry,
  deleteShippingInquiry,
  changeStatus,
};
