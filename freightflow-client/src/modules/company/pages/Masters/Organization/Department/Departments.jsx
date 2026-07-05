import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import DepartmentList from './DepartmentList';
import DepartmentForm from './DepartmentForm';

const Departments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (departmentData) => {
    setSelectedDepartment(departmentData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedDepartment(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedDepartment(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Department Master"
      
        primaryAction={{ label: '+ Department', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Department" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ExpandableForm isOpen={isFormOpen}>
          <DepartmentForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedDepartment} 
          />
        </ExpandableForm>

        <DepartmentList 
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

export default Departments;
