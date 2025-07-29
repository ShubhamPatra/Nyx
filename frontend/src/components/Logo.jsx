import React from 'react';
import clsx from 'clsx';
import './Logo.css';
import NyxLogo from './Nyx.svg';
const Logo = ({ 
  size,
  hideSubtitle = false,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'logo',
        {
          'logo--small': size === 'small',
          'logo--large': size === 'large',
        },
        className
      )}
      {...props}
    >
<div className="logo">
  <img 
    src={NyxLogo} 
    alt="Nyx Logo" 
    className="logo__icon" 
    aria-hidden="true" 
  />
  <div className="logo__content">
    <h1 className="logo__text">Nyx</h1>
    {!hideSubtitle && (
      <span className="logo__subtitle">
        The Midnight Between Minds
      </span>
    )}
  </div>
</div>
    </div>
  );
};

export default Logo;
