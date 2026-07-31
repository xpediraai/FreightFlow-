import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../shared/components/TableView';
import Badge from '../../../../../shared/components/Badge';
import { 
  Eye, Trash2, MapPin, ArrowRight, FileText
} from 'lucide-react';
import { operationsService } from '../../../../operations/services/operations.service';
import { toast } from 'react-toastify';

const JobList = ({ 
  searchQuery = '', 
  viewMode = 'grid', 
  refreshTrigger = 0, 
  onTotalCountChange, 
  statusFilter = 'ALL STATUS',
  priorityFilter = '',
  employeeFilter = ''
}) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger, page, limit, searchQuery, statusFilter, priorityFilter, employeeFilter]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        assigned_employee_id: employeeFilter
      };
      const res = await operationsService.getJobs(params);
      let data = [];
      let total = 0;
      let pages = 1;

      if (res?.data?.data) {
        data = res.data.data.data || res.data.data;
        total = res.data.data.total || data.length;
        pages = res.data.data.totalPages || 1;
      } else if (res?.data) {
        data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      }

      setJobs(data);
      setTotalRecords(total);
      setTotalPages(pages);
      if (onTotalCountChange) onTotalCountChange(total);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (row, e) => {
    if (e) e.stopPropagation();
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await operationsService.deleteJob(itemToDelete.id);
      toast.success('Job deleted successfully!');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  // Dynamic priority styling helper for exact inline card styling matching Image 2
  const getPriorityStyle = (priority, status) => {
    if (priority === 'Urgent' || status === 'Cancelled') {
      return {
        topBorderColor: '#ef4444', // Red
        badgeBg: '#fee2e2',
        badgeColor: '#991b1b',
        badgeBorder: '#fca5a5',
        badgeText: 'Action Needed',
        btnGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        btnShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
        progressBg: '#ef4444',
        progressWidth: '85%'
      };
    }
    if (priority === 'High' || status === 'On-Hold') {
      return {
        topBorderColor: '#f59e0b', // Amber / Orange
        badgeBg: '#fef3c7',
        badgeColor: '#92400e',
        badgeBorder: '#fcd34d',
        badgeText: 'High Priority',
        btnGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        btnShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
        progressBg: '#f59e0b',
        progressWidth: '50%'
      };
    }
    if (priority === 'Low' || status === 'Completed') {
      return {
        topBorderColor: '#10b981', // Green
        badgeBg: '#d1fae5',
        badgeColor: '#065f46',
        badgeBorder: '#6ee7b7',
        badgeText: 'On Track',
        btnGradient: 'linear-gradient(135deg, #10b981, #047857)',
        btnShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
        progressBg: '#10b981',
        progressWidth: '100%'
      };
    }
    // Medium / In-Progress Default
    return {
      topBorderColor: '#3b82f6', // Blue
      badgeBg: '#dbeafe',
      badgeColor: '#1e40af',
      badgeBorder: '#93c5fd',
      badgeText: status === 'Pending' ? 'New Job' : 'In-Progress',
      btnGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      btnShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      progressBg: '#3b82f6',
      progressWidth: '35%'
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In-Progress':
        return <Badge variant="info">In-Progress</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'On-Hold':
        return <Badge variant="warning">On-Hold</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Pending':
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <Badge variant="danger">Urgent</Badge>;
      case 'High':
        return <Badge variant="warning">High</Badge>;
      case 'Low':
        return <Badge variant="neutral">Low</Badge>;
      case 'Medium':
      default:
        return <Badge variant="info">Medium</Badge>;
    }
  };

  const columns = [
    {
      header: 'Job Number',
      key: 'job_number',
      render: (row) => (
        <span 
          className="font-semibold text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/company/operations/jobs/${row.id}`)}
        >
          {row.job_number}
        </span>
      )
    },
    {
      header: 'Shipment Number',
      key: 'shipment',
      render: (row) => row.shipment ? (
        <span 
          className="text-primary hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/company/operations/shipments/${row.shipment.id}`); }}
        >
          {row.shipment.shipment_number}
        </span>
      ) : '-'
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (row) => row.shipment?.customer?.customer_name || '-'
    },
    {
      header: 'Assigned Employee',
      key: 'assignedEmployee',
      render: (row) => row.assignedEmployee ? `${row.assignedEmployee.first_name} ${row.assignedEmployee.last_name}` : 'Unassigned'
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => getPriorityBadge(row.priority)
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Created Date',
      key: 'createdAt',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-xs" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn edit-btn"
            onClick={() => navigate(`/company/operations/jobs/${row.id}`)}
            title="View Job Details"
          >
            <Eye size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title="Delete Job"
            onClick={(e) => handleDeleteClick(row, e)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // RENDER INTERACTIVE JOB CARDS WITH HIGH-AESTHETIC BUTTONS
  if (viewMode === 'grid' || viewMode === 'card') {
    return (
      <div style={{ padding: '20px' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
          }}
        >
          {jobs.map(job => {
            const styleInfo = getPriorityStyle(job.priority, job.status);
            const customerName = job.shipment?.customer?.customer_name || 'Direct Freight Client';
            const originStr = job.shipment?.originPort?.port_name || job.shipment?.originCountry?.country_name || 'Origin Port';
            const destStr = job.shipment?.destinationPort?.port_name || job.shipment?.destinationCountry?.country_name || 'Destination Port';
            const lineName = job.shipment?.shippingLine?.shipping_line_name || 'Standard Shipping Line';
            const dateStr = job.shipment?.etd || job.shipment?.eta || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Active');
            const assignedName = job.assignedEmployee ? `${job.assignedEmployee.first_name} ${job.assignedEmployee.last_name || ''}` : 'Unassigned Exec';
            const modeStr = job.shipment?.transportMode?.mode_name || `${job.priority} Priority`;

            return (
              <div 
                key={job.id} 
                onClick={() => navigate(`/company/operations/jobs/${job.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e5e7eb',
                  borderTop: `4px solid ${styleInfo.topBorderColor}`,
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div>
                  {/* TOP ROW: JOB NUMBER & STATUS BADGE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827', letterSpacing: '0.2px' }}>
                      {job.job_number}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        backgroundColor: styleInfo.badgeBg, 
                        color: styleInfo.badgeColor,
                        border: `1px solid ${styleInfo.badgeBorder}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      {styleInfo.badgeText}
                    </span>
                  </div>

                  {/* CUSTOMER NAME & ROUTE */}
                  <div style={{ marginBottom: '14px' }}>
                    <h4 
                      style={{ 
                        fontWeight: '700', 
                        fontSize: '14px', 
                        color: '#1f2937', 
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} 
                      title={customerName}
                    >
                      {customerName}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <MapPin size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{originStr}</span>
                      <ArrowRight size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{destStr}</span>
                    </div>
                  </div>

                  {/* 2x2 METADATA GRID */}
                  <div 
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '10px', 
                      padding: '12px 14px', 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      border: '1px solid #f3f4f6',
                      marginBottom: '14px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        VESSEL / LINE
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lineName}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        ETA / DATE
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        ASSIGNED EXEC
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {assignedName}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        MODE / PRIORITY
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {modeStr}
                      </span>
                    </div>
                  </div>

                  {/* STAGE PROGRESS BAR */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#4b5563', fontWeight: '500' }}>Current: <strong style={{ color: '#111827' }}>{job.status}</strong></span>
                      <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '600' }}>Stage 4/16</span>
                    </div>
                    <div style={{ backgroundColor: '#e5e7eb', height: '6px', borderRadius: '6px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          borderRadius: '6px', 
                          backgroundColor: styleInfo.progressBg, 
                          width: styleInfo.progressWidth 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* HIGH-AESTHETIC BUTTONS FOOTER */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: '14px', 
                    borderTop: '1px solid #f3f4f6' 
                  }}
                >
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/company/operations/jobs/${job.id}`); }}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #d1d5db',
                      color: '#374151',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <FileText size={15} style={{ color: '#6b7280' }} /> Details
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      title="Delete Job"
                      onClick={(e) => handleDeleteClick(job, e)}
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1.5px solid #fecaca',
                        color: '#ef4444',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#f87171';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/company/operations/jobs/${job.id}`); }}
                      style={{
                        background: styleInfo.btnGradient,
                        border: 'none',
                        color: '#ffffff',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '0.2px',
                        cursor: 'pointer',
                        boxShadow: styleInfo.btnShadow,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Open Job →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {jobs.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', gridColumn: '1 / -1' }}>
              No jobs found. Create jobs directly from shipment details.
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={itemToDelete ? itemToDelete.job_number : ''}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  return (
    <>
      <TableView
        columns={columns}
        data={jobs}
        isLoading={isLoading}
        emptyStateMsg="No jobs found. Jobs can be created from Shipment details."
        paginationProps={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          totalItems: totalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => navigate(`/company/operations/jobs/${row.id}`)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.job_number : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default JobList;
