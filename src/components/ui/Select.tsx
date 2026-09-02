import React, { SelectHTMLAttributes } from 'react';

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, error, ...props }) => {
  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <select className={`custom-select ${error ? 'select-error' : ''}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
};
