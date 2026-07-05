import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import UOMList from './UOMList';
import UOMForm from './UOMForm';

const UOMs = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUOM, setSelectedUOM] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedUOM(null);
    setIsFormOpen(true);
  };

  const handleEdit = (uomData) => {
    setSelectedUOM(uomData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedUOM(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedUOM(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="UOM Master" 
        subtitle="Manage Units of Measurement." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'UOM' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add UOM"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <UOMForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedUOM} 
          />
        </ExpandableForm>

        <UOMList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default UOMs;
