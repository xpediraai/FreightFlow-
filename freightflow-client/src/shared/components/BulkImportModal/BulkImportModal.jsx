import React, { useState, useRef, useEffect } from 'react';
import { 
  X, UploadCloud, Download, AlertTriangle, CheckCircle2, 
  Trash2, RefreshCw, ArrowLeft, FileSpreadsheet, AlertCircle 
} from 'lucide-react';
import { 
  MASTER_SCHEMAS, downloadTemplate, parseExcelFile, validateMasterRows 
} from '../../utils/excelService';
import api from '../../../core/api/axios/instance';
import { toast } from 'react-toastify';
import './BulkImportModal.css';

const BulkImportModal = ({ 
  isOpen, 
  onClose, 
  entityType, 
  existingDbRecords = [], 
  onImportSuccess 
}) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [rows, setRows] = useState([]);
  const [rawParsedRows, setRawParsedRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showSkipModal, setShowSkipModal] = useState(false);

  const fileInputRef = useRef(null);
  const schema = MASTER_SCHEMAS[entityType];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFile(null);
      setRows([]);
      setRawParsedRows([]);
      setActiveFilter('ALL');
      setShowSkipModal(false);
    }
  }, [isOpen, entityType]);

  if (!isOpen || !schema) return null;

  // Handles Excel Template Download
  const handleDownloadTemplate = () => {
    try {
      downloadTemplate(entityType);
      toast.info(`Downloaded template for ${schema.title}`);
    } catch (err) {
      toast.error('Failed to download template.');
    }
  };

  // Process File Reading & Parsing
  const processUploadedFile = async (uploadedFile) => {
    if (!uploadedFile) return;

    if (!uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Invalid file type! Please upload a valid Excel (.xlsx or .xls) file.');
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);

    try {
      const parsed = await parseExcelFile(uploadedFile);
      if (!parsed || parsed.length === 0) {
        toast.warning('The uploaded Excel file contains no data rows.');
        setIsLoading(false);
        return;
      }

      setRawParsedRows(parsed);
      const evaluated = validateMasterRows(entityType, parsed, existingDbRecords);
      setRows(evaluated);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Error processing Excel file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Live Inline Cell Editing with Instant Re-Validation
  const handleCellChange = (rowIndex, colKey, newValue) => {
    const headerObj = schema.headers.find(h => h.key === colKey);
    const labelKey = headerObj ? headerObj.label : null;

    const updatedRaw = rawParsedRows.map((r, i) => {
      if (i === rowIndex) {
        const newRow = { ...r, [colKey]: newValue };
        if (labelKey) {
          newRow[labelKey] = newValue;
          // Sync any existing header keys matching label or colKey
          Object.keys(newRow).forEach(rk => {
            const cleanRk = String(rk).replace(/\*/g, '').trim().toLowerCase();
            const cleanColKey = String(colKey).replace(/\*/g, '').trim().toLowerCase();
            const cleanLabel = String(labelKey).replace(/\*/g, '').trim().toLowerCase();
            if (cleanRk === cleanColKey || cleanRk === cleanLabel) {
              newRow[rk] = newValue;
            }
          });
        }
        return newRow;
      }
      return r;
    });

    setRawParsedRows(updatedRaw);

    // Re-evaluate entire sheet rules instantly
    const reEvaluated = validateMasterRows(entityType, updatedRaw, existingDbRecords);
    setRows(reEvaluated);
  };

  // Row Deletion
  const handleDeleteRow = (rowIndex) => {
    const updatedRaw = rawParsedRows.filter((_, i) => i !== rowIndex);
    setRawParsedRows(updatedRaw);

    const reEvaluated = validateMasterRows(entityType, updatedRaw, existingDbRecords);
    setRows(reEvaluated);
  };

  // Metrics Calculation
  const totalRowsCount = rows.length;
  const validNewCount = rows.filter(r => r._status === 'NEW').length;
  const validUpdateCount = rows.filter(r => r._status === 'UPDATE').length;
  const errorCount = rows.filter(r => r._status === 'ERROR').length;
  const validTotalCount = validNewCount + validUpdateCount;

  // Filtered Rows for Preview Table
  const filteredRows = rows.filter(r => {
    if (activeFilter === 'ERRORS') return r._status === 'ERROR';
    if (activeFilter === 'NEW') return r._status === 'NEW';
    if (activeFilter === 'UPDATE') return r._status === 'UPDATE';
    return true;
  });

  // Final Import Handler
  const executeImport = async (skipErrors = false) => {
    const rowsToImport = rows.filter(r => r._status === 'NEW' || r._status === 'UPDATE');

    if (rowsToImport.length === 0) {
      toast.warning('No valid rows available to import.');
      return;
    }

    setIsImporting(true);

    try {
      const payload = {
        rows: rowsToImport.map(r => ({
          _status: r._status,
          _dbId: r._dbId,
          data: r.data
        }))
      };

      const res = await api.post(`/masters/bulk-import/${entityType}`, payload);

      if (res && (res.success || res.status === 200)) {
        toast.success(`Successfully imported ${res.data?.totalProcessed || rowsToImport.length} records!`);
        if (onImportSuccess) {
          onImportSuccess(res);
        }
        onClose();
      } else {
        toast.error(res?.message || 'Import process failed.');
      }
    } catch (err) {
      console.error('Bulk Import Error:', err);
      toast.error(err.response?.data?.message || 'Server error occurred during bulk import.');
    } finally {
      setIsImporting(false);
      setShowSkipModal(false);
    }
  };

  const handleImportButtonClick = () => {
    if (errorCount > 0) {
      setShowSkipModal(true);
    } else {
      executeImport(false);
    }
  };

  return (
    <div className="bulk-import-modal-overlay">
      <div className="bulk-import-modal-container">
        
        {/* Header */}
        <div className="bulk-import-header">
          <div className="bulk-import-title-group">
            <h3>Bulk Import - {schema.title}</h3>
            <div className="bulk-import-step-indicator">
              Step {step} of 2: {step === 1 ? 'Select Excel File & Template' : 'Preview & Validate Data'}
            </div>
          </div>
          <button className="bulk-import-close-btn" onClick={onClose} disabled={isImporting}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="bulk-import-content">
          {step === 1 ? (
            /* STEP 1: Upload & Template */
            <div>
              <div 
                className={`bulk-upload-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => processUploadedFile(e.target.files[0])} 
                  accept=".xlsx, .xls" 
                  style={{ display: 'none' }}
                />
                <div className="bulk-upload-icon-wrapper">
                  <UploadCloud size={32} />
                </div>
                <div className="bulk-upload-text">
                  <h4>Drag and drop your Excel file here</h4>
                  <p>Supports .xlsx and .xls files</p>
                </div>
                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb' }}>
                    <RefreshCw size={16} className="animate-spin" /> Parsing file...
                  </div>
                )}
              </div>

              <div className="bulk-template-downloader">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileSpreadsheet size={24} color="#16a34a" />
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>Need the exact format?</strong>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Download pre-formatted Excel template with sample data</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleDownloadTemplate} 
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', background: '#ffffff', border: '1px solid #cbd5e1',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#334155'
                  }}
                >
                  <Download size={16} /> Download Template
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Preview & Live Editing */
            <div>
              {/* Summary Bar */}
              <div className="bulk-summary-bar">
                <div className="bulk-metric-card">
                  <span className="bulk-metric-label">Total Rows</span>
                  <span className="bulk-metric-value">{totalRowsCount}</span>
                </div>
                <div className="bulk-metric-card new">
                  <span className="bulk-metric-label">Valid New</span>
                  <span className="bulk-metric-value">{validNewCount}</span>
                </div>
                <div className="bulk-metric-card update">
                  <span className="bulk-metric-label">Valid Update</span>
                  <span className="bulk-metric-value">{validUpdateCount}</span>
                </div>
                <div className="bulk-metric-card error">
                  <span className="bulk-metric-label">Errors</span>
                  <span className="bulk-metric-value">{errorCount}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="bulk-filter-tabs">
                <button 
                  className={`bulk-filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ALL')}
                >
                  ALL ({totalRowsCount})
                </button>
                <button 
                  className={`bulk-filter-tab ${activeFilter === 'ERRORS' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ERRORS')}
                  style={{ color: activeFilter !== 'ERRORS' && errorCount > 0 ? '#dc2626' : undefined }}
                >
                  ERRORS ({errorCount})
                </button>
                <button 
                  className={`bulk-filter-tab ${activeFilter === 'NEW' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('NEW')}
                >
                  NEW ({validNewCount})
                </button>
                <button 
                  className={`bulk-filter-tab ${activeFilter === 'UPDATE' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('UPDATE')}
                >
                  UPDATE ({validUpdateCount})
                </button>
              </div>

              {/* Data Preview Table */}
              <div className="bulk-table-container">
                <table className="bulk-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ width: '90px' }}>Status</th>
                      {schema.headers.map(h => (
                        <th key={h.key}>{h.label}</th>
                      ))}
                      <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={schema.headers.length + 3} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No rows match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => {
                        const originalIndex = rows.findIndex(r => r._id === row._id);

                        return (
                          <tr key={row._id} className={row._status === 'ERROR' ? 'has-error' : ''}>
                            <td style={{ fontWeight: 600, color: '#64748b' }}>{originalIndex + 1}</td>
                            <td>
                              <span className={`bulk-status-badge ${row._status.toLowerCase()}`}>
                                {row._status}
                              </span>
                              {row._errors['_row'] && (
                                <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '2px' }}>
                                  {row._errors['_row']}
                                </div>
                              )}
                            </td>

                            {schema.headers.map(header => {
                              const cellValue = row.data[header.key] || '';
                              const cellError = row._errors[header.key];

                              return (
                                <td key={header.key}>
                                  {header.type === 'select' && header.options ? (
                                    <select
                                      value={cellValue}
                                      onChange={(e) => handleCellChange(originalIndex, header.key, e.target.value)}
                                      className={`bulk-cell-input ${cellError ? 'cell-error' : ''}`}
                                      title={cellError || ''}
                                    >
                                      <option value="">-- Select --</option>
                                      {header.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={header.type === 'number' ? 'number' : 'text'}
                                      value={cellValue}
                                      onChange={(e) => handleCellChange(originalIndex, header.key, e.target.value)}
                                      className={`bulk-cell-input ${cellError ? 'cell-error' : ''}`}
                                      title={cellError || ''}
                                      placeholder={header.label.replace(/\*/g, '').trim()}
                                    />
                                  )}
                                </td>
                              );
                            })}

                            <td style={{ textAlign: 'center' }}>
                              <button 
                                className="bulk-delete-row-btn"
                                onClick={() => handleDeleteRow(originalIndex)}
                                title="Remove row"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bulk-import-footer">
          {step === 2 ? (
            <>
              <button 
                type="button" 
                className="bulk-filter-tab"
                onClick={() => setStep(1)}
                disabled={isImporting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1' }}
              >
                <ArrowLeft size={16} /> Back to Upload
              </button>

              <div className="bulk-footer-btns">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isImporting}
                  style={{
                    padding: '8px 16px', background: '#f1f5f9', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleImportButtonClick}
                  disabled={isImporting || validTotalCount === 0}
                  style={{
                    padding: '8px 18px', background: isImporting || validTotalCount === 0 ? '#94a3b8' : '#2563eb',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#ffffff',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Import {validTotalCount} Record{validTotalCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={{ marginLeft: 'auto' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  padding: '8px 16px', background: '#f1f5f9', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Skip Invalid Rows Confirmation Dialog */}
        {showSkipModal && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '10px', width: '420px', padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '0.75rem' }}>
                <AlertTriangle size={24} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Validation Errors Detected</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                <strong>{errorCount}</strong> row{errorCount > 1 ? 's contain' : ' contains'} validation errors and cannot be imported.
                <br /><br />
                Would you like to skip invalid rows and import the <strong>{validTotalCount}</strong> valid record{validTotalCount > 1 ? 's' : ''}?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  onClick={() => setShowSkipModal(false)}
                  style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  Review Errors
                </button>
                <button 
                  onClick={() => executeImport(true)}
                  style={{ padding: '8px 16px', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#ffffff' }}
                >
                  Skip & Import {validTotalCount} Rows
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BulkImportModal;
