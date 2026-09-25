import React from 'react';

const getStatusColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (['approved', 'accepted', 'completed', 'released', 'leo received', 'cleared', 'paid', 'gate in', 'in progress'].some(k => s.includes(k))) {
    return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
  }
  if (['draft', 'pending', 'under verification', 'requested', 'unpaid', 'submitted'].some(k => s.includes(k))) {
    return { bg: '#fef9c3', text: '#a16207', border: '#fef08a' };
  }
  if (['sent', 'dispatched', 'in transit'].some(k => s.includes(k))) {
    return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
  }
  if (['rejected', 'cancelled', 'hold', 'query raised'].some(k => s.includes(k))) {
    return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
  }
  return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
};

export default function StatusBadge({ status }) {
  const style = getStatusColor(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status || 'Draft'}
    </span>
  );
}
