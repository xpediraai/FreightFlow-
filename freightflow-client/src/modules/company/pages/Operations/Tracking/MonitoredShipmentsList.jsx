import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Search, 
  RefreshCw, 
  History, 
  MapPin, 
  ArrowRight,
  Filter
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';
import Button from '../../../../../shared/components/Button/Button';
import ViewSwitcher from '../../../../../shared/components/ViewSwitcher/ViewSwitcher';
import { trackingService } from '../../../../masters/services/tracking.service';
import TrackingHistoryModal from './TrackingHistoryModal';
import { toast } from 'react-toastify';

const MonitoredShipmentsList = ({ onSelectShipment }) => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [selectedHistoryTracking, setSelectedHistoryTracking] = useState(null);
  const [isRefreshingId, setIsRefreshingId] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, [page, statusFilter]);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const res = await trackingService.getTrackedShipments({
        page,
        limit: 10,
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setShipments(res?.data || []);
      setTotalCount(res?.total || 0);
    } catch (err) {
      console.error('Failed to fetch monitored shipments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchShipments();
  };

  const handleRefresh = async (id, e) => {
    e.stopPropagation();
    setIsRefreshingId(id);
    try {
      const updated = await trackingService.refreshTracking(id);
      toast.success('Live tracking data re-scanned and updated!');
      setShipments((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      toast.error('Failed to refresh tracking: ' + err.message);
    } finally {
      setIsRefreshingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search & Filter Toolbar */}
      <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div className="tracking-input-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="tracking-input-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by BL, Vessel, or Voyage..."
              className="tracking-input with-icon"
              style={{ height: '38px', fontSize: '0.8rem' }}
            />
          </div>
          <button type="submit" className="tracking-submit-btn" style={{ height: '38px', padding: '0 1rem', fontSize: '0.8rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="tracking-select"
            style={{ height: '38px', fontSize: '0.8rem', width: 'auto' }}
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="In Transit">In Transit</option>
            <option value="Vessel Arrived">Vessel Arrived</option>
            <option value="Berthed">Berthed</option>
            <option value="Discharged">Discharged</option>
            <option value="Completed">Completed</option>
          </select>

          <ViewSwitcher
            currentView={viewMode}
            onViewChange={(mode) => {
              setViewMode(mode);
              localStorage.setItem('preferredViewMode', mode);
            }}
          />

          <button
            type="button"
            onClick={fetchShipments}
            disabled={isLoading}
            className="quick-test-pill"
            style={{ height: '38px', padding: '0 0.75rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* List / Table Content */}
      {shipments.length === 0 && !isLoading ? (
        <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Ship size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            No Monitored Shipments Yet
          </h4>
          <p style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
            Search a BL number in the Live Scanner tab and click "Confirm & Monitor Shipment" to save it here.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>BL & Carrier</th>
                <th>Vessel / Voyage</th>
                <th>Route (POL → POD)</th>
                <th>Containers</th>
                <th>Consolidated ETA</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} onClick={() => onSelectShipment && onSelectShipment(s)} style={{ cursor: 'pointer' }}>
                  <td>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--primary, #d32f2f)', display: 'block' }}>{s.bl_number}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.shipping_line_name}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{s.vessel_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace' }}>Vy: {s.voyage_number}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <span>{s.pol_code || 'CNTAO'}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-secondary)' }} />
                      <strong style={{ color: 'var(--primary)' }}>{s.pod_code || 'INMUN'}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{s.containers?.length || 0} Unit(s)</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                    {formatDate(s.consolidated_eta)}
                  </td>
                  <td>
                    <Badge variant={s.shipment_status === 'Completed' ? 'success' : 'primary'}>
                      {s.shipment_status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleRefresh(s.id, e)}
                        disabled={isRefreshingId === s.id}
                        className="quick-test-pill"
                        title="Re-Scan Live Data"
                      >
                        <RefreshCw size={13} className={isRefreshingId === s.id ? 'animate-spin' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryTracking(s)}
                        className="quick-test-pill"
                        title="View History Timeline"
                      >
                        <History size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {shipments.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectShipment && onSelectShipment(s)}
              className="source-card"
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>
                    {s.bl_number}
                  </span>
                  <Badge variant="success">{s.shipment_status}</Badge>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                  {s.shipping_line_name}
                </p>

                <table className="source-info-table">
                  <tbody>
                    <tr><td>Vessel:</td><td>{s.vessel_name}</td></tr>
                    <tr><td>Voyage:</td><td>{s.voyage_number}</td></tr>
                    <tr><td>Route:</td><td>{s.pol_code} → {s.pod_code}</td></tr>
                    <tr><td>ETA:</td><td style={{ fontFamily: 'monospace' }}>{formatDate(s.consolidated_eta)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.containers?.length || 0} Container(s)</span>
                <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={(e) => handleRefresh(s.id, e)} className="quick-test-pill">
                    <RefreshCw size={12} />
                  </button>
                  <button type="button" onClick={() => setSelectedHistoryTracking(s)} className="quick-test-pill">
                    <History size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Timeline Modal */}
      <TrackingHistoryModal
        isOpen={!!selectedHistoryTracking}
        onClose={() => setSelectedHistoryTracking(null)}
        tracking={selectedHistoryTracking}
      />
    </div>
  );
};

export default MonitoredShipmentsList;
