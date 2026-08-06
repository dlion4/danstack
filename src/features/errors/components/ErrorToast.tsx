import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

interface ErrorToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const typeStyles = {
  emerald: {
    borderLeftColor: '#10b981',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    icon: 'check',
  },
  red: {
    borderLeftColor: '#EF4444',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
    icon: 'exclamation',
  },
  amber: {
    borderLeftColor: '#F59E0B',
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
    icon: 'exclamation',
  },
  info: {
    borderLeftColor: '#0EA5E9',
    iconBg: '#F0F9FF',
    iconColor: '#0EA5E9',
    icon: 'info',
  },
  gray: {
    borderLeftColor: '#6B7280',
    iconBg: '#F3F4F6',
    iconColor: '#6B7280',
    icon: 'info',
  },
};

const icons = {
  check: '✓',
  exclamation: '!',
  info: 'i',
};

export function ErrorToast({ toasts, onRemove }: ErrorToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type || 'emerald'];
        return (
          <div
            key={toast.id}
            className="bg-white border border-[#E8E2D9] rounded-xl p-3 shadow-lg min-w-[300px] max-w-[360px] pointer-events-auto animate-slideIn flex gap-2.5"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: style.borderLeftColor,
              animation: 'slideIn 0.35s ease',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: style.iconBg,
                color: style.iconColor,
              }}
            >
              <span className="font-bold text-sm">{icons[style.icon]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px]">{toast.title}</div>
              <div className="text-[12px] text-[#4B5563]">{toast.message}</div>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="w-7 h-7 rounded-lg border border-[#E8E2D9] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <i className="bi bi-x-lg text-gray-500"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}
