import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import './Loader.css';

const Loader = ({ size = 24, className, fullScreen = false }) => {
  const loaderIcon = <Loader2 className={clsx('loader-icon animate-spin', className)} size={size} />;
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loaderIcon}
      </div>
    );
  }
  
  return loaderIcon;
};

export default Loader;
