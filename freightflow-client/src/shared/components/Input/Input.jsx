import React from 'react';
import clsx from 'clsx';
import './Input.css';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  required,
  className,
  prefix: Prefix,
  suffix: Suffix,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();
  
  return (
    <div className={clsx('form-group', className)}>
      {label && (
        <label htmlFor={inputId} className={clsx('form-label', { 'required': required })}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Prefix && <div className="input-prefix"><Prefix size={18} /></div>}
        <input
          id={inputId}
          ref={ref}
          className={clsx('form-control', 'input-control', { 
            'is-invalid': error,
            'has-prefix': !!Prefix,
            'has-suffix': !!Suffix
          })}
          {...props}
        />
        {Suffix && <div className="input-suffix"><Suffix size={18} /></div>}
      </div>
      {error ? (
        <span className="form-error">{error}</span>
      ) : helperText ? (
        <span className="form-helper">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
