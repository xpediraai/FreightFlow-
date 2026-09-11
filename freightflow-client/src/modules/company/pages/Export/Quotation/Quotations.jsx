import React, { useState, useEffect } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../shared/components/Master/ExpandableForm';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';

const Quotations = () => {
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('freightflow_export_quotations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean out any legacy sample records
          const realRecords = parsed.filter(item => !String(item.id).startsWith('quot_sample_'));
          return realRecords;
        }
      }
    } catch (err) {
      console.error('Failed to load saved export quotations:', err);
    }
    return [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredQuotationViewMode') || 'table');

  // Persist quotations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('freightflow_export_quotations', JSON.stringify(quotations));
    } catch (err) {
      console.error('Failed to persist export quotations:', err);
    }
  }, [quotations]);

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

  const handleSaveSuccess = (savedQuotation) => {
    if (selectedQuotation) {
      // Update existing
      setQuotations(prev => prev.map(item => item.id === savedQuotation.id ? savedQuotation : item));
    } else {
      // Create new
      setQuotations(prev => [savedQuotation, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedQuotation(null);
  };

  const handleDelete = (id) => {
    setQuotations(prev => prev.filter(item => item.id !== id));
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

          <QuotationList
            quotations={quotations}
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
