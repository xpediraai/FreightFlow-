import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import CompanyList from './CompanyList';
import CompanyForm from './CompanyForm';

const Companies = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleCreateNew = () => {
    setSelectedCompany(null);
    setView('create');
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedCompany(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedCompany(null);
  };

  return (
    <Page>
      <PageHeader 
        title="Company Management" 
        subtitle="Manage client companies, their organizational structures, and owners." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Companies' }]}
        primaryAction={view === 'list' ? {
          label: 'Add Company',
          onClick: handleCreateNew
        } : undefined}
      />
      
      <div className="mt-lg">
        {view === 'list' && <CompanyList onEdit={handleEdit} />}
        {view === 'create' && <CompanyForm onCancel={handleCancel} onSuccess={handleSuccess} />}
        {view === 'edit' && <CompanyForm onCancel={handleCancel} onSuccess={handleSuccess} initialData={selectedCompany} />}
      </div>
    </Page>
  );
};

export default Companies;
