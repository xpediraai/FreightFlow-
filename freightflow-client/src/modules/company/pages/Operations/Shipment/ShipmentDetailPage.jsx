import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import Badge from '../../../../../shared/components/Badge';
import Button from '../../../../../shared/components/Button';
import WorkflowStepper from '../../../../../shared/components/WorkflowStepper';
import ContainerTab from '../Container/ContainerTab';
import BookingTab from '../Booking/BookingTab';
import BLTab from '../BL/BLTab';
import TrackingTab from '../Tracking/TrackingTab';
import FinanceTab from '../Finance/FinanceTab';
import { 
  FileText, Package, MapPin, DollarSign, Activity, 
  History, Edit2, Briefcase, Ship, Navigation, CheckCircle 
} from 'lucide-react';
import { operationsService } from '../../../../operations/services/operations.service';
import { toast } from 'react-toastify';

const ShipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(4);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getShipmentById(id);
      const data = res.data?.data || res.data;
      setShipment(data);
    } catch (err) {
      console.error('Failed to load shipment details:', err);
      toast.error('Failed to load shipment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async () => {
    setIsCreatingJob(true);
    try {
      const res = await operationsService.createJob({ shipment_id: shipment.id });
      const createdJob = res.data?.data || res.data;
      toast.success(`Job ${createdJob.job_number} created successfully!`);
      navigate(`/company/operations/jobs/${createdJob.id}`);
    } catch (err) {
      console.error('Failed to create job:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to create job for shipment');
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step.id);
    toast.info(`Workflow step updated to: ${step.label}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">DRAFT</Badge>;
      case 'BOOKED': return <Badge variant="info">BOOKED</Badge>;
      case 'IN_TRANSIT': return <Badge variant="warning">IN TRANSIT</Badge>;
      case 'ARRIVED': return <Badge variant="primary">ARRIVED</Badge>;
      case 'DELIVERED': return <Badge variant="success">DELIVERED</Badge>;
      case 'CANCELLED': return <Badge variant="danger">CANCELLED</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  if (isLoading) return <Page><div className="p-xl text-center">Loading shipment details...</div></Page>;
  if (!shipment) return <Page><div className="p-xl text-center">Shipment not found.</div></Page>;

  return (
    <Page>
      <PageHeader 
        title={`Shipment: ${shipment.shipment_number}`}
        subtitle={`Customer: ${shipment.customer?.customer_name || 'N/A'} | Type: ${shipment.shipment_type || 'Import'}`}
        action={{
          label: 'Back to Shipments',
          variant: 'outline',
          onClick: () => navigate('/company/operations/shipments')
        }}
      />

      {/* SUMMARY HEADER CARD */}
      <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-md flex flex-wrap justify-between items-center gap-md">
        <div>
          <div className="flex align-center gap-sm mb-xs">
            <h2 className="text-xl font-bold m-0">{shipment.shipment_number}</h2>
            {getStatusBadge(shipment.status)}
            <Badge variant="neutral">{shipment.shipment_type}</Badge>
          </div>
          <p className="text-sm text-secondary m-0">
            Customer: <strong>{shipment.customer?.customer_name || 'N/A'}</strong> | Mode: <strong>{shipment.transportMode?.mode_name || 'Ocean Freight'}</strong>
          </p>
        </div>

        <div className="flex align-center gap-sm">
          {shipment.job ? (
            <Button 
              variant="secondary"
              onClick={() => navigate(`/company/operations/jobs/${shipment.job.id}`)}
              leftIcon={Briefcase}
            >
              View Job ({shipment.job.job_number})
            </Button>
          ) : (
            <Button 
              variant="primary"
              onClick={handleCreateJob}
              isLoading={isCreatingJob}
              leftIcon={Briefcase}
            >
              + Create Operational Job
            </Button>
          )}

          <Button 
            variant="outline"
            onClick={() => navigate(`/company/operations/shipments/${shipment.id}/edit`)}
            leftIcon={Edit2}
          >
            Edit Shipment
          </Button>
        </div>
      </div>

      {/* WORKFLOW STEPPER */}
      <WorkflowStepper 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
        status={shipment.status} 
      />

      {/* CLEAN HIGH-VISIBILITY PILL TABS */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px', 
          margin: '16px 0 24px 0', 
          backgroundColor: '#ffffff', 
          padding: '10px 14px', 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'containers', label: 'Containers', icon: Package },
          { id: 'booking', label: 'Booking', icon: Ship },
          { id: 'bl', label: 'HBL / MBL', icon: FileText },
          { id: 'tracking', label: 'Tracking', icon: Navigation },
          { id: 'finance', label: 'Finance', icon: DollarSign },
          { id: 'route', label: 'Route & Ports', icon: MapPin },
          { id: 'activity', label: 'Activity Log', icon: Activity },
          { id: 'audit', label: 'Audit History', icon: History }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                lineHeight: '1.2',
                border: isActive ? 'none' : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : '#f9fafb',
                color: isActive ? '#ffffff' : '#374151',
                boxShadow: isActive ? '0 3px 10px rgba(220, 38, 38, 0.25)' : '0 1px 2px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              <IconComp size={16} style={{ color: isActive ? '#ffffff' : '#4b5563' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">General Details</h4>
              <table className="detail-table w-full">
                <tbody>
                  <tr><td className="text-secondary py-xs">Shipment Number:</td><td className="font-semibold text-primary">{shipment.shipment_number}</td></tr>
                  <tr><td className="text-secondary py-xs">Type:</td><td>{shipment.shipment_type}</td></tr>
                  <tr><td className="text-secondary py-xs">Customer:</td><td className="font-medium">{shipment.customer?.customer_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Vendor / Overseas Agent:</td><td>{shipment.vendor?.vendor_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Sales Executive:</td><td>{shipment.salesPerson ? `${shipment.salesPerson.first_name} ${shipment.salesPerson.last_name}` : '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Operations Executive:</td><td>{shipment.operationExecutive ? `${shipment.operationExecutive.first_name} ${shipment.operationExecutive.last_name}` : '-'}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Transport & Routing</h4>
              <table className="detail-table w-full">
                <tbody>
                  <tr><td className="text-secondary py-xs">Transport Mode:</td><td>{shipment.transportMode?.mode_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Shipping Line / Carrier:</td><td>{shipment.shippingLine?.shipping_line_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Origin Port:</td><td>{shipment.originPort?.port_name || '-'} ({shipment.originCountry?.country_name || '-'})</td></tr>
                  <tr><td className="text-secondary py-xs">Destination Port:</td><td>{shipment.destinationPort?.port_name || '-'} ({shipment.destinationCountry?.country_name || '-'})</td></tr>
                  <tr><td className="text-secondary py-xs">Final Destination:</td><td>{shipment.final_destination || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'containers' && <ContainerTab shipmentId={shipment.id} />}
        {activeTab === 'booking' && <BookingTab shipmentId={shipment.id} />}
        {activeTab === 'bl' && <BLTab shipmentId={shipment.id} />}
        {activeTab === 'tracking' && <TrackingTab shipmentId={shipment.id} />}
        {activeTab === 'finance' && <FinanceTab shipmentId={shipment.id} />}

        {activeTab === 'route' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Origin Details</h4>
              <table className="detail-table w-full">
                <tbody>
                  <tr><td className="text-secondary py-xs">Origin Country:</td><td>{shipment.originCountry?.country_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Origin Port:</td><td>{shipment.originPort?.port_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">ETD (Est. Departure):</td><td>{shipment.etd || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Destination Details</h4>
              <table className="detail-table w-full">
                <tbody>
                  <tr><td className="text-secondary py-xs">Destination Country:</td><td>{shipment.destinationCountry?.country_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Destination Port:</td><td>{shipment.destinationPort?.port_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">ETA (Est. Arrival):</td><td>{shipment.eta || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Activity Log</h4>
            <p className="text-sm text-secondary">No recent activity logged for this shipment.</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Audit History</h4>
            <p className="text-sm text-secondary">Created on {shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : '-'}</p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default ShipmentDetailPage;
