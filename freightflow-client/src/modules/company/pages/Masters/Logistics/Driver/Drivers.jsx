import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import DriverList from './DriverList';
import DriverForm from './DriverForm';

const Drivers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedDriver(null);
    setIsFormOpen(true);
  };

  const handleEdit = (driverData) => {
    setSelectedDriver(driverData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedDriver(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedDriver(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Driver Master" 
        subtitle="Manage logistics drivers and licenses." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Logistics' }, { label: 'Drivers' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Driver"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <DriverForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedDriver} 
          />
        </ExpandableForm>

        <DriverList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Drivers;
