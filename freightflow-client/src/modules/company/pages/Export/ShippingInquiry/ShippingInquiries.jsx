import React, { useState, useEffect } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../shared/components/Master/ExpandableForm';
import ShippingInquiryList from './ShippingInquiryList';
import ShippingInquiryForm from './ShippingInquiryForm';

const ShippingInquiries = () => {
  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = localStorage.getItem('freightflow_shipping_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('Failed to load saved inquiries:', err);
    }
    return [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredViewMode') || 'table');

  // Save to localStorage when inquiries change
  useEffect(() => {
    try {
      localStorage.setItem('freightflow_shipping_inquiries', JSON.stringify(inquiries));
    } catch (err) {
      console.error('Failed to persist inquiries:', err);
    }
  }, [inquiries]);

  const handleCreateNew = () => {
    setSelectedInquiry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedInquiry(null);
  };

  const handleSaveSuccess = (savedInquiry) => {
    if (selectedInquiry) {
      // Update existing
      setInquiries(prev => prev.map(item => item.id === savedInquiry.id ? savedInquiry : item));
    } else {
      // Create new
      setInquiries(prev => [savedInquiry, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedInquiry(null);
  };

  const handleDelete = (id) => {
    setInquiries(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Page>
      <PageHeader
        title="Shipping Inquiry"
        subtitle="Manage export shipping inquiries, routes, quantities, and operational statuses."
        primaryAction={{ label: '+ Shipping Inquiry', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <MasterToolbar
            entityName="Shipping Inquiry"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            totalRecords={inquiries.length}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              localStorage.setItem('preferredViewMode', mode);
            }}
          />

          <ExpandableForm isOpen={isFormOpen}>
            <ShippingInquiryForm
              onCancel={handleCancel}
              onSuccess={handleSaveSuccess}
              initialData={selectedInquiry}
              existingCount={inquiries.length}
            />
          </ExpandableForm>

          <ShippingInquiryList
            inquiries={inquiries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchTerm}
            viewMode={viewMode}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default ShippingInquiries;
