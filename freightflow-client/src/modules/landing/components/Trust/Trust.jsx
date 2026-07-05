import React from 'react';
import { motion } from 'framer-motion';
import './Trust.css';

const Trust = () => {
  const logos = ['Maersk', 'DHL', 'FedEx', 'Kuehne+Nagel', 'DSV', 'DB Schenker', 'C.H. Robinson'];
  
  return (
    <section className="lp-trust">
      <div className="lp-trust-container">
        <p className="lp-trust-label">Trusted by Global Freight Forwarders Worldwide</p>
        <div className="lp-trust-logos">
          <div className="lp-trust-track">
            {/* Double the logos to create seamless loop effect */}
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="lp-trust-logo-item">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
