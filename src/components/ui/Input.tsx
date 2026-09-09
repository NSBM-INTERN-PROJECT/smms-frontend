import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={cn("input-wrapper", className)}>
      {label && <label htmlFor={generatedId} className="input-label">{label}</label>}
      <input
        id={generatedId}
        className={cn("input-field", error && "error")}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};
