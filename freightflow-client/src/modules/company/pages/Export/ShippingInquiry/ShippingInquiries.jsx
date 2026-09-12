import React, { useState, useEffect, useCallback } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import MasterToolbar from '../../../../../shared/components/Master/MasterToolbar';
import ExpandableForm from '../../../../../shared/components/Master/ExpandableForm';
import ShippingInquiryList from './ShippingInquiryList';
import ShippingInquiryForm from './ShippingInquiryForm';
import FloatingWrapper from '../../../../../shared/components/FloattingWrapper/FloatingWrapper';
import { shippingInquiryService } from './shippingInquiry.service';

const ShippingInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredViewMode') || 'table');

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await shippingInquiryService.getInquiries();
      const listData =
        res?.data?.inquiries ||
        res?.data?.data?.inquiries ||
        res?.inquiries ||
        (Array.isArray(res?.data) ? res.data : null) ||
        (Array.isArray(res) ? res : []);
      if (Array.isArray(listData)) {
        setInquiries(listData);
      }
    } catch (err) {
      console.error('Failed to fetch shipping inquiries from backend:', err);
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

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

  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    setSelectedInquiry(null);
    fetchInquiries();
  };

  const handleDelete = async (id) => {
    try {
      await shippingInquiryService.deleteInquiry(id);
    } catch (err) {
      console.error('Failed to delete shipping inquiry:', err);
    }
    fetchInquiries();
  };

  return (
    <Page>
      <PageHeader
        title="Shipping Inquiry"
        className={'text-primary'}
        subtitle="Manage export shipment inquiries, POL/POD routing, container requirements, and cargo readiness."
        primaryAction={{ label: '+ Shipping Inquiry', onClick: handleCreateNew }}
      />

      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          <ExpandableForm isOpen={isFormOpen}>
            <ShippingInquiryForm
              onCancel={handleCancel}
              onSuccess={handleSaveSuccess}
              initialData={selectedInquiry}
              existingCount={inquiries.length}
            />
          </ExpandableForm>
          <FloatingWrapper>
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

            <ShippingInquiryList
              inquiries={inquiries}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchQuery={searchTerm}
              viewMode={viewMode}
              statusFilter={statusFilter}
            />
          </FloatingWrapper>
        </div>
      </div>
    </Page>
  );
};

export default ShippingInquiries;
