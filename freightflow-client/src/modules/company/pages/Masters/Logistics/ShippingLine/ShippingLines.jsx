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
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage shipping lines and carriers." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Logistics' }, { label: 'Shipping Lines' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Shipping Line"
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
    </Page>
  );
};

export default ShippingLines;
