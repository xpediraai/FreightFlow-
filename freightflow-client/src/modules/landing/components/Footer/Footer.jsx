import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-container">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <h3 className="logo-text">FreightFlow</h3>
            <p className="brand-desc">
              The premium cloud-based ERP built exclusively for global freight forwarders and logistics leaders.
            </p>
          </div>
          
          <div className="lp-footer-links">
            <div className="link-group">
              <h4>Modules</h4>
              <a href="#">Shipment Management</a>
              <a href="#">Quotation & Pricing</a>
              <a href="#">Invoicing & Billing</a>
              <a href="#">Warehouse Management</a>
              <a href="#">Advanced Analytics</a>
            </div>
            
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Leadership</a>
              <a href="#">News & Press</a>
              <a href="#">Contact</a>
            </div>
            
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Case Studies</a>
              <a href="#">Webinars</a>
              <a href="#">Blog</a>
            </div>
          </div>
        </div>
        
        <div className="lp-footer-bottom">
          <p>&copy; {new Date().getFullYear()} FreightFlow Systems Inc. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
