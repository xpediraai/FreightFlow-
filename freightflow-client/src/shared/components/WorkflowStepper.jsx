import React from 'react';
import { Check, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const WORKFLOW_STEPS = [
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
  const activeStepId = status === 'Completed' ? 9 : (status === 'Pending' ? 1 : (currentStep || 4));

  const getStepState = (stepId) => {
    if (status === 'Cancelled') return 'cancelled';
    if (status === 'Completed') return 'completed';
    if (stepId < activeStepId) return 'completed';
    if (stepId === activeStepId) return 'active';
    return 'pending';
  };

  const progressPercent = Math.round(((status === 'Completed' ? 9 : activeStepId) / WORKFLOW_STEPS.length) * 100);

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={16} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827' }}>
              Operational Progression Workflow
            </h4>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Click any stage to update operational status dynamically
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status === 'Completed' ? (
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', backgroundColor: '#d1fae5', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> 100% Completed
            </span>
          ) : (
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 12px', borderRadius: '20px' }}>
              Stage {activeStepId} of {WORKFLOW_STEPS.length} ({WORKFLOW_STEPS[activeStepId - 1]?.label}) — {progressPercent}%
            </span>
          )}
        </div>
      </div>

      {/* STEPPER TRACK */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minWidth: '780px', position: 'relative' }}>
          {WORKFLOW_STEPS.map((step, idx) => {
            const stepState = getStepState(step.id);
            const isCompleted = stepState === 'completed';
            const isActive = stepState === 'active';
            const isCancelled = stepState === 'cancelled';

            let nodeBg = '#f3f4f6';
            let nodeBorder = '#e5e7eb';
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

            const isLineCompleted = idx < (status === 'Completed' ? 9 : activeStepId - 1);

            return (
              <React.Fragment key={step.id}>
                {/* CONNECTOR LINE */}
                {idx > 0 && (
                  <div 
                    style={{ 
                      flex: 1, 
                      height: '4px', 
                      backgroundColor: isLineCompleted ? '#10b981' : '#e5e7eb',
                      marginTop: '16px',
                      borderRadius: '2px',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                )}

                {/* STEP ITEM */}
                <div 
                  onClick={() => onStepClick && onStepClick(step)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: onStepClick ? 'pointer' : 'default',
                    zIndex: 2,
                    minWidth: '68px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (onStepClick) e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (onStepClick) e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  title={`Click to set workflow stage to: ${step.label}`}
                >
                  <div 
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: nodeBg,
                      border: `2px solid ${nodeBorder}`,
                      color: nodeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '700',
                      boxShadow: isActive ? '0 0 0 4px rgba(220, 38, 38, 0.2), 0 4px 10px rgba(220,38,38,0.3)' : (isCompleted ? '0 2px 6px rgba(16,185,129,0.2)' : 'none'),
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={2.5} /> : step.id}
                  </div>
                  
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: isActive ? '700' : (isCompleted ? '600' : '500'), 
                      color: isActive ? '#dc2626' : (isCompleted ? '#059669' : '#6b7280'),
                      marginTop: '8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.1px'
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
    </div>
  );
};

export default WorkflowStepper;
