import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import StateList from './StateList';
import StateForm from './StateForm';

const States = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage states/provinces for your organization." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Foundation' }, { label: 'State' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add State"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <StateForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedState} 
          />
        </ExpandableForm>

        <StateList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default States;
