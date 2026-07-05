import React from 'react';
import { motion } from 'framer-motion';
import { Target, FileText, CalendarCheck, Truck, Receipt, CheckCircle, Flag } from 'lucide-react';
import './Workflow.css';

const steps = [
  { icon: Target, label: 'Lead' },
  { icon: FileText, label: 'Quotation' },
  { icon: CalendarCheck, label: 'Booking' },
  { icon: Truck, label: 'Shipment' },
  { icon: Receipt, label: 'Invoice' },
  { icon: CheckCircle, label: 'Delivery' },
  { icon: Flag, label: 'Completed' },
];

const Workflow = () => {
  return (
    <section id="workflow" className="lp-workflow landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">End-to-End Business Workflow</h2>
        <p className="landing-section-subtitle">
          Automate your entire freight forwarding lifecycle. From the first customer inquiry to the final invoice, data flows seamlessly.
        </p>
      </div>

      <div className="lp-workflow-container">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="lp-workflow-step">
              <motion.div 
                className="lp-workflow-icon-box"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
              >
                <Icon size={24} />
              </motion.div>
              <motion.h4 
                className="lp-workflow-label"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (index * 0.15) + 0.2 }}
              >
                {step.label}
              </motion.h4>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="lp-workflow-connector">
                  <motion.div 
                    className="lp-workflow-line"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index * 0.15) + 0.3, duration: 0.4, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Workflow;
