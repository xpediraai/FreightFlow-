import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';

const Employees = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employeeData) => {
    setSelectedEmployee(employeeData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader 
        title="Employee Master"
      
        primaryAction={{ label: '+ Employee', onClick: handleCreateNew }}/>
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar entityName="Employee" 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ExpandableForm isOpen={isFormOpen}>
          <EmployeeForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
            initialData={selectedEmployee} 
          />
        </ExpandableForm>

        <EmployeeList 
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

export default Employees;
