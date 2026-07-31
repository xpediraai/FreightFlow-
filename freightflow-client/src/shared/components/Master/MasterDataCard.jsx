import React from 'react';
import Badge from '../Badge';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const MasterDataCard = ({
  title,
  subtitle,
  code,
  status,
  locationText,
  locationIcon: LocationIcon = MapPin,
  gridData = [],
  onEdit,
  onDelete,
  editLabel = 'Edit'
}) => {
  const isInactive = status === 'Inactive' || status === 'Disabled';
  const topBorderColor = isInactive ? '#ef4444' : '#dc2626';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    const containers = document.querySelectorAll('.layout-content, .app-content, main, .page-content, #root > div');
    containers.forEach(el => {
      try { el.scrollTo({ top: 0, behavior: 'smooth' }); } catch(err) {}
    });
  };

  const handleEditClick = (e) => {
    if (e) e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
    scrollToTop();
  };

  const handleDeleteClick = (e) => {
    if (e) e.stopPropagation();
    if (onDelete) onDelete();
  };

  const hasDistinctTitle = title && code && title.trim().toLowerCase() !== code.trim().toLowerCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={handleEditClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        borderTop: `4px solid ${topBorderColor}`,
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div>
        {/* TOP ROW: CODE & STATUS BADGE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827', letterSpacing: '0.2px' }}>
            {code || title}
          </span>
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              backgroundColor: isInactive ? '#fee2e2' : '#d1fae5', 
              color: isInactive ? '#991b1b' : '#065f46',
              border: `1px solid ${isInactive ? '#fca5a5' : '#6ee7b7'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.4px'
            }}
          >
            {status || 'Active'}
          </span>
        </div>

        {/* TITLE & SUBTITLE / LOCATION */}
        {(hasDistinctTitle || subtitle || locationText) && (
          <div style={{ marginBottom: '14px' }}>
            {hasDistinctTitle && (
              <h4 
                style={{ 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  color: '#1f2937', 
                  margin: '0 0 4px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} 
                title={title}
              >
                {title}
              </h4>
            )}
            
            {(subtitle || locationText) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                {LocationIcon && <LocationIcon size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {locationText || subtitle}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2x2 METADATA GRID */}
        {gridData.length > 0 && (
          <div 
            style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '10px', 
              padding: '12px 14px', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              border: '1px solid #f3f4f6',
              marginBottom: '14px'
            }}
          >
            {gridData.map((data, index) => (
              <div key={index} style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  {data.label}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {data.value || '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS: EDIT & DELETE */}
      <div 
        style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          paddingTop: '14px', 
          borderTop: '1px solid #f3f4f6' 
        }}
      >
        <button 
          type="button"
          onClick={handleEditClick}
          style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            border: 'none',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.2px',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(220, 38, 38, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Edit2 size={14} /> {editLabel}
        </button>

        {onDelete && (
          <button 
            type="button"
            title="Delete Record"
            onClick={handleDeleteClick}
            style={{
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#ef4444',
              padding: '7px 11px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MasterDataCard;
