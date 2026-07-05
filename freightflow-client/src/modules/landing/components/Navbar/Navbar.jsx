import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate('/app');
  };

  return (
    <motion.nav 
      className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="lp-navbar-container">
        <div className="lp-navbar-logo">
          <span className="logo-text">FreightFlow</span>
        </div>
        
        <div className="lp-navbar-menu d-none md:flex">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#modules">Modules</a>
          <a href="#testimonials">Testimonials</a>
        </div>

        <div className="lp-navbar-actions d-none md:flex">
          <button className="lp-btn-ghost" onClick={handleLoginClick}>ERP Login</button>
          <button className="lp-btn-primary">Request Demo</button>
        </div>

        <button 
          className="lp-mobile-menu-btn d-md-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="lp-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)}>Workflow</a>
            <a href="#modules" onClick={() => setIsMobileMenuOpen(false)}>Modules</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            <div className="lp-mobile-actions">
              <button className="lp-btn-outline" onClick={handleLoginClick}>ERP Login</button>
              <button className="lp-btn-primary">Request Demo</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
