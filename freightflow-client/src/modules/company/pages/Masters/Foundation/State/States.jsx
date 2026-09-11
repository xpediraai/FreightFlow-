import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import StateList from './StateList';
import StateForm from './StateForm';
import FloatingWrapper from '../../../../../../shared/components/FloattingWrapper/FloatingWrapper';

const States = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedState(null);
    setIsFormOpen(true);
  };

  const handleEdit = (stateData) => {
    setSelectedState(stateData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedState(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedState(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader
        title="State Master"
        className={'text-primary'}
        primaryAction={{ label: '+ State', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <ExpandableForm isOpen={isFormOpen}>
            <StateForm
              onCancel={handleCancel}
              onSuccess={handleSuccess}
              initialData={selectedState}
            />
          </ExpandableForm>
          <FloatingWrapper>
            <MasterToolbar
              entityName="State"
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              totalRecords={totalRecords}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onBulkImport={() => setIsBulkImportOpen(true)}
            />
            <StateList
              onEdit={handleEdit}
              searchQuery={searchTerm}
              viewMode={viewMode}
              refreshTrigger={refreshTrigger}
              onTotalCountChange={setTotalRecords}
              statusFilter={statusFilter}
            />
          </FloatingWrapper>
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="state"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default States;
