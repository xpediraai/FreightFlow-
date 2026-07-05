import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import ShippingLineList from './ShippingLineList';
import ShippingLineForm from './ShippingLineForm';

const ShippingLines = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedLine(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lineData) => {
    setSelectedLine(lineData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedLine(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedLine(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Shipping Line Master"
      
        primaryAction={{ label: '+ Shipping Line', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Shipping Lines" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ExpandableForm isOpen={isFormOpen}>
          <ShippingLineForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedLine} 
          />
        </ExpandableForm>

        <ShippingLineList 
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

export default ShippingLines;
