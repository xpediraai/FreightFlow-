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
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage container types and specifications." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'Container Types' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Container Type"
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
    </Page>
  );
};

export default ContainerTypes;
