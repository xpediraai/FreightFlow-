import React from 'react';
import clsx from 'clsx';
import './Page.css';

const Page = ({ children, className }) => {
  return (
    <div className={clsx('page-container', className)}>
      {children}
    </div>
  );
};

export default Page;
