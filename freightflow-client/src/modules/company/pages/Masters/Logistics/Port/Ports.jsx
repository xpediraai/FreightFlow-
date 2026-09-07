import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import PortList from './PortList';
import PortForm from './PortForm';

const Ports = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
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
        primaryAction={{ label: '+ Port', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar
            entityName="Port"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              localStorage.setItem('preferredViewMode', mode);
            }}
            onBulkImport={() => setIsBulkImportOpen(true)}
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
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="port"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Ports;
