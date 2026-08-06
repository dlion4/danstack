import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertOctagon, Layers2, Receipt, PlusCircle, Flag, Copy, ShieldCheck } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-409')({
  component: Error409,
});

function Error409() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [txnId, setTxnId] = useState('txn_882199200xAL');

  const addToast = (title: string, message: string, type: Toast['type'] = 'red') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyTxn = () => {
    navigator.clipboard.writeText(txnId);
    addToast('Txn ID copied', 'Share with support', 'emerald');
  };

  const newKey = () => {
    const newKey = 'idem_' + Math.random().toString(36).slice(2, 9);
    addToast('New key generated: ' + newKey, 'Use this for new payment', 'emerald');
  };

  const showInfo = () => {
    addToast('Idempotency = safety', 'Same key twice = Paymo blocks duplicate. Use new key for new charge.', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <AlertOctagon size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={showInfo}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          ℹ️ What is this?
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[42px] text-[#EF4444] relative animate-shake">
            <Layers2 size={48} />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            📋 409 • Duplicate Blocked
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Already processed — we blocked double charge
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Same <code className="bg-gray-100 px-1.5 py-0.5 rounded">idempotency_key</code> used twice. Paymo stopped duplicate to protect your customer. This is <b>good</b> — safety working.
          </div>

          {/* Idempotency Box */}
          <div className="bg-[#FFFBFB] border border-[#FECACA] rounded-xl p-3.5 mt-4 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[12px] uppercase tracking-wider">Idempotency protection active</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold">
                Duplicate
              </span>
            </div>
            <div className="text-[13px] text-[#4B5563] mb-2.5">
              You sent <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded">idem_KE_2024_9912</code> again. Original succeeded 42s ago.
            </div>
            <div className="font-mono bg-[#0F172A] text-[#E2E8F0] px-3 py-2.5 rounded-lg text-[13px] flex justify-between items-center">
              <span>{txnId}</span>
              <button
                onClick={copyTxn}
                className="px-2.5 py-1 rounded-lg border border-[#E8E2D9] bg-white font-semibold text-[11px] hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Copy size={12} />
                Copy ID
              </button>
            </div>
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-2.5 flex gap-2.5 items-center mt-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="font-bold text-[13px] block">Customer charged once only</span>
                <span className="text-[12px] text-[#4B5563]">KES 12,400 moved once. Second request rejected.</span>
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              ✓ No extra charge
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 Original: 42s ago
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <Link
            to="/transactions/txn_882199200xAL"
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all no-underline"
          >
            <Receipt size={18} />
            View Original Txn
          </Link>
          <button
            onClick={newKey}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Use new idempotency key
          </button>
          <button
            onClick={() => addToast('Logged', 'Our team noted this idempotency hit', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Flag size={16} />
            Report
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
        @keyframes shake {
          0%, 88%, 100% { transform: translateX(0); }
          90% { transform: translateX(-4px); }
          92% { transform: translateX(4px); }
          94% { transform: translateX(-2px); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 3s ease-in-out infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #FEF2F2;
        --theme-bg-gradient-2: #FFFBEB;
      }
    `}</style>
</ErrorLayout>
  );
}
