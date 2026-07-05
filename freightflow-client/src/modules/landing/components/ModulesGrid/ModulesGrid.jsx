import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Truck, FileText, Receipt, Landmark, Warehouse, BarChart3, Settings, ShieldCheck, PieChart } from 'lucide-react';
import './ModulesGrid.css';

const modules = [
  { icon: Building2, title: 'Company' },
  { icon: Users, title: 'Customer' },
  { icon: Briefcase, title: 'Vendor' },
  { icon: Truck, title: 'Shipment' },
  { icon: FileText, title: 'Quotation' },
  { icon: Receipt, title: 'Invoice' },
  { icon: Landmark, title: 'Finance' },
  { icon: Warehouse, title: 'Warehouse' },
  { icon: BarChart3, title: 'Reports' },
  { icon: Settings, title: 'Masters' },
  { icon: PieChart, title: 'Analytics' },
  { icon: ShieldCheck, title: 'Roles' },
];

const ModulesGrid = () => {
  return (
    <section id="modules" className="lp-modules-grid landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">A Module For Every Process</h2>
        <p className="landing-section-subtitle">
          Activate the modules you need today. Scale easily as your operations grow.
        </p>
      </div>

      <div className="lp-mgrid-container">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div 
              key={index} 
              className="lp-mgrid-item"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <div className="lp-mgrid-icon">
                <Icon size={28} />
              </div>
              <h4>{mod.title}</h4>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ModulesGrid;
