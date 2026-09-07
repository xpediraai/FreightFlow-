import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import ChargeList from './ChargeList';
import ChargeForm from './ChargeForm';

const Charges = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCharge(null);
    setIsFormOpen(true);
  };

  const handleEdit = (chargeData) => {
    setSelectedCharge(chargeData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCharge(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCharge(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBulkImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Charge Master"
        primaryAction={{ label: '+ Charge', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar 
            entityName="Charge" 
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onBulkImport={() => setIsBulkImportOpen(true)}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <ChargeForm 
              onCancel={handleCancel} 
              onSuccess={handleSuccess} 
              initialData={selectedCharge} 
            />
          </ExpandableForm>

          <ChargeList 
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
        entityType="charge"
        onImportSuccess={handleBulkImportSuccess}
      />
    </Page>
  );
};

export default Charges;
