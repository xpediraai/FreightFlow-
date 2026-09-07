import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import DesignationList from './DesignationList';
import DesignationForm from './DesignationForm';

const Designations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedDesignation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (designationData) => {
    setSelectedDesignation(designationData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedDesignation(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedDesignation(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Designation Master"
        primaryAction={{ label: '+ Designation', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar 
            entityName="Designation" 
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onBulkImport={() => setIsBulkImportOpen(true)}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <DesignationForm 
              onCancel={handleCancel} 
              onSuccess={handleSuccess} 
              initialData={selectedDesignation} 
            />
          </ExpandableForm>

          <DesignationList 
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
        entityType="designation"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Designations;
