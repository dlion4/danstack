import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Keyboard, Info, Zap, ArrowUpRight, Home, ShieldAlert, History } from 'lucide-react';
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';
import styles from './card-401-02-pin-3x-blocked.module.css';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/card/card-401-02-pin-3x-blocked')({
  component: Card40102,
});

function Card40102() {
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

  const unblockOTP = () => {
    addToast('Unblock Card via OTP', 'CARD-401-02 logged', 'red');
  };

  const resetPIN = () => {
    addToast('Reset PIN', 'Opening', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <Keyboard size={20} />
        </div>
      }
      rightAction={
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[10px]">CARD-401-02</span>
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
      <div className={`${styles.cardx} bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise`}>
        {/* Top Line */}
        <div className={`${styles.topLine} h-[5px] bg-gradient-to-r from-[#EF4444] to-[#F87171]`}></div>

        {/* Card Head */}
        <div className={`${styles.head} p-6.5 sm:p-7 text-center`}>
          {/* Icon */}
          <div className={`${styles.icon} w-24 h-24 mx-auto mb-3.5 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[44px] text-[#EF4444] relative`}>
            <div className="absolute inset-0 rounded-[28px] border border-[#FECACA] animate-pulse"></div>
            <div className={styles.iconInner}>
              <Keyboard size={48} className="animate-shake" />
            </div>
          </div>

          {/* Badge */}
          <div className={`${styles.badgeMain} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3`}>
            <ShieldAlert size={14} />
            Cards • PIN 3x • Blocked
          </div>

          {/* Title */}
          <div className={`${styles.title} font-['Space_Grotesk'] text-[22px] font-bold mb-2`}>
            Physical Card PIN Attempts Exceeded — Blocked
          </div>

          {/* Subtitle */}
          <div className={`${styles.sub} text-[14px] text-[#4B5563] leading-relaxed`}>
            ATM PIN 3x wrong — card blocked needs reset via app. Physical card locked.
          </div>

          {/* Reason */}
          <div className={`${styles.reason} bg-[#FEF2F2] border border-[#FECACA] border-l-4 border-l-[#EF4444] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4`}>
            <div className={styles.reasonIcon}>
              <ShieldAlert size={24} className="text-[#EF4444]" />
            </div>
            <div>
              <span className={`${styles.reasonTitle} font-bold text-[13px] block`}>Why blocked?</span>
              <span className={`${styles.reasonText} text-[12px] text-[#4B5563] leading-relaxed mt-1 block`}>
                ATM PIN attempts 0000, 1111, 0000 — all wrong at NCBA ATM Ruiru. Card blocked per Visa rules, needs app unblock.
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className={`${styles.grid} grid grid-cols-2 gap-2.5 mt-4 text-left`}>
            <div className={`${styles.box} bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3`}>
              <span className={`${styles.boxLabel} font-bold text-[11px] uppercase tracking-wider block`}>Card</span>
              <span className={`${styles.boxValue} text-[12px] text-[#4B5563]`}>•••• 4242 • Physical</span>
            </div>
            <div className={`${styles.box} bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3`}>
              <span className={`${styles.boxLabel} font-bold text-[11px] uppercase tracking-wider block`}>ATM</span>
              <span className={`${styles.boxValue} text-[12px] text-[#4B5563]`}>NCBA Ruiru</span>
            </div>
            <div className={`${styles.box} bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3`}>
              <span className={`${styles.boxLabel} font-bold text-[11px] uppercase tracking-wider block`}>Attempts</span>
              <span className={`${styles.boxValue} text-[12px] text-[#4B5563]`}>3/3 failed</span>
            </div>
            <div className={`${styles.box} bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3`}>
              <span className={`${styles.boxLabel} font-bold text-[11px] uppercase tracking-wider block`}>Unblock</span>
              <span className={`${styles.boxValue} text-[12px] text-[#4B5563]`}>Via app + OTP</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            <span className={`${styles.statusPill} ${styles.statusPillSafe} px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]`}>
              <ShieldAlert size={12} className="inline mr-1" />
              Zero-liability • Safe
            </span>
            <span className={`${styles.statusPill} ${styles.statusPillTiming} px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[11px]`}>
              <History size={12} className="inline mr-1" />
              After 2-4s • Failed
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={`${styles.actions} p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center`}>
          <button
            onClick={unblockOTP}
            className={`${styles.btnCol} bg-[#EF4444] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all`}
          >
            <Zap size={18} />
            Unblock Card via OTP
          </button>
          <button
            onClick={resetPIN}
            className={`${styles.btnEm} bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all`}
          >
            <ArrowUpRight size={18} />
            Reset PIN
          </button>
          <Link
            to="/"
            className={`${styles.btnGhost} px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2 no-underline`}
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
        title="Physical Card PIN Attempts Exceeded — Blocked"
        subtitle="Error — after fail"
        icon={<Keyboard size={24} />}
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
          <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded text-[11px]">card-401-02_xxx_KE</code> • Funds safe • No double charge
        </div>
      </ErrorModal>
    </ErrorLayout>
  );
}
