import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import PortList from './PortList';
import PortForm from './PortForm';

const Ports = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedPort(null);
    setIsFormOpen(true);
  };

  const handleEdit = (portData) => {
    setSelectedPort(portData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedPort(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedPort(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Port Master" 
        subtitle="Manage logistics ports." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Logistics' }, { label: 'Ports' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Port"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <PortForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedPort} 
          />
        </ExpandableForm>

        <PortList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Ports;
