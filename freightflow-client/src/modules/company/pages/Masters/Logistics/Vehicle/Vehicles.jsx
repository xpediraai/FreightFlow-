import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import VehicleList from './VehicleList';
import VehicleForm from './VehicleForm';

const Vehicles = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage fleet vehicles and compliance." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Logistics' }, { label: 'Vehicles' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Vehicle"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <VehicleForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedVehicle} 
          />
        </ExpandableForm>

        <VehicleList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Vehicles;
