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
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
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
      
        primaryAction={{ label: '+ Commodity', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Commodity" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
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
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default Commodities;
