import React, { useState } from 'react';
import { Plus, Package, Edit2, Trash2 } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge';

const ContainerTab = ({ shipmentId, jobId }) => {
  const [containers, setContainers] = useState([
    {
      id: 'cnt-1',
      container_number: 'MSCU4829102',
      type: '40ft High Cube (40HC)',
      seal_number: 'SL-994821',
      gross_weight: '24,500 KG',
      tare_weight: '3,800 KG',
      cbm: '67.5 m³',
      status: 'Loaded'
    },
    {
      id: 'cnt-2',
      container_number: 'TGHU8192019',
      type: '20ft Standard (20GP)',
      seal_number: 'SL-994822',
      gross_weight: '18,200 KG',
      tare_weight: '2,200 KG',
      cbm: '33.2 m³',
      status: 'Gate-In'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    container_number: '',
    type: '40ft High Cube (40HC)',
    seal_number: '',
    gross_weight: '',
    tare_weight: '',
    cbm: '',
    status: 'Gate-In'
  });

  const handleAddContainer = (e) => {
    e.preventDefault();
    if (!formData.container_number) return;
    const newCnt = {
      id: `cnt-${Date.now()}`,
      ...formData
    };
    setContainers([...containers, newCnt]);
    setIsModalOpen(false);
    setFormData({
      container_number: '',
      type: '40ft High Cube (40HC)',
      seal_number: '',
      gross_weight: '',
      tare_weight: '',
      cbm: '',
      status: 'Gate-In'
    });
  };

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: '#dc2626' }} /> Container Allocation & Weights
          </h4>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            Total Containers: <strong>{containers.length}</strong>
          </span>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          leftIcon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Container
        </Button>
      </div>

      {/* CONTAINERS TABLE */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 14px' }}>CONTAINER NO</th>
              <th style={{ padding: '12px 14px' }}>TYPE</th>
              <th style={{ padding: '12px 14px' }}>SEAL NO</th>
              <th style={{ padding: '12px 14px' }}>GROSS WEIGHT</th>
              <th style={{ padding: '12px 14px' }}>TARE WEIGHT</th>
              <th style={{ padding: '12px 14px' }}>CBM</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {containers.map(cnt => (
              <tr key={cnt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#dc2626' }}>{cnt.container_number}</td>
                <td style={{ padding: '12px 14px', color: '#111827' }}>{cnt.type}</td>
                <td style={{ padding: '12px 14px', color: '#4b5563' }}>{cnt.seal_number || '-'}</td>
                <td style={{ padding: '12px 14px', fontWeight: '600' }}>{cnt.gross_weight || '-'}</td>
                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{cnt.tare_weight || '-'}</td>
                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{cnt.cbm || '-'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge variant={cnt.status === 'Loaded' ? 'success' : 'info'}>{cnt.status}</Badge>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button 
                    onClick={() => setContainers(containers.filter(c => c.id !== cnt.id))}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove Container"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {containers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>
                  No containers allocated. Click "Add Container" to attach containers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD CONTAINER MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Add Container</h3>
            <form onSubmit={handleAddContainer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Container Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. MSCU4829102"
                  value={formData.container_number}
                  onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Container Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                >
                  <option value="40ft High Cube (40HC)">40ft High Cube (40HC)</option>
                  <option value="20ft Standard (20GP)">20ft Standard (20GP)</option>
                  <option value="40ft Standard (40GP)">40ft Standard (40GP)</option>
                  <option value="45ft High Cube (45HC)">45ft High Cube (45HC)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Seal Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. SL-994821"
                  value={formData.seal_number}
                  onChange={(e) => setFormData({ ...formData, seal_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Gross Weight</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 24,500 KG"
                    value={formData.gross_weight}
                    onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CBM</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 67.5 m³"
                    value={formData.cbm}
                    onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Container</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainerTab;
