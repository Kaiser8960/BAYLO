import React from 'react';

const BayloLogo = ({ className = "", size = "default" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-8 h-8", 
    medium: "w-10 h-10",
    large: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <img 
      src="/BayloLogo.svg" 
      alt="Baylo Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default BayloLogo;