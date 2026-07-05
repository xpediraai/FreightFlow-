import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import ContainerTypeList from './ContainerTypeList';
import ContainerTypeForm from './ContainerTypeForm';

const ContainerTypes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedContainer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (containerData) => {
    setSelectedContainer(containerData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedContainer(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedContainer(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Container Type Master"
      
        primaryAction={{ label: '+ Container Type', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Container Types" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ExpandableForm isOpen={isFormOpen}>
          <ContainerTypeForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedContainer} 
          />
        </ExpandableForm>

        <ContainerTypeList 
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

export default ContainerTypes;
