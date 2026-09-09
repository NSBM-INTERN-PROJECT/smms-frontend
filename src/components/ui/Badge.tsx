import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'danger';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  style,
  ...props
}) => {
  return (
    <span className={cn('badge', `badge-${variant}`, className)} style={style} {...props}>
      {children}
    </span>
  );
};
