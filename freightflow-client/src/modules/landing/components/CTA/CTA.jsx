import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './CTA.css';

const CTA = () => {
  return (
    <section className="lp-cta">
      <div className="lp-cta-container">
        <motion.div 
          className="lp-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Ready to Digitize Your Logistics?</h2>
          <p>
            Join the world's leading freight forwarders who have transformed their operations with FreightFlow ERP.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn-white btn-large">
              Book a Demo
              <ArrowRight size={18} className="ml-2" />
            </button>
            <button className="lp-btn-outline-white btn-large">
              Start Free Trial
            </button>
          </div>
        </motion.div>
        
        {/* Background decorative elements */}
        <div className="lp-cta-blob blob-1"></div>
        <div className="lp-cta-blob blob-2"></div>
      </div>
    </section>
  );
};

export default CTA;
