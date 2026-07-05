import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Anchor, Navigation, DollarSign } from 'lucide-react';
import './PlatformPreview.css';

const PlatformPreview = () => {
  return (
    <section className="lp-platform-preview landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">See The Big Picture</h2>
        <p className="landing-section-subtitle">
          Command your entire global operation from a single, intuitive dashboard designed for speed and clarity.
        </p>
      </div>

      <div className="lp-preview-container">
        {/* Laptop Mockup */}
        <motion.div 
          className="lp-laptop"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="lp-laptop-screen">
            <div className="lp-laptop-content">
              {/* Fake Dashboard UI */}
              <div className="fake-sidebar"></div>
              <div className="fake-main">
                <div className="fake-header"></div>
                <div className="fake-widgets">
                  <div className="fake-widget w-full h-100"></div>
                  <div className="fake-widget w-half h-150"></div>
                  <div className="fake-widget w-half h-150"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-laptop-base">
            <div className="lp-laptop-notch"></div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          className="lp-float-ui ui-revenue"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          animate={{ y: [0, -10, 0] }}
        >
          <div className="icon-box bg-green"><DollarSign size={20} /></div>
          <div>
            <h5>$2.4M</h5>
            <span>Revenue</span>
          </div>
        </motion.div>

        <motion.div 
          className="lp-float-ui ui-tracking"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          animate={{ y: [0, 15, 0] }}
        >
          <div className="icon-box bg-blue"><Navigation size={20} /></div>
          <div>
            <h5>Live</h5>
            <span>Vessel Tracking</span>
          </div>
        </motion.div>

        <motion.div 
          className="lp-float-ui ui-shipment"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          animate={{ y: [0, -8, 0] }}
        >
          <div className="icon-box bg-red"><Anchor size={20} /></div>
          <div>
            <h5>143</h5>
            <span>Active Shipments</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PlatformPreview;
