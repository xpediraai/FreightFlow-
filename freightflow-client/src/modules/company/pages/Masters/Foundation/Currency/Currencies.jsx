import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import CurrencyList from './CurrencyList';
import CurrencyForm from './CurrencyForm';

const Currencies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCurrency(null);
    setIsFormOpen(true);
  };

  const handleEdit = (currencyData) => {
    setSelectedCurrency(currencyData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCurrency(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCurrency(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Currency Master"
        primaryAction={{ label: '+ Currency', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar 
            entityName="Currency" 
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onBulkImport={() => setIsBulkImportOpen(true)}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <CurrencyForm 
              onCancel={handleCancel} 
              onSuccess={handleSuccess} 
              initialData={selectedCurrency} 
            />
          </ExpandableForm>

          <CurrencyList 
            onEdit={handleEdit} 
            searchQuery={searchTerm}
            viewMode={viewMode}
            refreshTrigger={refreshTrigger}
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>

      <BulkImportModal 
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="currency"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Currencies;
