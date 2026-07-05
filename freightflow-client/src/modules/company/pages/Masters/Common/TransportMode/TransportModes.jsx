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
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
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
      
        primaryAction={{ label: '+ Transport Mode', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Transport Modes" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
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
      </div>
    </Page>
  );
};

export default TransportModes;
