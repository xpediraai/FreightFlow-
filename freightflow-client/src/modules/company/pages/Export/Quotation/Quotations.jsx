import React, { useState, useEffect, useCallback } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../shared/components/Master/ExpandableForm';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import { exportQuotationService } from './exportQuotation.service';
import { useERP } from '../context/ERPContext';

const Quotations = () => {
  const { store, patch, createJobFromQuotation } = useERP() || {};
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredQuotationViewMode') || 'table');

  const localQuotations = store?.quotations || [];

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await exportQuotationService.getQuotations({
        limit: 1000,
        search: searchTerm,
        status: statusFilter,
      });

      const data = response?.data?.data?.quotations || response?.data?.quotations || response?.data;
      if (Array.isArray(data) && data.length > 0) {
        setQuotations(data);
      } else {
        // Fallback to local store data
        setQuotations(localQuotations);
      }
    } catch (err) {
      // Offline / local storage mode fallback
      setQuotations(localQuotations);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, localQuotations]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleCreateNew = () => {
    setSelectedQuotation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedQuotation(null);
  };

  const handleSaveSuccess = () => {
    fetchQuotations();
    setIsFormOpen(false);
    setSelectedQuotation(null);
  };

  const handleStatusChange = async (quotation, newStatus) => {
    try {
      // Local ERP Store update & Job creation
      if (newStatus === 'Approved' && createJobFromQuotation) {
        createJobFromQuotation(quotation);
      } else if (patch) {
        patch('quotations', quotation.id, { status: newStatus });
      }

      // Backend API call if active
      try {
        await exportQuotationService.updateStatus(quotation.id, newStatus);
      } catch (e) {
        // Backend not connected or failed, handled locally
      }

      fetchQuotations();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (patch) {
        patch('quotations', id, null);
      }
      try {
        await exportQuotationService.deleteQuotation(id);
      } catch (e) {}
      fetchQuotations();
    } catch (err) {
      console.error('Failed to delete quotation:', err);
    }
  };

  const activeQuotations = quotations.length > 0 ? quotations : localQuotations;

  return (
    <Page>
      <PageHeader
        title="Export Quotations"
        subtitle="Prepare, compare carrier options, calculate charges, issue export freight quotations & create jobs on approval."
        primaryAction={{ label: '+ Create Quotation', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar
            entityName="Export Quotation"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={activeQuotations.length}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              localStorage.setItem('preferredQuotationViewMode', mode);
            }}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <QuotationForm
              onCancel={handleCancel}
              onSuccess={handleSaveSuccess}
              initialData={selectedQuotation}
              existingCount={activeQuotations.length}
            />
          </ExpandableForm>

          {error && (
            <div className="p-md text-center text-danger font-medium bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          <QuotationList
            quotations={activeQuotations}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            searchQuery={searchTerm}
            viewMode={viewMode}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default Quotations;
