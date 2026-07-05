import React from 'react';
import clsx from 'clsx';
import './Badge.css';

const Badge = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <span
      className={clsx('badge', `badge-${variant}`, className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
