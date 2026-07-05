import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import './Button.css';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  type = 'button',
  ...props
}, ref) => {
  const disabled = isLoading || isDisabled;
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'btn-loading': isLoading },
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="btn-spinner animate-spin" size={16} />}
      {!isLoading && LeftIcon && <LeftIcon className="btn-icon-left" size={18} />}
      <span className="btn-content">{children}</span>
      {!isLoading && RightIcon && <RightIcon className="btn-icon-right" size={18} />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
