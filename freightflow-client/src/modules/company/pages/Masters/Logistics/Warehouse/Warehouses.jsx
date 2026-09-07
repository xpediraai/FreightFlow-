import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import WarehouseList from './WarehouseList';
import WarehouseForm from './WarehouseForm';

const Warehouses = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
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
        primaryAction={{ label: '+ Warehouse', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar 
            entityName="Warehouse" 
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onBulkImport={() => setIsBulkImportOpen(true)}
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
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>

      <BulkImportModal 
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="warehouse"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Warehouses;
