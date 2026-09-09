import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 16 : size === 'lg' ? 40 : 24;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      style={{ color: 'var(--accent-cyan)', animation: 'spin 0.8s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
