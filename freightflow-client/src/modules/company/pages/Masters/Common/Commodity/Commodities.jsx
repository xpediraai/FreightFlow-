import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import CommodityList from './CommodityList';
import CommodityForm from './CommodityForm';

const Commodities = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCommodity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (commodityData) => {
    setSelectedCommodity(commodityData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCommodity(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCommodity(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Commodity Master" 
        subtitle="Manage product commodities and classifications." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Common' }, { label: 'Commodities' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Commodity"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <CommodityForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedCommodity} 
          />
        </ExpandableForm>

        <CommodityList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Commodities;
