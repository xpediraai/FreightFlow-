import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import VehicleList from './VehicleList';
import VehicleForm from './VehicleForm';
import FloatingWrapper from '../../../../../../shared/components/FloattingWrapper/FloatingWrapper';

const Vehicles = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicleData) => {
    setSelectedVehicle(vehicleData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader
        title="Vehicle Master"
        className={'text-primary'}
        primaryAction={{ label: '+ Vehicle', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <ExpandableForm isOpen={isFormOpen}>
            <VehicleForm
              onCancel={handleCancel}
              onSuccess={handleSuccess}
              initialData={selectedVehicle}
            />
          </ExpandableForm>
          <FloatingWrapper>
            <MasterToolbar
              entityName="Vehicle"
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              totalRecords={totalRecords}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onBulkImport={() => setIsBulkImportOpen(true)}
            />
            <VehicleList
              onEdit={handleEdit}
              searchQuery={searchTerm}
              viewMode={viewMode}
              refreshTrigger={refreshTrigger}
              onTotalCountChange={setTotalRecords}
              statusFilter={statusFilter}
            />
          </FloatingWrapper>
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="vehicle"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Vehicles;
