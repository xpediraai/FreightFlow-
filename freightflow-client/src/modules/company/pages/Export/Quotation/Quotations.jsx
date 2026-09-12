import React, { useState, useEffect, useCallback } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../shared/components/Master/ExpandableForm';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import { exportQuotationService } from './exportQuotation.service';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredQuotationViewMode') || 'table');

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await exportQuotationService.getQuotations({
        limit: 1000,
        search: searchTerm,
        status: statusFilter,
      });

      const data = response?.data?.data?.quotations || response?.data?.quotations || response?.data || [];
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch export quotations from backend:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load export quotations');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

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

  const handleDelete = async (id) => {
    try {
      await exportQuotationService.deleteQuotation(id);
      fetchQuotations();
    } catch (err) {
      console.error('Failed to delete quotation:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete export quotation');
    }
  };

  return (
    <Page>
      <PageHeader
        title="Export Quotations"
        subtitle="Prepare, compare carrier options, calculate charges, and issue export freight quotations."
        primaryAction={{ label: '+ Create Quotation', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar
            entityName="Export Quotation"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={quotations.length}
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
              existingCount={quotations.length}
            />
          </ExpandableForm>

          {error && (
            <div className="p-md text-center text-danger font-medium bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          <QuotationList
            quotations={quotations}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
