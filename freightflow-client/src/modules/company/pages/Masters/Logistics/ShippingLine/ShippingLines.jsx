import React, { useState } from 'react';
import Page from '../../../../../../shared/components/Page';
import PageHeader from '../../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../../shared/components/Master/ExpandableForm';
import BulkImportModal from '../../../../../../shared/components/BulkImportModal/BulkImportModal';
import ShippingLineList from './ShippingLineList';
import ShippingLineForm from './ShippingLineForm';
import FloatingWrapper from '../../../../../../shared/components/FloattingWrapper/FloatingWrapper';

const ShippingLines = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedLine(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lineData) => {
    setSelectedLine(lineData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedLine(null);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedLine(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Page>
      <PageHeader
        title="Shipping Line Master"
        className={'text-primary'}
        primaryAction={{ label: '+ Shipping Line', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <ExpandableForm isOpen={isFormOpen}>
            <ShippingLineForm
              onCancel={handleCancel}
              onSuccess={handleSuccess}
              initialData={selectedLine}
            />
          </ExpandableForm>
          <FloatingWrapper>
            <MasterToolbar
              entityName="Shipping Lines"
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
            <ShippingLineList
              onEdit={handleEdit}
              searchQuery={searchTerm}
              viewMode={viewMode}
              refreshTrigger={refreshTrigger}
              onTotalCountChange={setTotalRecords}
              statusFilter={statusFilter}
            />
          </FloatingWrapper>
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        entityType="shippingLine"
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Page>
  );
};

export default ShippingLines;
