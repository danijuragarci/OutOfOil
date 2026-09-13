import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div
      id="app-floating-toast"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] bg-[#2f3034] text-[#f1f0f5] px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <span
        className={`material-symbols-outlined text-[19px] ${
          type === 'success'
            ? 'text-[#53e16f]'
            : type === 'warning'
            ? 'text-[#fe9400]'
            : 'text-[#adc6ff]'
        }`}
      >
        {type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info'}
      </span>
      <span className="text-[13px] font-medium leading-snug tracking-tight text-white">
        {message}
      </span>
    </div>
  );
};
