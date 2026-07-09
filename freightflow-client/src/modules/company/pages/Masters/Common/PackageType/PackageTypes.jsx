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
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
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
      
        primaryAction={{ label: '+ Package Type', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Package Types" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
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
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default PackageTypes;
