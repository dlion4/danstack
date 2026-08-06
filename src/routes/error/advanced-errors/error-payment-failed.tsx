import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { XCircle, Info, CreditCard, Phone, Landmark, Network, ShieldCheck, Zap } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-payment-failed')({
  component: ErrorPaymentFailed,
});

function ErrorPaymentFailed() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'red') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const tryMpesa = () => {
    addToast('Switched to M-Pesa', 'Opening STK push...', 'emerald');
  };

  const tryAnotherCard = () => {
    addToast('Try another card', 'Choose saved card', 'emerald');
  };

  const bankTransfer = () => {
    addToast('Bank transfer selected', 'KES bank rails — 30s', 'emerald');
  };

  const splitPayment = () => {
    addToast('Split payment enabled', 'Split KES 45k into 2?', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <XCircle size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => addToast('Checking bank', 'We query issuer for more detail', 'emerald')}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Bank reply
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Accent */}
        <div className="h-[5px] bg-gradient-to-r from-[#EF4444] to-[#F87171]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-[88px] h-[88px] mx-auto mb-4 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[44px] text-[#EF4444] relative">
            <div className="absolute inset-[-6px] rounded-full border-[1.5px] border-dashed border-[#FECACA] animate-spin" style={{ animationDuration: '12s' }}></div>
            <XCircle size={42} />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            <CreditCard size={14} />
            Payment Declined
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Card declined — insufficient funds
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Bank said not enough funds for <b>KES 45,000</b>. No money moved. Try different card or M-Pesa — same idempotency safe.
          </div>

          {/* Detail */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3.5 mt-4 text-left">
            <div className="flex justify-between text-[13px] py-1.5 border-b border-dashed border-[#E8E2D9]">
              <span className="text-[#4B5563]">Amount</span>
              <span className="font-bold">KES 45,000.00</span>
            </div>
            <div className="flex justify-between text-[13px] py-1.5 border-b border-dashed border-[#E8E2D9]">
              <span className="text-[#4B5563]">Card</span>
              <span className="font-bold flex items-center gap-1">
                <CreditCard size={12} />
                •• 4242 • Visa • Exp 12/27
              </span>
            </div>
            <div className="flex justify-between text-[13px] py-1.5 border-b border-dashed border-[#E8E2D9]">
              <span className="text-[#4B5563]">Bank response</span>
              <span className="font-bold text-[#EF4444]">51 - Insufficient funds</span>
            </div>
            <div className="flex justify-between text-[13px] py-1.5 items-center">
              <span className="text-[#4B5563]">Trace</span>
              <span className="flex items-center gap-2">
                <code className="bg-white border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px]">decl_99x1_KE</code>
                <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[10px]">
                  No charge
                </span>
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-3">
            <Info size={20} className="text-[#EF4444]" />
            <div>
              <span className="font-bold text-[13px] block">Reason in plain English</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-1">
                Your bank reported balance lower than KES 45,000 + fees. Top up or use M-Pesa / another card. We didn't hold funds.
              </span>
            </div>
          </div>

          {/* Alternatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={tryMpesa}
              className="border border-[#E8E2D9] rounded-xl p-2.5 bg-white transition-all cursor-pointer text-left hover:border-[#10b981] hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="font-bold text-[12px] block flex items-center gap-1">
                <Phone size={14} className="text-[#10b981]" />
                Try M-Pesa
              </span>
              <span className="text-[11px] text-[#4B5563]">STK push to 07xx • Instant • No card needed</span>
            </button>
            <button
              onClick={tryAnotherCard}
              className="border border-[#E8E2D9] rounded-xl p-2.5 bg-white transition-all cursor-pointer text-left hover:border-[#10b981] hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="font-bold text-[12px] block flex items-center gap-1">
                <CreditCard size={14} className="text-blue-500" />
                Another card
              </span>
              <span className="text-[11px] text-[#4B5563]">Use •• 8888 or add new</span>
            </button>
            <button
              onClick={bankTransfer}
              className="border border-[#E8E2D9] rounded-xl p-2.5 bg-white transition-all cursor-pointer text-left hover:border-[#10b981] hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="font-bold text-[12px] block flex items-center gap-1">
                <Landmark size={14} className="text-[#F59E0B]" />
                Bank transfer
              </span>
              <span className="text-[11px] text-[#4B5563]">Equity / KCB • Low fees • KES native</span>
            </button>
            <button
              onClick={splitPayment}
              className="border border-[#E8E2D9] rounded-xl p-2.5 bg-white transition-all cursor-pointer text-left hover:border-[#10b981] hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="font-bold text-[12px] block flex items-center gap-1">
                <Network size={14} className="text-cyan-500" />
                Split it
              </span>
              <span className="text-[11px] text-[#4B5563]">Pay KES 22.5k ×2 • Avoid decline</span>
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              <ShieldCheck size={12} className="inline mr-1" />
              Idempotent safe
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              <Zap size={12} className="inline mr-1" />
              Fix in 20s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={tryAnotherCard}
            className="bg-[#1A1F2E] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] flex items-center gap-2 hover:bg-[#111827] hover:-translate-y-0.5 transition-all"
          >
            <CreditCard size={18} />
            Try Different Card
          </button>
          <button
            onClick={tryMpesa}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Phone size={18} />
            Pay via M-Pesa
          </button>
          <Link
            to="/dashboard"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all no-underline"
          >
            Cancel
          </Link>
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
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-spin { animation: spin 12s linear infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #FEE2E2;
        --theme-bg-gradient-2: #D1FAE5;
      }
    `}</style>
</ErrorLayout>
  );
}
