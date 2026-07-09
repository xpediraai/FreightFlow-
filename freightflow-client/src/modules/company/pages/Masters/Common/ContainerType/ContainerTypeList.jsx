import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const ContainerTypeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [containers, setContainers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContainers();
  }, [refreshTrigger]);
  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getContainerTypes();
      let containerData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        containerData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        containerData = data.data;
      } else if (Array.isArray(data)) {
        containerData = data;
      }
      setContainers(containerData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch container types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = containers.filter(item => {
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
      header: 'Code',
      key: 'container_code',
      render: (row) => <span className="font-medium">{row.container_code}</span>
    },
    {
      header: 'Name',
      key: 'container_name',
      render: (row) => row.container_name
    },
    {
      header: 'ISO Code',
      key: 'iso_code',
      render: (row) => row.iso_code
    },
    {
      header: 'Size',
      key: 'size',
      render: (row) => `${row.size}'`
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => row.category
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
            title="Edit Container Type"
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
        {paginatedList.map(container => (
          <div key={container.id}>
            <MasterDataCard
              title={container.container_name}
              code={container.container_code}
              subtitle={container.iso_code ? `ISO: ${container.iso_code}` : ''}
              status={container.status}
              onEdit={() => onEdit && onEdit(container)}
              gridData={[
                { label: 'Type', value: `${container.size}' ${container.category}` },
                { label: 'Capacity', value: `${container.capacity_cbm} CBM` },
                { label: 'Max Wt', value: `${container.max_weight} kg` }
              ]}
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
        emptyStateMsg="No container types found. Create one to get started."
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

export default ContainerTypeList;
