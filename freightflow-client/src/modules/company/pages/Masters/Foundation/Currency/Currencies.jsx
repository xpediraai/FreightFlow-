import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import CurrencyList from './CurrencyList';
import CurrencyForm from './CurrencyForm';

const Currencies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCurrency(null);
    setIsFormOpen(true);
  };

  const handleEdit = (currencyData) => {
    setSelectedCurrency(currencyData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCurrency(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCurrency(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Currency Master" 
        subtitle="Manage currencies and exchange rates." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Foundation' }, { label: 'Currency' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Currency"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <CurrencyForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedCurrency} 
          />
        </ExpandableForm>

        <CurrencyList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Currencies;
