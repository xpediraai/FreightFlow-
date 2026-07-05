import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import WarehouseList from './WarehouseList';
import WarehouseForm from './WarehouseForm';

const Warehouses = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedWarehouse(null);
    setIsFormOpen(true);
  };

  const handleEdit = (warehouseData) => {
    setSelectedWarehouse(warehouseData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedWarehouse(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedWarehouse(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Warehouse Master" 
        subtitle="Manage logistics warehouses." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Logistics' }, { label: 'Warehouses' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Warehouse"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <WarehouseForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedWarehouse} 
          />
        </ExpandableForm>

        <WarehouseList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Warehouses;
