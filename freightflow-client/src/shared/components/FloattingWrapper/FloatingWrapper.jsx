import React from 'react';
import clsx from 'clsx';
import './FloatingWrapper.css';

const FloatingWrapper = ({
    children,
    className,
    padding = 'lg',      // 'sm' | 'md' | 'lg' | 'xl' | 'none'
    radius = 'xl',       // 'md' | 'lg' | 'xl' | '2xl'
    shadow = 'lg',       // 'sm' | 'md' | 'lg'
    ...props
}) => {
    return (
        <div
            className={clsx(
                'floating-wrapper',
                `floating-wrapper--padding-${padding}`,
                `floating-wrapper--radius-${radius}`,
                `floating-wrapper--shadow-${shadow}`,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default FloatingWrapper;