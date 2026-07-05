import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: "How long does it take to deploy FreightFlow ERP?",
    answer: "Our cloud-native architecture allows for rapid deployment. Standard configurations can be live within 2-4 weeks, while custom enterprise implementations typically take 8-12 weeks."
  },
  {
    question: "Does FreightFlow integrate with our existing accounting software?",
    answer: "Yes, FreightFlow provides seamless, pre-built integrations with major accounting systems like QuickBooks, Xero, Sage, and SAP, along with a robust open API for custom connections."
  },
  {
    question: "Is my data secure in the cloud?",
    answer: "Security is our top priority. FreightFlow is SOC 2 Type II compliant, utilizing bank-grade AES-256 encryption, multi-factor authentication, and automated daily backups across redundant data centers."
  },
  {
    question: "Can we customize the workflow for our specific operational needs?",
    answer: "Absolutely. Our platform is built on a modular architecture, allowing you to customize workflows, data fields, documents, and roles to match your exact operational requirements."
  },
  {
    question: "How is pricing structured?",
    answer: "Pricing is based on active user licenses and the modules you select. We offer transparent, predictable annual billing with no hidden fees for transactions or standard support."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="lp-faq landing-section">
      <div className="text-center mb-xl">
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-subtitle">
          Everything you need to know about migrating to FreightFlow.
        </p>
      </div>

      <div className="lp-faq-container">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`lp-faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <button 
              className="lp-faq-question"
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <span>{faq.question}</span>
              <motion.div
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} className="lp-faq-icon" />
              </motion.div>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lp-faq-answer-wrapper"
                >
                  <div className="lp-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
