import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../shared/components/TableView';
import Badge from '../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../shared/components/Master/MasterDataCard';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { operationsService } from '../../../../operations/services/operations.service';
import { toast } from 'react-toastify';

const ShipmentList = ({ 
  searchQuery = '', 
  viewMode = 'table', 
  refreshTrigger = 0, 
  onTotalCountChange, 
  statusFilter = 'ALL STATUS',
  customerFilter = '',
  typeFilter = ''
}) => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, [refreshTrigger, page, limit, searchQuery, statusFilter, customerFilter, typeFilter]);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery,
        status: statusFilter,
        customer_id: customerFilter,
        shipment_type: typeFilter
      };
      const res = await operationsService.getShipments(params);
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

      setShipments(data);
      setTotalRecords(total);
      setTotalPages(pages);
      if (onTotalCountChange) onTotalCountChange(total);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (row, e) => {
    e.stopPropagation();
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await operationsService.deleteShipment(itemToDelete.id);
      toast.success('Shipment deleted successfully!');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchShipments();
    } catch (error) {
      console.error('Failed to delete shipment:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete shipment');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'In-Transit':
        return <Badge variant="info">In-Transit</Badge>;
      case 'Delivered':
        return <Badge variant="neutral">Delivered</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Draft':
      default:
        return <Badge variant="warning">Draft</Badge>;
    }
  };

  const columns = [
    {
      header: 'Shipment No',
      key: 'shipment_number',
      render: (row) => (
        <span 
          className="font-semibold text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/company/operations/shipments/${row.id}`)}
        >
          {row.shipment_number}
        </span>
      )
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (row) => row.customer?.customer_name || '-'
    },
    {
      header: 'Shipment Type',
      key: 'shipment_type',
      render: (row) => (
        <span className="badge badge-subtle">{row.shipment_type || 'Export'}</span>
      )
    },
    {
      header: 'Transport Mode',
      key: 'transportMode',
      render: (row) => row.transportMode?.mode_name || '-'
    },
    {
      header: 'Origin',
      key: 'origin',
      render: (row) => row.originPort?.port_name || row.originCountry?.country_name || '-'
    },
    {
      header: 'Destination',
      key: 'destination',
      render: (row) => row.destinationPort?.port_name || row.destinationCountry?.country_name || '-'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Assigned Exec',
      key: 'operationExecutive',
      render: (row) => row.operationExecutive ? `${row.operationExecutive.first_name} ${row.operationExecutive.last_name}` : '-'
    },
    {
      header: 'Job Status',
      key: 'job',
      render: (row) => row.job ? (
        <span className="text-xs text-success font-medium">Job: {row.job.job_number}</span>
      ) : (
        <span className="text-xs text-tertiary">No Job</span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-xs" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn edit-btn"
            onClick={() => navigate(`/company/operations/shipments/${row.id}`)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={() => navigate(`/company/operations/shipments/${row.id}/edit`)}
            title="Edit Shipment"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title="Delete"
            onClick={(e) => handleDeleteClick(row, e)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (viewMode === 'card') {
    return (
      <>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {shipments.map(shipment => (
            <div key={shipment.id} onClick={() => navigate(`/company/operations/shipments/${shipment.id}`)}>
              <MasterDataCard
                title={shipment.shipment_number}
                code={shipment.customer?.customer_name}
                status={shipment.status}
                onEdit={() => navigate(`/company/operations/shipments/${shipment.id}/edit`)}
                gridData={[
                  { label: 'Type', value: shipment.shipment_type },
                  { label: 'Transport', value: shipment.transportMode?.mode_name || '-' },
                  { label: 'Origin', value: shipment.originPort?.port_name || '-' },
                  { label: 'Destination', value: shipment.destinationPort?.port_name || '-' }
                ]}
              />
            </div>
          ))}
          {shipments.length === 0 && !isLoading && (
            <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
              No shipments found.
            </div>
          )}
        </div>
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={itemToDelete ? itemToDelete.shipment_number : ''}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  return (
    <>
      <TableView
        columns={columns}
        data={shipments}
        isLoading={isLoading}
        emptyStateMsg="No shipments found. Create a shipment to get started."
        paginationProps={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          totalItems: totalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => navigate(`/company/operations/shipments/${row.id}`)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.shipment_number : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ShipmentList;
