import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../shared/components/Master/ExpandableForm';
import CompanyList from './CompanyList';
import CompanyForm from './CompanyForm';

const Companies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
    // scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader
        title="Company Master"
        primaryAction={{ label: '+ Company', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Companies"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <CompanyForm
              onCancel={handleCancel}
              onSuccess={handleSuccess}
              initialData={selectedCompany}
            />
          </ExpandableForm>

          <CompanyList
            onEdit={handleEdit}
            searchQuery={searchTerm}
            viewMode={viewMode}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </Page>
  );
};

export default Companies;
