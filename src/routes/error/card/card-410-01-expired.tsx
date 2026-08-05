import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CalendarX, Info, Zap, ArrowUpRight, Home, ShieldAlert, History } from 'lucide-react';
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';
import styles from './card-410-01-expired.module.css';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/card/card-410-01-expired')({
  component: Card41001,
});

function Card41001() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);

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

  const createNewCard = () => {
    addToast('Create New Card', 'CARD-410-01 logged', 'red');
  };

  const viewExpiredList = () => {
    addToast('View Expired List', 'Opening', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <CalendarX size={20} />
        </div>
      }
      rightAction={
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[10px]">CARD-410-01</span>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Info size={16} />
            Why?
          </button>
        </div>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Line */}
        <div className="h-[5px] bg-gradient-to-r from-[#EF4444] to-[#F87171]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-3.5 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[44px] text-[#EF4444] relative">
            <div className="absolute inset-0 rounded-[28px] border border-[#FECACA] animate-pulse"></div>
            <CalendarX size={48} className="animate-shake" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            <ShieldAlert size={14} />
            Cards • Expired • 12/25
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[22px] font-bold mb-2">
            Card Expired
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Virtual card expired Dec 2025 — cannot fund. Create new card or renew.
          </div>

          {/* Reason */}
          <div className="bg-[#FEF2F2] border border-[#FECACA] border-l-4 border-l-[#EF4444] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <ShieldAlert size={24} className="text-[#EF4444]" />
            <div>
              <span className="font-bold text-[13px] block">Why blocked?</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-1 block">
                Card •••• 4242 expired 2025-12-31, today 2026-08-05 — 8 months expired. Auto archived.
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Card</span>
              <span className="text-[12px] text-[#4B5563]">•••• 4242</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Expired</span>
              <span className="text-[12px] text-[#4B5563]">2025-12-31</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Today</span>
              <span className="text-[12px] text-[#4B5563]">2026-08-05</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Action</span>
              <span className="text-[12px] text-[#4B5563]">Create new virtual</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]">
              <ShieldAlert size={12} className="inline mr-1" />
              Zero-liability • Safe
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[11px]">
              <History size={12} className="inline mr-1" />
              After 2-4s • Failed
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={createNewCard}
            className="bg-[#EF4444] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Zap size={18} />
            Create New Card
          </button>
          <button
            onClick={viewExpiredList}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <ArrowUpRight size={18} />
            View Expired List
          </button>
          <Link
            to="/"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2 no-underline"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Card Expired"
        subtitle="Error — after fail"
        icon={<CalendarX size={24} />}
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-[#EF4444] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Got it
          </button>
        }
      >
        <p className="mb-2">
          Error after send — vault safe, retry safe, trace ID
        </p>
        <div className="p-3 rounded-2xl bg-[#FFFCF5] border border-[#E8E2D9]">
          <span className="font-bold text-[12px]">Trace:</span>{' '}
          <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded text-[11px]">card-410-01_xxx_KE</code> • Funds safe • No double charge
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 85%, 100% { transform: rotate(0); }
          88% { transform: rotate(-8deg); }
          90% { transform: rotate(8deg); }
        }
        @keyframes pulse {
          70% { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </ErrorLayout>
  );
}
