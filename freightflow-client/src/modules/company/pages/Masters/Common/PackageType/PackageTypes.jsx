import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import PackageTypeList from './PackageTypeList';
import PackageTypeForm from './PackageTypeForm';

const PackageTypes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (typeData) => {
    setSelectedType(typeData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedType(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedType(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Package Type Master" 
        subtitle="Manage package types and classifications." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'Package Types' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Package Type"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <PackageTypeForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedType} 
          />
        </ExpandableForm>

        <PackageTypeList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default PackageTypes;
