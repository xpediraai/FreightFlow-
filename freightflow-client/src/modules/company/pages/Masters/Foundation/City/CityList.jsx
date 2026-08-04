import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import { Eye, Edit2, Trash2, MapPin } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CityList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await foundationService.deleteCity(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setCities(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    fetchCities();
  }, [refreshTrigger]);
  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCities({ page: 1, limit: 10000 });
      let cityData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        cityData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        cityData = data.data;
      } else if (Array.isArray(data)) {
        cityData = data;
      }
      setCities(cityData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = cities.filter(item => {
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
      header: 'City Code',
      key: 'city_code',
      render: (row) => <span className="font-medium">{row.city_code}</span>
    },
    {
      header: 'City Name',
      key: 'city_name',
      render: (row) => row.city_name
    },
    {
      header: 'State / Country',
      key: 'state_country',
      render: (row) => (
        <div>
          <div>{row.state?.state_name || row.State?.state_name || '-'}</div>
          <div className="text-secondary-light text-xs">{row.country?.country_name || row.Country?.country_name || '-'}</div>
        </div>
      )
    },
    {
      header: 'GST / Pincode',
      key: 'gst_pincode',
      render: (row) => (
        <div>
          <div>{row.gst || '-'}</div>
          <div className="text-secondary-light text-xs">{row.pincode || '-'}</div>
        </div>
      )
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
            title="Edit City"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title="Delete"
            onClick={() => handleDeleteClick(row)}
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
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {paginatedList.map(city => (
          <div key={city.id}>
            <MasterDataCard
              title={city.city_name}
              code={city.city_code}
              status={city.status}
              locationText={`${city.state?.state_name || city.State?.state_name || '-'} → ${city.country?.country_name || city.Country?.country_name || '-'}`}
              locationIcon={MapPin}
              onEdit={() => onEdit && onEdit(city)}
              gridData={[
                { label: 'Pincode', value: city.pincode },
                { label: 'GST', value: city.gst }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No cities found.
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.city_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
  }

  return (
    <>
    <TableView
        columns={columns}
        data={paginatedList}
        isLoading={isLoading}
        emptyStateMsg="No cities found. Create one to get started."
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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.city_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default CityList;
