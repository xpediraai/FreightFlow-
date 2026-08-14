import React, { useState, useEffect } from 'react';
import { Search, Ship, FileText } from 'lucide-react';
import { logisticsService } from '../../../../masters/services/logistics.service';

const TrackingSearchForm = ({ onSearch, isLoading }) => {
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [blNumber, setBlNumber] = useState('');
  const [loadingLines, setLoadingLines] = useState(false);

  useEffect(() => {
    fetchShippingLines();
  }, []);

  const fetchShippingLines = async () => {
    setLoadingLines(true);
    try {
      const res = await logisticsService.getShippingLines({ limit: 100 });
      const lines = res.data?.data?.data || res.data?.data || res?.data || [];
      if (Array.isArray(lines) && lines.length > 0) {
        setShippingLines(lines);
        setSelectedLine(lines[0].shipping_line_name);
        setSelectedLineId(lines[0].id);
      } else {
        setSelectedLine('CMA CGM');
      }
    } catch (err) {
      console.warn('Could not fetch dynamic shipping lines, using standard catalog', err);
      setSelectedLine('CMA CGM');
    } finally {
      setLoadingLines(false);
    }
  };

  const handleLineSelect = (e) => {
    const val = e.target.value;
    setSelectedLine(val);
    const found = shippingLines.find((l) => l.shipping_line_name === val);
    if (found) setSelectedLineId(found.id);
    else setSelectedLineId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!blNumber.trim() || !selectedLine) return;
    onSearch(selectedLine, blNumber.trim(), selectedLineId);
  };

  return (
    <div className="tracking-search-card">
      <div className="tracking-search-header">
        <div className="tracking-title-block">
          <div className="tracking-icon-badge">
            <Ship size={24} />
          </div>
          <div>
            <h3>Live Multi-Source Shipment Search</h3>
            <p>
              Auto-scrapes Carrier Portal, Adani Mundra Port, DP World MICT & MarineTraffic AIS in Real Time
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="tracking-search-form">
        {/* Shipping Line Dropdown */}
        <div className="tracking-field-group">
          <label>Shipping Line Master *</label>
          <select
            value={selectedLine}
            onChange={handleLineSelect}
            disabled={isLoading || loadingLines}
            className="tracking-select"
            required
          >
            <option value="" disabled>-- Select Shipping Line --</option>
            {shippingLines.length > 0 ? (
              shippingLines.map((line) => (
                <option key={line.id} value={line.shipping_line_name}>
                  {line.shipping_line_name} {line.shipping_line_code ? `(${line.shipping_line_code})` : ''}
                </option>
              ))
            ) : (
              <>
                <option value="CMA CGM">CMA CGM</option>
                <option value="HMM (Hyundai Merchant Marine)">HMM (Hyundai Merchant Marine)</option>
                <option value="Maersk Line">Maersk Line</option>
                <option value="MSC">MSC (Mediterranean Shipping Co)</option>
                <option value="Hapag-Lloyd">Hapag-Lloyd</option>
                <option value="COSCO Shipping">COSCO Shipping</option>
                <option value="ONE (Ocean Network Express)">ONE (Ocean Network Express)</option>
                <option value="Evergreen Marine">Evergreen Marine</option>
              </>
            )}
          </select>
        </div>

        {/* BL Number Input */}
        <div className="tracking-field-group">
          <label>Master / House Bill of Lading (BL Number) *</label>
          <div className="tracking-input-wrapper">
            <FileText size={18} className="tracking-input-icon" />
            <input
              type="text"
              value={blNumber}
              onChange={(e) => setBlNumber(e.target.value.toUpperCase())}
              placeholder="Enter real BL Number (e.g. QGD3237299)"
              disabled={isLoading}
              required
              className="tracking-input with-icon"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !blNumber.trim()}
            className="tracking-submit-btn"
          >
            <Search size={18} />
            <span>{isLoading ? 'Tracking Live...' : 'Fetch Multi-Source'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrackingSearchForm;
