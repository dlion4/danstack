import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CreditCard, Wallet2, Rocket, Receipt, MessageCircle, Book } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-402')({
  component: Error402,
});

function Error402() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'emerald') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const upgrade = () => {
    addToast('Checkout opening', 'Securing your upgrade...', 'emerald');
    setTimeout(() => {
      window.location.href = '/billing/upgrade';
    }, 800);
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
          <CreditCard size={20} />
        </div>
      }
      rightAction={
        <Link
          to="/billing"
          className="hidden sm:flex px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all"
        >
          Billing
        </Link>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Accent */}
        <div className="h-[5px] bg-gradient-to-r from-[#10b981] via-[#34D399] to-[#F59E0B]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[42px] text-[#F59E0B] relative">
            <span className="relative">
              <span className="absolute inset-0 rounded-[34px] border-2 border-dashed border-[#FDE68A] animate-spin" style={{ animationDuration: '16s' }}></span>
              <Wallet2 size={48} />
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px] uppercase tracking-wider mb-3">
            ⭐ 402 • Premium Locked
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Upgrade to keep building
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            You've hit a premium vault. Settle pending invoice or upgrade plan — your data is safe in cream vault.
          </div>

          {/* Usage Meter */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3.5 mt-5">
            <div className="flex justify-between text-[12px] font-bold mb-2">
              <span>API Calls • Monthly</span>
              <span className="text-[#059669]">92% used</span>
            </div>
            <div className="h-2.5 bg-white border border-[#E8E2D9] rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#F59E0B] rounded-full animate-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-2.5">
                <span className="font-bold text-[12px] block">KES 1,240 due</span>
                <span className="text-[11px] text-[#4B5563]">Invoice #INV-8821 • Due today</span>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-2.5">
                <span className="font-bold text-[12px] block">Pro plan — KES 4,900/mo</span>
                <span className="text-[11px] text-[#4B5563]">Unlimited virtual cards + M-Pesa rails</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 flex gap-2.5 items-start text-left mt-3.5">
            <span className="text-[#F59E0B] text-xl">ℹ️</span>
            <div>
              <span className="font-bold text-[13px] block">Why payment required?</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed">
                Your free tier includes 500 transfers/mo. You used 462. This feature (Virtual Cards API) needs Pro.
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🛡️ No data lost
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
              ⚡ Unlock in 30 sec
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={upgrade}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Rocket size={18} />
            Upgrade to Pro
          </button>
          <Link
            to="/billing/invoices"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Receipt size={16} />
            Pay Invoice
          </Link>
          <button
            onClick={() => addToast('Talk to sales scheduled', 'We will email you in 5 min', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Sales
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes grow {
          from { width: 0; }
          to { width: 92%; }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-spin { animation: spin 16s linear infinite; }
        .animate-grow { animation: grow 1.2s ease forwards; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #D1FAE5;
        --theme-bg-gradient-2: #FDE68A;
      }
    `}</style>
</ErrorLayout>
  );
}
