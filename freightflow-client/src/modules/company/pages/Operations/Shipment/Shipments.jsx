import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import ShipmentList from './ShipmentList';
import { Search } from 'lucide-react';
import { businessService } from '../../../../masters/services/business.service';

const Shipments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [customerFilter, setCustomerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await businessService.getCustomers({ page: 1, limit: 1000 });
      let data = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      }
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers filter:', err);
    }
  };

  const handleCreateNew = () => {
    navigate('/company/operations/shipments/create');
  };

  return (
    <Page>
      <PageHeader 
        title="Shipment Management"
        subtitle="Manage freight shipments, routes, cargo details, and operations"
        primaryAction={{ label: '+ Create Shipment', onClick: handleCreateNew }}
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          {/* TOOLBAR ALIGNMENT HEADER */}
          <div className="p-md border-b-light flex flex-wrap items-center justify-between gap-md">
            <div className="flex items-center">
              <span className="font-bold text-secondary text-sm">
                Total Shipment: {totalRecords}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-sm" style={{ flex: '1 1 auto', justifyContent: 'flex-end' }}>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: '140px' }}
              >
                <option value="ALL STATUS">ALL STATUS</option>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select 
                className="form-control form-control-sm"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.customer_name || c.name}</option>
                ))}
              </select>

              <select 
                className="form-control form-control-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="">All Types</option>
                <option value="Export">Export</option>
                <option value="Import">Import</option>
                <option value="Domestic">Domestic</option>
                <option value="Cross-Trade">Cross-Trade</option>
              </select>

              <div className="search-input-wrapper relative" style={{ width: '220px' }}>
                <Search size={16} className="text-secondary-light absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control form-control-sm w-full"
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>

          <ShipmentList 
            searchQuery={searchTerm}
            viewMode={viewMode}
            refreshTrigger={refreshTrigger}
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
            customerFilter={customerFilter}
            typeFilter={typeFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default Shipments;
