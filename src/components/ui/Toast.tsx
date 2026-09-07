import React from 'react';
import type { ToastMessage } from './ToastProvider';

export interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};
