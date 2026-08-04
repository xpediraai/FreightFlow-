import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import CountryList from './CountryList';
import CountryForm from './CountryForm';

const Countries = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCountry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    const containers = document.querySelectorAll('.layout-content, .app-content, main, .page-content, #root > div');
    containers.forEach(el => { try { el.scrollTo({ top: 0, behavior: 'smooth' }); } catch(err) {} });
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
        primaryAction={{ label: '+ Country', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar 
            entityName="Country" 
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
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
          />
        </div>
      </div>

      <BulkImportModal 
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="country"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default Countries;
