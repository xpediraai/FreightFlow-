import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Statistics.css';

const CountUp = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
        
        if (progress < 1) {
          setCount(Math.floor(end * progress));
          requestAnimationFrame(animateCount);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [end, duration, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const stats = [
  { value: 35, suffix: '+', label: 'Main Warehouses' },
  { value: 853, suffix: '+', label: 'Goods Delivered' },
  { value: 55, suffix: '+', label: 'Countries Covered' },
  { value: 40, suffix: '+', label: 'Total Services' },
];

const Statistics = () => {
  return (
    <section className="lp-statistics">
      <div className="lp-statistics-container">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            className="lp-stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <h3 className="lp-stat-value">
              <CountUp end={stat.value} suffix={stat.suffix} />
            </h3>
            <p className="lp-stat-label">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Statistics;
