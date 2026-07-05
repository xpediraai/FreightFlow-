import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import CountryList from './CountryList';
import CountryForm from './CountryForm';

const Countries = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCountry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCountry(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCountry(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Country Master" 
        subtitle="Manage countries for your organization." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Foundation' }, { label: 'Country' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add Country"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <CountryForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedCountry} 
          />
        </ExpandableForm>

        <CountryList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Countries;
