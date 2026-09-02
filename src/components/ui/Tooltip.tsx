import React, { useState } from 'react';

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`tooltip-box tooltip-${position}`}>
          {text}
        </div>
      )}
    </div>
  );
};
