import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import { 
  AlertTriangle, // Replaced ExclamationDiamond
  Info,          // Replaced InfoCircle
  Zap,           // Replaced Lightning
  ArrowUpRight,  // Kept (Valid Lucide Icon)
  Home,          // Replaced House
  ShieldCheck,   // Kept (Valid Lucide Icon)
  History        // Replaced ClockHistory
} from 'lucide-react';

import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';
import styles from './card-400-02-program-limit-high.module.css';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/card/card-400-02-program-limit-high')({
  component: Card40002,
});

function Card40002() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const addToast = (title: string, message: string, type: Toast['type'] = 'amber') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setToMax = () => {
    addToast('Set to $10k Max', 'CARD-400-02 logged', 'amber');
  };

  const requestIncrease = () => {
    addToast('Request Limit Increase', 'Opening', 'emerald');
  };

  const handleConfirm = () => {
    if (confirmed) {
      addToast('Confirmed', 'Proceed', 'emerald');
    }
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-lg">
          <AlertTriangle size={20} />
        </div>
      }
      rightAction={
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[10px]">CARD-400-02</span>
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
        <div className="h-[5px] bg-gradient-to-r from-[#F59E0B] to-[#D97706]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-3.5 rounded-[28px] bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[44px] text-[#F59E0B] relative">
            <div className="absolute inset-0 rounded-[28px] border border-[#FDE68A] animate-pulse"></div>
            <AlertTriangle size={48} className="animate-float" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold text-[11px] uppercase tracking-wider mb-3">
            <Zap size={14} />
            Cards • Program Limit • Too High
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[22px] font-bold mb-2">
            Card Program Limit — Single Card Limit Too High
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Trying to set $50k but max $10k per program policy — reduce limit before create.
          </div>

          {/* Reason */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] border-l-4 border-l-[#F59E0B] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <span className="text-[#F59E0B] text-xl">⚠️</span>
            <div>
              <span className="font-bold text-[13px] block">Heads up — warning before action</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-1 block">
                Program limit single card max $10k, you tried $50k. Policy to limit fraud. Need program admin to increase.
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Attempted</span>
              <span className="text-[12px] text-[#4B5563]">$50,000</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Program Max</span>
              <span className="text-[12px] text-[#4B5563]">$10,000</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Program</span>
              <span className="text-[12px] text-[#4B5563]">Prog_001</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Action</span>
              <span className="text-[12px] text-[#4B5563]">Reduce or request increase</span>
            </div>
          </div>

          {/* Permission */}
          <div className="mt-4 bg-white border border-dashed border-[#E8E2D9] rounded-xl p-3 flex gap-2.5 items-start text-left">
            <input
              type="checkbox"
              id="confirmCheck"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (e.target.checked) {
                  addToast('Confirmed', 'Proceed', 'emerald');
                }
              }}
              className="mt-1"
            />
            <div>
              <span className="font-bold text-[13px] block">I confirm — details correct, want to proceed</span>
              <span className="text-[11px] text-[#4B5563] mt-1 block">
                No funds moved until Confirm. Cancel safe.
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]">
              <ShieldCheck size={12} className="inline mr-1" />
              Can proceed with confirm
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[11px]">
              <History size={12} className="inline mr-1" />
              Before action • Warning gate
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={setToMax}
            className="bg-[#F59E0B] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Zap size={18} />
            Set to $10k Max
          </button>
          <button
            onClick={requestIncrease}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <ArrowUpRight size={18} />
            Request Limit Increase
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
        title="Card Program Limit — Single Card Limit Too High"
        subtitle="Warning — before send"
        icon={<AlertTriangle size={24} />}
        iconBg="#FFFBEB"
        iconColor="#F59E0B"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-[#F59E0B] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Got it
          </button>
        }
      >
        <p className="mb-2">
          Warning before action — checkbox gate
        </p>
        <div className="p-3 rounded-2xl bg-[#FFFCF5] border border-[#E8E2D9]">
          <span className="font-bold text-[12px]">Trace:</span>{' '}
          <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded text-[11px]">card-400-02_xxx_KE</code> • Funds safe • No double charge
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          70% { box-shadow: 0 0 0 18px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </ErrorLayout>
  );
}
