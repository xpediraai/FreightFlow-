import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import DesignationList from './DesignationList';
import DesignationForm from './DesignationForm';

const Designations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedDesignation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (designationData) => {
    setSelectedDesignation(designationData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedDesignation(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedDesignation(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Designation Master" 
        subtitle="Manage company designations and roles." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Organization' }, { label: 'Designations' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Designation"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <DesignationForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedDesignation} 
          />
        </ExpandableForm>

        <DesignationList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Designations;
