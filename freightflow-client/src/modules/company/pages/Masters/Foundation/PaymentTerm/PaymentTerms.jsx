import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import PaymentTermList from './PaymentTermList';
import PaymentTermForm from './PaymentTermForm';

const PaymentTerms = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedTerm(null);
    setIsFormOpen(true);
  };

  const handleEdit = (termData) => {
    setSelectedTerm(termData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedTerm(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedTerm(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Payment Term Master"
      
        primaryAction={{ label: '+ Payment Term', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Payment Terms" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

        <ExpandableForm isOpen={isFormOpen}>
          <PaymentTermForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedTerm} 
          />
        </ExpandableForm>

        <PaymentTermList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default PaymentTerms;
