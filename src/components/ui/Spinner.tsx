import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-pulse-glow", className)}
      style={{ color: 'var(--accent-cyan)' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          svg {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </svg>
  );
};
