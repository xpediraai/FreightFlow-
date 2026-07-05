import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import ChargeList from './ChargeList';
import ChargeForm from './ChargeForm';

const Charges = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
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

  return (
    <Page>
      <PageHeader 
        title="Charge Master" 
        subtitle="Manage billing and expense charges across modules." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'Charges' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Charge"
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
        />
      </div>
    </Page>
  );
};

export default Charges;
