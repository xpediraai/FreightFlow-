import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import './Comparison.css';

const Comparison = () => {
  return (
    <section className="lp-comparison landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">Why FreightFlow ERP?</h2>
        <p className="landing-section-subtitle">
          See how moving to a modern, cloud-native ERP changes everything.
        </p>
      </div>

      <div className="lp-comparison-container">
        {/* Traditional */}
        <motion.div 
          className="lp-comparison-card traditional"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="card-header">
            <h3>Traditional Logistics</h3>
          </div>
          <ul className="comparison-list">
            <li><XCircle color="var(--lp-text-light)" size={20}/> Siloed data across multiple systems</li>
            <li><XCircle color="var(--lp-text-light)" size={20}/> Manual quoting and slow responses</li>
            <li><XCircle color="var(--lp-text-light)" size={20}/> On-premise servers and high IT costs</li>
            <li><XCircle color="var(--lp-text-light)" size={20}/> Blind spots in shipment tracking</li>
            <li><XCircle color="var(--lp-text-light)" size={20}/> Messy email trails for documentation</li>
          </ul>
        </motion.div>

        {/* FreightFlow */}
        <motion.div 
          className="lp-comparison-card modern"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-header">
            <h3>FreightFlow ERP</h3>
            <div className="badge">Recommended</div>
          </div>
          <ul className="comparison-list">
            <li><CheckCircle2 color="var(--lp-primary)" size={20}/> Single unified source of truth</li>
            <li><CheckCircle2 color="var(--lp-primary)" size={20}/> Automated, instant multi-modal quotes</li>
            <li><CheckCircle2 color="var(--lp-primary)" size={20}/> Cloud-native, zero infrastructure</li>
            <li><CheckCircle2 color="var(--lp-primary)" size={20}/> Real-time GPS and AIS tracking</li>
            <li><CheckCircle2 color="var(--lp-primary)" size={20}/> Centralized digital document vault</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default Comparison;
