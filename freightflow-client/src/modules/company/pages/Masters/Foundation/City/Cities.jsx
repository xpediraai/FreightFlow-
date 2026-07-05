import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import CityList from './CityList';
import CityForm from './CityForm';

const Cities = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cityData) => {
    setSelectedCity(cityData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCity(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCity(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="City Master" 
        subtitle="Manage cities for your organization." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Masters' }, { label: 'Foundation' }, { label: 'City' }]}
      />
      
      <div className="mt-lg">
        <MasterToolbar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAdd={handleCreateNew}
          onToggleView={setViewMode}
          viewMode={viewMode}
          addLabel="Add City"
        />

        <ExpandableForm isOpen={isFormOpen}>
          <CityForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedCity} 
          />
        </ExpandableForm>

        <CityList 
          onEdit={handleEdit} 
          searchQuery={searchTerm}
          viewMode={viewMode}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Page>
  );
};

export default Cities;
