import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import TransportModeList from './TransportModeList';
import TransportModeForm from './TransportModeForm';

const TransportModes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedMode(null);
    setIsFormOpen(true);
  };

  const handleEdit = (modeData) => {
    setSelectedMode(modeData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedMode(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedMode(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Transport Mode Master" 
        subtitle="Manage modes of transportation." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'Transport Modes' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Transport Mode"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <TransportModeForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedMode} 
          />
        </ExpandableForm>

        <TransportModeList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default TransportModes;
