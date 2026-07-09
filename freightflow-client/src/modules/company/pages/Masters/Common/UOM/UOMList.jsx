import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const UOMList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [uoms, setUOMs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUOMs();
  }, [refreshTrigger]);
  const fetchUOMs = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getUOMs({ page: 1, limit: 10000 });
      let uomData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        uomData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        uomData = data.data;
      } else if (Array.isArray(data)) {
        uomData = data;
      }
      setUOMs(uomData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch UOMs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = uoms.filter(item => {
    if (statusFilter === 'ALL STATUS') return true;
    const isMatch = statusFilter === 'ACTIVE' ? item.status === 'Active' : (item.status === 'Inactive' || item.status !== 'Active');
    return isMatch;
  });

  
  const calculatedTotalRecords = filteredList.length;
  const calculatedTotalPages = Math.ceil(calculatedTotalRecords / limit) || 1;
  const paginatedList = filteredList.slice((page - 1) * limit, page * limit);

  
  useEffect(() => {
    if (onTotalCountChange) {
      onTotalCountChange(calculatedTotalRecords);
    }
  }, [calculatedTotalRecords, onTotalCountChange]);

  const columns = [
    {
      header: 'UOM Code',
      key: 'uom_code',
      render: (row) => <span className="font-medium">{row.uom_code}</span>
    },
    {
      header: 'UOM Name',
      key: 'uom_name',
      render: (row) => row.uom_name
    },
    {
      header: 'Symbol',
      key: 'symbol',
      render: (row) => row.symbol || '-'
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => row.description || '-'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>
          {row.status || 'Active'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-xs" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit UOM"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (viewMode === 'card') {
    return (
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {paginatedList.map(uom => (
          <div key={uom.id}>
            <MasterDataCard
              title={`uom.uom_name} (${uom.symbol})`}
              code={uom.uom_code}
              status={uom.status}
              onEdit={() => onEdit && onEdit(uom)}
              
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No records found.
          </div>
        )}
      </div>
    );
  }

  return (
    <TableView
        columns={columns}
        data={paginatedList}
        isLoading={isLoading}
        emptyStateMsg="No UOMs found. Create one to get started."
        paginationProps={{
          currentPage: page,
          totalPages: calculatedTotalPages,
          onPageChange: setPage,
          totalItems: calculatedTotalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => onEdit && onEdit(row)}
      />
);
};

export default UOMList;
