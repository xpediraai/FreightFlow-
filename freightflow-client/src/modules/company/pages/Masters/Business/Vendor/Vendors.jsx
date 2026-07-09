import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import VendorList from './VendorList';
import VendorForm from './VendorForm';

const Vendors = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vendorData) => {
    setSelectedVendor(vendorData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedVendor(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedVendor(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Vendor Master"
      
        primaryAction={{ label: '+ Vendor', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Vendor" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
            totalRecords={totalRecords}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

        <ExpandableForm isOpen={isFormOpen}>
          <VendorForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedVendor} 
          />
        </ExpandableForm>

        <VendorList 
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

export default Vendors;
