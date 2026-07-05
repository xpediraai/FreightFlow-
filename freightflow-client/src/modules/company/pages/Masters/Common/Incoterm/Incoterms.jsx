import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import IncotermList from './IncotermList';
import IncotermForm from './IncotermForm';

const Incoterms = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedTerm(null);
    setIsFormOpen(true);
  };

  const handleEdit = (termData) => {
    setSelectedTerm(termData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedTerm(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedTerm(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Incoterm Master"
      
        primaryAction={{ label: '+ Incoterm', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Incoterm" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ExpandableForm isOpen={isFormOpen}>
          <IncotermForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedTerm} 
          />
        </ExpandableForm>

        <IncotermList 
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

export default Incoterms;
