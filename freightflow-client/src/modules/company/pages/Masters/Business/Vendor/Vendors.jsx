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
  const [viewMode, setViewMode] = useState('table');
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
        subtitle="Manage vendors, shipping lines, transporters and other suppliers." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Business' }, { label: 'Vendors' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Vendor"
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
        />
      </div>
    </Page>
  );
};

export default Vendors;
