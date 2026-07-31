import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Key, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgVideo from '../../../../assets/landing-page-bg-video.mp4';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="lp-hero">
      <div className="lp-hero-bg">
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="lp-hero-video"
        />
        <div className="lp-hero-overlay"></div>
      </div>

      <div className="lp-hero-content landing-section">
        <div className="lp-hero-text-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lp-hero-pretitle"
          >
            <span className="dot"></span> FREIGHTFLOW'S PREMIER LOGISTICS PLATFORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lp-hero-title-main"
          >
            GLOBAL FREIGHT<br />
            <span className="text-red">DELIVERED.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lp-hero-subtitle-main"
          >
            <strong>FreightFlow ERP</strong> — Your trusted partner for Custom Clearing, Freight Forwarding, and end-to-end logistics across <strong>150+ countries</strong> worldwide.
          </motion.p>

          <motion.div
            className="lp-hero-actions-main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <button className="lp-btn-primary btn-large btn-flex">
              <Plane size={20} className="mr-2" />
              Request a Quote
            </button>
            <button 
              className="lp-btn-outline-transparent btn-large btn-flex"
              onClick={() => navigate('/login')}
            >
              <Key size={20} className="mr-2 text-yellow" />
              ERP Portal
            </button>
            <button className="lp-btn-outline-transparent btn-large btn-flex">
              <Play size={20} className="mr-2" />
              Our Services
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
