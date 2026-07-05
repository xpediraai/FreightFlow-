import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, Briefcase, Map, FileText, Receipt, FileCheck, Warehouse, Navigation, Calculator, BarChart3, ShieldCheck, Bell } from 'lucide-react';
import './Features.css';

const featureData = [
  { icon: Truck, title: 'Shipment Management', desc: 'End-to-end visibility for global freight.' },
  { icon: Users, title: 'Customer Management', desc: 'CRM tailored for logistics operations.' },
  { icon: Briefcase, title: 'Vendor Management', desc: 'Onboard and manage global partners.' },
  { icon: Map, title: 'Container Tracking', desc: 'Real-time GPS and AIS integrations.' },
  { icon: FileText, title: 'Quotation', desc: 'Lightning fast multi-modal quoting.' },
  { icon: Receipt, title: 'Invoice', desc: 'Automated billing and dispute resolution.' },
  { icon: FileCheck, title: 'Documentation', desc: 'Generate HBL, MBL, and customs docs.' },
  { icon: Warehouse, title: 'Warehouse', desc: 'Inventory and storage optimization.' },
  { icon: Navigation, title: 'Transport', desc: 'First and last mile fleet tracking.' },
  { icon: Calculator, title: 'Accounting', desc: 'Seamless ERP finance integration.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Actionable BI and custom reports.' },
  { icon: ShieldCheck, title: 'Role Management', desc: 'Enterprise-grade access controls.' }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Features = () => {
  return (
    <section id="features" className="lp-features landing-section">
      <div className="text-center">
        <h2 className="landing-section-title">Everything You Need to Scale</h2>
        <p className="landing-section-subtitle">
          FreightFlow replaces fragmented tools with a single unified platform. 
          Manage quotes, shipments, customs, and billing in one place.
        </p>
      </div>

      <motion.div 
        className="lp-features-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {featureData.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div key={index} className="lp-feature-card" variants={itemVariants}>
              <div className="lp-feature-icon">
                <Icon size={24} />
              </div>
              <h3 className="lp-feature-title">{feature.title}</h3>
              <p className="lp-feature-desc">{feature.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Features;
