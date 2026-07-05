import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "VP Operations",
    company: "Global Freight Systems",
    content: "FreightFlow ERP transformed our operational chaos into a streamlined global machine. We cut our quotation time by 80% in the first month.",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    name: "Marcus Wei",
    role: "CEO",
    company: "Pacific Logistics Ltd",
    content: "The real-time visibility and single unified dashboard has given us a competitive edge. It's the most premium software we've ever deployed.",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    name: "Elena Rostova",
    role: "Supply Chain Director",
    company: "EuroTrans Solutions",
    content: "From customs documentation to last-mile tracking, it's flawlessly integrated. FreightFlow isn't just an ERP; it's our core operating system.",
    image: "https://i.pravatar.cc/150?img=32"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="lp-testimonials landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">What Industry Leaders Say</h2>
        <p className="landing-section-subtitle">
          Don't just take our word for it. See why the top 1% of global forwarders run on FreightFlow.
        </p>
      </div>

      <div className="lp-test-container">
        {testimonials.map((test, index) => (
          <motion.div 
            key={index} 
            className="lp-test-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            <div className="lp-test-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="var(--lp-primary)" color="var(--lp-primary)" />
              ))}
            </div>
            <p className="lp-test-content">"{test.content}"</p>
            <div className="lp-test-author">
              <img src={test.image} alt={test.name} className="lp-test-img" />
              <div className="lp-test-info">
                <h4>{test.name}</h4>
                <span>{test.role}, {test.company}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
