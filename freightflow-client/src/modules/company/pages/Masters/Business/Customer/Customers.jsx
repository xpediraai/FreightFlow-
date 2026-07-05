import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';

const Customers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customerData) => {
    setSelectedCustomer(customerData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Customer Master" 
        subtitle="Manage business customers, addresses, and contacts." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Business' }, { label: 'Customers' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Customer"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <CustomerForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedCustomer} 
          />
        </ExpandableForm>

        <CustomerList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Customers;
