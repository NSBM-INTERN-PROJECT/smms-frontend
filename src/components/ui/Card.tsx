import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className, style, ...props }) => {
  return (
    <div className={cn('card', className)} style={style} {...props}>
      {children}
    </div>
  );
};
