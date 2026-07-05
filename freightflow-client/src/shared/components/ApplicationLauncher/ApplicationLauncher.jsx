import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { applications } from '../../../core/config/applications';
import clsx from 'clsx';
import './ApplicationLauncher.css';

const ApplicationLauncher = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAppClick = (route) => {
    navigate(route);
    onClose();
  };

  const visibleApps = applications
    .filter(app => app.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="launcher-overlay animate-fade-in">
      <div className="launcher-container animate-slide-up">
        <div className="launcher-header">
          <h2>Application Launcher</h2>
          <button className="launcher-close" onClick={onClose} aria-label="Close Launcher">
            <X size={24} />
          </button>
        </div>
        
        <div className="launcher-grid">
          {visibleApps.map((app) => {
            const Icon = app.icon;
            return (
              <button 
                key={app.id} 
                className="launcher-card"
                onClick={() => handleAppClick(app.route)}
              >
                <div 
                  className="launcher-card-icon" 
                  style={{ backgroundColor: `${app.color}15`, color: app.color }}
                >
                  <Icon size={32} />
                </div>
                <div className="launcher-card-content">
                  <h3 className="launcher-card-title">{app.name}</h3>
                  <p className="launcher-card-desc">{app.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationLauncher;
