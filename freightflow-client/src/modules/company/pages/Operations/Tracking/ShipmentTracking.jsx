import React, { useState } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import { 
  Radar, 
  ListOrdered, 
  RefreshCw,
  Ship,
  Search
} from 'lucide-react';
import TrackingSearchForm from './TrackingSearchForm';
import ConsolidatedTrackingCard from './ConsolidatedTrackingCard';
import DiscrepancyAlertBanner from './DiscrepancyAlertBanner';
import SourceComparisonView from './SourceComparisonView';
import ContainerMilestoneTimeline from './ContainerMilestoneTimeline';
import VesselPositionMap from './VesselPositionMap';
import MonitoredShipmentsList from './MonitoredShipmentsList';
import { trackingService } from '../../../../masters/services/tracking.service';
import { toast } from 'react-toastify';
import './ShipmentTracking.css';

const ShipmentTracking = () => {
  const [activeTab, setActiveTab] = useState('LIVE_SEARCH'); // 'LIVE_SEARCH' | 'MONITORED_LIST'
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [overrideValues, setOverrideValues] = useState({});
  const [lastSearchedParams, setLastSearchedParams] = useState(null);

  const handleSearch = async (shippingLineName, blNumber, shippingLineId = null) => {
    setIsLoading(true);
    setOverrideValues({});
    setLastSearchedParams({ shippingLineName, blNumber, shippingLineId });

    try {
      const res = await trackingService.fetchLiveTracking(shippingLineName, blNumber, shippingLineId);
      if (res && res.data) {
        setTrackingResult(res.data);
        const contCount = res.data?.consolidated?.containers?.length || 0;
        toast.success(`⚡ Live multi-source telemetry fetched for ${blNumber}! (${contCount} containers detected)`);
      } else {
        toast.error("No tracking data returned for this shipment.");
      }
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
      toast.error(err.response?.data?.messageToShow || err.message || 'Failed to fetch live tracking.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleOverrideChange = (field, value) => {
    setOverrideValues((prev) => ({ ...prev, [field]: value }));
    toast.info(`Confirmed value for ${field.toUpperCase()} selected.`);
  };

  const handleConfirmTracking = async () => {
    if (!trackingResult?.consolidated) return;
    setIsConfirming(true);
    try {
      const payload = {
        shipping_line_id: lastSearchedParams?.shippingLineId || null,
        consolidated: trackingResult.consolidated,
        sources: trackingResult.sources,
        override_values: overrideValues,
      };

      await trackingService.confirmTracking(payload);
      toast.success('Shipment confirmed! Continuous automated background monitoring activated.');
      setActiveTab('MONITORED_LIST');
    } catch (err) {
      toast.error(err.response?.data?.messageToShow || err.message || 'Failed to confirm tracking.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSelectFromList = (shipment) => {
    if (shipment) {
      setTrackingResult({
        consolidated: {
          bl_number: shipment.bl_number,
          shipping_line_name: shipment.shipping_line_name,
          shipping_line_code: shipment.shipping_line_code,
          vessel_name: shipment.vessel_name,
          voyage_number: shipment.voyage_number,
          connecting_vessel_name: shipment.connecting_vessel_name,
          connecting_voyage_number: shipment.connecting_voyage_number,
          vessels: shipment.vessels && shipment.vessels.length > 0 ? shipment.vessels : (
            shipment.vessel_name ? [
              { vessel_name: shipment.vessel_name, voyage_number: shipment.voyage_number, leg_type: '1st Leg (Origin Vessel)' },
              ...(shipment.connecting_vessel_name ? [{ vessel_name: shipment.connecting_vessel_name, voyage_number: shipment.connecting_voyage_number, leg_type: 'Connecting / Ocean Vessel' }] : [])
            ] : []
          ),
          imo_number: shipment.imo_number,
          pol: { name: shipment.pol_name, code: shipment.pol_code },
          pod: { name: shipment.pod_name, code: shipment.pod_code },
          current_location: shipment.current_location,
          latitude: shipment.latitude,
          longitude: shipment.longitude,
          speed_knots: shipment.speed_knots,
          heading: shipment.heading,
          nav_status: shipment.nav_status,
          consolidated_eta: shipment.consolidated_eta,
          carrier_eta: shipment.carrier_eta,
          port_eta: shipment.port_eta,
          ais_eta: shipment.ais_eta,
          shipment_status: shipment.shipment_status,
          containers: shipment.containers || [],
          discrepancy_analysis: {
            has_discrepancies: shipment.discrepancies?.length > 0,
            discrepancies: shipment.discrepancies || [],
            confidence_score: shipment.discrepancies?.length > 0 ? 'MEDIUM' : 'HIGH',
          },
        },
        sources: shipment.sources_snapshot || {
          carrier: {
            source: 'CMA_CGM_FEED',
            vessel_name: shipment.vessel_name,
            voyage_number: shipment.voyage_number,
            current_status: shipment.shipment_status,
            containers: shipment.containers || []
          }
        },
      });
      setActiveTab('LIVE_SEARCH');
    }
  };


  return (
    <Page>
      <PageHeader
        title="Automated Multi-Source Shipment Tracking"
        description="Unified real-time tracking engine across Carrier Portals, Adani Mundra Port, DP World MICT & MarineTraffic AIS."
      />

      <div className="shipment-tracking-container">
        {/* Navigation Tabs */}
        <div className="tracking-nav-bar">
          <div className="tracking-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('LIVE_SEARCH')}
              className={`tracking-tab-btn ${activeTab === 'LIVE_SEARCH' ? 'active' : ''}`}
            >
              <Radar size={16} />
              <span>Multi-Source Live Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MONITORED_LIST')}
              className={`tracking-tab-btn ${activeTab === 'MONITORED_LIST' ? 'active' : ''}`}
            >
              <ListOrdered size={16} />
              <span>Monitored Shipments</span>
            </button>
          </div>

          {activeTab === 'LIVE_SEARCH' && trackingResult && (
            <div className="tracking-scan-meta">
              <span>
                Last Scan:{' '}
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {new Date().toLocaleTimeString()}
                </strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  lastSearchedParams &&
                  handleSearch(
                    lastSearchedParams.shippingLineName,
                    lastSearchedParams.blNumber,
                    lastSearchedParams.shippingLineId
                  )
                }
                disabled={isLoading}
                className="quick-test-pill"
                title="Re-Scan Sources"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Live Search & Verification View */}
        {activeTab === 'LIVE_SEARCH' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Box */}
            <TrackingSearchForm onSearch={handleSearch} isLoading={isLoading} />

            {/* Results Section */}
            {trackingResult?.consolidated ? (
              <>
                {/* 1. High-Level Consolidated Summary Card */}
                <ConsolidatedTrackingCard
                  consolidated={trackingResult.consolidated}
                  onConfirm={handleConfirmTracking}
                  isConfirming={isConfirming}
                  hasDiscrepancies={trackingResult.consolidated.discrepancy_analysis?.has_discrepancies}
                />

                {/* 2. Discrepancy & Verification Alert Banner */}
                <DiscrepancyAlertBanner
                  discrepancies={trackingResult.consolidated.discrepancy_analysis?.discrepancies}
                  confidenceScore={trackingResult.consolidated.discrepancy_analysis?.confidence_score}
                  overrideValues={overrideValues}
                  onOverrideChange={handleOverrideChange}
                />

                {/* 3. Source-by-Source Breakdown */}
                <SourceComparisonView sources={trackingResult.sources} />

                {/* 4. MarineTraffic AIS Live Radar Card */}
                <VesselPositionMap
                  vesselData={{
                    vessel_name: trackingResult.consolidated.vessel_name,
                    imo_number: trackingResult.consolidated.imo_number,
                    latitude: trackingResult.consolidated.latitude,
                    longitude: trackingResult.consolidated.longitude,
                    speed_knots: trackingResult.consolidated.speed_knots,
                    heading: trackingResult.consolidated.heading,
                    nav_status: trackingResult.consolidated.nav_status,
                    current_location: trackingResult.consolidated.current_location,
                    destination_port: trackingResult.consolidated.pod?.name,
                    source_url: trackingResult.sources?.marine_traffic_ais?.source_url,
                  }}
                />

                {/* 5. Container Milestones & Progress Timeline */}
                <ContainerMilestoneTimeline
                  containers={trackingResult.consolidated.containers}
                />
              </>
            ) : (
              !isLoading && (
                <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Search size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.3 }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Ready for Real-Time Multi-Source Tracking
                  </h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    Select a Shipping Line and type any Bill of Lading (BL) Number above to fetch live data across all 4 tracking feeds.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Tab 2: Monitored Active Shipments Dashboard */}
        {activeTab === 'MONITORED_LIST' && (
          <MonitoredShipmentsList onSelectShipment={handleSelectFromList} />
        )}
      </div>
    </Page>
  );
};

export default ShipmentTracking;
