import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 1, label: 'Booking', code: 'BOOKING' },
  { id: 2, label: 'SI Submission', code: 'SI' },
  { id: 3, label: 'Container Load', code: 'CONTAINER' },
  { id: 4, label: 'Customs Clear', code: 'CUSTOMS' },
  { id: 5, label: 'BL Release', code: 'BL' },
  { id: 6, label: 'Vessel On-Board', code: 'ONBOARD' },
  { id: 7, label: 'In-Transit', code: 'TRANSIT' },
  { id: 8, label: 'Arrival POD', code: 'POD' },
  { id: 9, label: 'Delivered', code: 'DELIVERED' }
];

const WorkflowStepper = ({ currentStep = 4, onStepClick, status = 'In-Progress' }) => {
  const getStepStatus = (stepId) => {
    if (status === 'Cancelled') return 'cancelled';
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        overflowX: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} style={{ color: '#dc2626' }} /> Operational Progression Workflow
        </h4>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
          Stage <strong style={{ color: '#dc2626' }}>{currentStep}</strong> of {WORKFLOW_STEPS.length} ({WORKFLOW_STEPS[currentStep - 1]?.label || 'In Progress'})
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', minWidth: '700px' }}>
        {WORKFLOW_STEPS.map((step, idx) => {
          const stepState = getStepStatus(step.id);
          const isCompleted = stepState === 'completed';
          const isActive = stepState === 'active';
          const isCancelled = stepState === 'cancelled';

          let nodeBg = '#f3f4f6';
          let nodeBorder = '#d1d5db';
          let nodeColor = '#6b7280';

          if (isCompleted) {
            nodeBg = '#10b981';
            nodeBorder = '#059669';
            nodeColor = '#ffffff';
          } else if (isActive) {
            nodeBg = '#dc2626';
            nodeBorder = '#b91c1c';
            nodeColor = '#ffffff';
          } else if (isCancelled) {
            nodeBg = '#fef2f2';
            nodeBorder = '#fca5a5';
            nodeColor = '#ef4444';
          }

          return (
            <React.Fragment key={step.id}>
              {/* Connector line */}
              {idx > 0 && (
                <div 
                  style={{ 
                    flex: 1, 
                    height: '3px', 
                    backgroundColor: idx < currentStep ? '#10b981' : '#e5e7eb',
                    margin: '0 4px',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease'
                  }} 
                />
              )}

              {/* Step circle & label */}
              <div 
                onClick={() => onStepClick && onStepClick(step)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: onStepClick ? 'pointer' : 'default',
                  zIndex: 2
                }}
                title={`Click to set stage to: ${step.label}`}
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: nodeBg,
                    border: `2px solid ${nodeBorder}`,
                    color: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: isActive ? '0 0 0 4px rgba(220, 38, 38, 0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCompleted ? <Check size={16} /> : step.id}
                </div>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: isActive ? '700' : '600', 
                    color: isActive ? '#dc2626' : (isCompleted ? '#059669' : '#6b7280'),
                    marginTop: '6px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
