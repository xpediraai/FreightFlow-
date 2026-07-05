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
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage billing terms and credit days." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Foundation' }, { label: 'Payment Terms' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Payment Term"
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
        />
      </div>
    </Page>
  );
};

export default PaymentTerms;
