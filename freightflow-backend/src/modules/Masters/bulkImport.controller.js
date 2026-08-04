const bulkImportService = require('./bulkImport.service');

/**
 * Controller to handle Bulk Master Import
 */
const bulkImportHandler = async (req, res) => {
  try {
    const { entityType } = req.params;
    const { rows } = req.body;

    if (!entityType) {
      return res.status(400).json({
        success: false,
        message: 'Entity type parameter is required.'
      });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request payload must contain a non-empty rows array.'
      });
    }

    const result = await bulkImportService.executeBulkImport(entityType, rows, req.user);

    return res.status(200).json({
      success: true,
      message: `Bulk import completed successfully for ${entityType}.`,
      data: result
    });
  } catch (error) {
    console.error('Bulk Import Controller Error:', error);
    let errorMessage = error.message || 'Failed to process bulk import.';
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      errorMessage = error.errors.map(e => e.message).join(' | ');
    }

    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

module.exports = {
  bulkImportHandler
};
