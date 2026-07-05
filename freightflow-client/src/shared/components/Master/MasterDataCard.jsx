import React from 'react';
import Badge from '../Badge';
import Button from '../Button';
import { ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const MasterDataCard = ({
  title,
  subtitle,
  code,
  status,
  locationText,
  locationIcon: LocationIcon,
  gridData = [],
  onEdit,
  editLabel = 'Open Profile',
  viewDocsLabel = 'View Details'
}) => {
  return (
    <motion.div 
      className="bg-surface rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full"
      style={{ border: '1px solid var(--border)', borderTop: status === 'Inactive' ? '4px solid var(--danger)' : '4px solid var(--primary)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-md flex flex-col h-full">
        <div className="flex justify-between align-center mb-md">
          <span className="font-bold text-sm text-text">{code}</span>
          <Badge variant={status === 'Inactive' ? 'danger' : 'success'}>
            {status || 'Active'}
          </Badge>
        </div>
        
        <h3 className="m-0 text-lg font-bold mb-xs text-text truncate" title={title}>{title}</h3>
        {subtitle && <p className="text-secondary-light text-sm m-0 mb-md truncate">{subtitle}</p>}
        
        {locationText && (
          <div className="flex align-center gap-xs text-sm text-secondary-light mb-md">
            {LocationIcon && <LocationIcon size={14} />}
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {gridData.length > 0 && (
          <div className="grid grid-cols-2 gap-md mb-xl mt-auto">
            {gridData.map((data, index) => (
              <div key={index} className="overflow-hidden">
                <p className="text-xs text-secondary-light font-bold uppercase mb-xs truncate" title={data.label}>{data.label}</p>
                <p className="text-sm font-bold m-0 text-text truncate" title={data.value}>{data.value || '-'}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-md border-t-light flex gap-sm">
          <Button variant="outline" className="flex-1" size="sm" onClick={() => onEdit && onEdit()} leftIcon={FileText}>{viewDocsLabel}</Button>
          <Button variant="primary" className="flex-1 bg-primary text-white" size="sm" rightIcon={ArrowRight} onClick={() => onEdit && onEdit()}>
            {editLabel}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MasterDataCard;
