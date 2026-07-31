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
  FileText, CheckSquare, Layers, MessageSquare, Activity, 
  Package, Ship, Navigation, DollarSign, ArrowLeft, Send
} from 'lucide-react';
import { operationsService } from '../../../../operations/services/operations.service';
import { toast } from 'react-toastify';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(4);
  const [newRemark, setNewRemark] = useState('');
  const [remarksList, setRemarksList] = useState([]);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Verify Booking Details with Shipping Line', completed: true },
    { id: 2, text: 'Confirm Cargo Readiness & Packing List', completed: true },
    { id: 3, text: 'Arrange Trucking Pickup & Warehouse Handover', completed: false },
    { id: 4, text: 'Submit Export Customs Declaration', completed: false },
    { id: 5, text: 'Issue Transport Documents & Bill of Lading', completed: false }
  ]);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getJobById(id);
      const data = res.data?.data || res.data;
      setJob(data);
      if (data?.remarks) {
        setRemarksList([{ id: 1, text: data.remarks, author: 'System Log', date: new Date().toLocaleString() }]);
      }
    } catch (err) {
      console.error('Failed to load job details:', err);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await operationsService.updateJobStatus(id, newStatus);
      toast.success(`Job status updated to ${newStatus}`);
      fetchJobDetails();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step.id);
    toast.info(`Progression updated to Stage ${step.id}: ${step.label}`);
  };

  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    toast.success('Workflow checklist updated');
  };

  const handleAddRemark = (e) => {
    e.preventDefault();
    if (!newRemark.trim()) return;
    setRemarksList([
      ...remarksList,
      { id: Date.now(), text: newRemark.trim(), author: 'Operational Exec', date: new Date().toLocaleString() }
    ]);
    setNewRemark('');
    toast.success('Remark added successfully');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In-Progress': return <Badge variant="info">In-Progress</Badge>;
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'On-Hold': return <Badge variant="warning">On-Hold</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent': return <Badge variant="danger">Urgent</Badge>;
      case 'High': return <Badge variant="warning">High</Badge>;
      case 'Low': return <Badge variant="neutral">Low</Badge>;
      default: return <Badge variant="info">Medium</Badge>;
    }
  };

  if (isLoading) return <Page><div className="p-xl text-center">Loading job details...</div></Page>;
  if (!job) return <Page><div className="p-xl text-center">Job not found.</div></Page>;

  return (
    <Page>
      <PageHeader 
        title={`Job: ${job.job_number}`}
        subtitle={`Shipment: ${job.shipment?.shipment_number || 'N/A'} | Priority: ${job.priority || 'Medium'}`}
        action={{
          label: 'Back to Jobs',
          variant: 'outline',
          onClick: () => navigate('/company/operations/jobs')
        }}
      />

      {/* HEADER SUMMARY CARD & STATUS CONTROLS */}
      <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-md flex flex-wrap justify-between items-center gap-md">
        <div>
          <div className="flex align-center gap-sm mb-xs">
            <h2 className="text-xl font-bold m-0">{job.job_number}</h2>
            {getStatusBadge(job.status)}
            {getPriorityBadge(job.priority)}
          </div>
          <p className="text-sm text-secondary m-0">
            Shipment: <strong className="text-primary cursor-pointer hover:underline" onClick={() => navigate(`/company/operations/shipments/${job.shipment?.id}`)}>{job.shipment?.shipment_number}</strong> | Customer: <strong>{job.shipment?.customer?.customer_name || 'N/A'}</strong>
          </p>
        </div>

        <div className="flex align-center gap-sm">
          <label className="text-xs text-secondary font-medium">Quick Status Update:</label>
          <select 
            value={job.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: '150px' }}
          >
            <option value="Pending">Pending</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="On-Hold">On-Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* WORKFLOW PROGRESSION STEPPER */}
      <WorkflowStepper 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
        status={job.status} 
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
          { id: 'tasks', label: 'Tasks & Checklist', icon: CheckSquare },
          { id: 'timeline', label: 'Timeline', icon: Layers },
          { id: 'remarks', label: 'Remarks', icon: MessageSquare },
          { id: 'activity', label: 'Activity Log', icon: Activity }
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
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Job Metadata</h4>
              <table className="detail-table w-full">
                <tbody>
                  <tr><td className="text-secondary py-xs">Job Number:</td><td className="font-semibold">{job.job_number}</td></tr>
                  <tr><td className="text-secondary py-xs">Priority:</td><td>{getPriorityBadge(job.priority)}</td></tr>
                  <tr><td className="text-secondary py-xs">Status:</td><td>{getStatusBadge(job.status)}</td></tr>
                  <tr><td className="text-secondary py-xs">Assigned Employee:</td><td>{job.assignedEmployee ? `${job.assignedEmployee.first_name} ${job.assignedEmployee.last_name}` : 'Unassigned'}</td></tr>
                  <tr><td className="text-secondary py-xs">Department:</td><td>{job.department?.department_name || '-'}</td></tr>
                  <tr><td className="text-secondary py-xs">Created Date:</td><td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Shipment Summary</h4>
              {job.shipment ? (
                <table className="detail-table w-full">
                  <tbody>
                    <tr><td className="text-secondary py-xs">Shipment Number:</td><td className="font-semibold text-primary">{job.shipment.shipment_number}</td></tr>
                    <tr><td className="text-secondary py-xs">Customer:</td><td>{job.shipment.customer?.customer_name || '-'}</td></tr>
                    <tr><td className="text-secondary py-xs">Origin Port:</td><td>{job.shipment.originPort?.port_name || '-'}</td></tr>
                    <tr><td className="text-secondary py-xs">Destination Port:</td><td>{job.shipment.destinationPort?.port_name || '-'}</td></tr>
                    <tr><td className="text-secondary py-xs">Carrier / Shipping Line:</td><td>{job.shipment.shippingLine?.shipping_line_name || '-'}</td></tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-secondary text-sm">No linked shipment data.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'containers' && <ContainerTab shipmentId={job.shipment?.id} jobId={job.id} />}
        {activeTab === 'booking' && <BookingTab shipmentId={job.shipment?.id} jobId={job.id} />}
        {activeTab === 'bl' && <BLTab shipmentId={job.shipment?.id} jobId={job.id} />}
        {activeTab === 'tracking' && <TrackingTab shipmentId={job.shipment?.id} jobId={job.id} />}
        {activeTab === 'finance' && <FinanceTab shipmentId={job.shipment?.id} jobId={job.id} />}

        {activeTab === 'tasks' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Operational Workflow Checklist</h4>
            <div className="space-y-sm">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-center justify-between p-md border-light rounded-md hover:bg-neutral-light cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-md">
                    <input 
                      type="checkbox" 
                      checked={item.completed} 
                      onChange={() => {}}
                      className="cursor-pointer"
                    />
                    <span className={`text-sm ${item.completed ? 'line-through text-secondary' : 'font-medium text-main'}`}>
                      {item.text}
                    </span>
                  </div>
                  {item.completed && <Badge variant="success">Done</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Audit Timeline</h4>
            <div className="p-md text-sm text-secondary">
              Timeline events logged automatically on status and task updates.
            </div>
          </div>
        )}

        {activeTab === 'remarks' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Operational Remarks</h4>
            <form onSubmit={handleAddRemark} className="mb-lg flex gap-sm">
              <input 
                type="text" 
                placeholder="Type a new operational remark..." 
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                className="form-control flex-1"
              />
              <Button type="submit" variant="primary" leftIcon={Send}>Add Remark</Button>
            </form>
            <div className="space-y-sm">
              {remarksList.map(r => (
                <div key={r.id} className="p-md bg-neutral-light rounded-md border-light">
                  <p className="text-sm m-0 text-main">{r.text}</p>
                  <span className="text-xs text-tertiary block mt-xs">{r.author} • {r.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">Activity Log</h4>
            <p className="text-sm text-secondary">No recent activity logged for this job.</p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default JobDetailPage;
