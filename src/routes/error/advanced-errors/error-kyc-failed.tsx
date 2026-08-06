import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BadgeCheck, Info, Upload, MessageCircle, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-kyc-failed')({
  component: ErrorKycFailed,
});

function ErrorKycFailed() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const uploadDocs = () => {
    addToast('Uploading docs', 'Scanning blur + tamper ...', 'amber');
    setTimeout(() => {
      addToast('Docs received', 'Human review 90 sec ETA', 'emerald');
    }, 1200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addToast(`Dropped ${e.dataTransfer.files.length} files`, 'Starting upload...', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BE123C] to-[#EF4444] flex items-center justify-center text-white shadow-lg">
          <BadgeCheck size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Why failed?
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[44px] text-[#EF4444] relative">
            <BadgeCheck size={48} className="animate-scan" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            <ShieldAlert size={14} />
            Verification Failed • KYC
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            We couldn't verify your ID
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Regulatory check failed. No worries — common fix: re-upload clearer docs. Your limits stay low until verified.
          </div>

          {/* Docs */}
          <div className="grid gap-2.5 mt-4 text-left">
            <div className="flex gap-3 items-center p-3 border border-[#E8E2D9] rounded-xl bg-[#FFFCF5]">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center text-[#EF4444]">
                <span className="text-lg">📷</span>
              </div>
              <div className="flex-1">
                <span className="font-bold text-[13px] block">National ID Front</span>
                <span className="text-[11px] text-[#4B5563]">Blurred • Cropped edges • Glare</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[10px]">
                <span className="mr-1">✗</span>Failed
              </span>
            </div>
            <div className="flex gap-3 items-center p-3 border border-[#E8E2D9] rounded-xl bg-[#FFFCF5]">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center text-[#F59E0B]">
                <span className="text-lg">🏠</span>
              </div>
              <div className="flex-1">
                <span className="font-bold text-[13px] block">Proof of Address</span>
                <span className="text-[11px] text-[#4B5563]">Address mismatch vs ID</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold text-[10px]">
                <span className="mr-1">⚠</span>Mismatch
              </span>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-[#FFFCF5] border border-dashed border-[#E8E2D9] rounded-xl p-3 text-left mt-3">
            <span className="font-bold text-[12px] uppercase tracking-wider block mb-2">
              <span className="mr-1">📋</span>Common issues — quick fix
            </span>
            <div className="flex gap-2 items-start text-[12px] text-[#4B5563] mb-1.5">
              <span className="text-[20px] leading-none">•</span>
              <span>Photo blurred or cropped — show all 4 corners, no flash, flat surface</span>
            </div>
            <div className="flex gap-2 items-start text-[12px] text-[#4B5563] mb-1.5">
              <span className="text-[20px] leading-none">•</span>
              <span>Address on bill ≠ ID address — use bill &lt; 3 months, same name</span>
            </div>
            <div className="flex gap-2 items-start text-[12px] text-[#4B5563]">
              <span className="text-[20px] leading-none">•</span>
              <span>Sanctions watchlist flag → manual review 2-4 hrs (we notify)</span>
            </div>
          </div>

          {/* Upload */}
          <div
            className={`mt-3.5 border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-[#059669] bg-[#A7F3D0] scale-[1.02]'
                : 'border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] hover:scale-[1.01]'
            }`}
            onClick={() => document.getElementById('fileInput')?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input type="file" id="fileInput" hidden accept="image/*,.pdf" multiple />
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <Upload size={20} />
            </div>
            <span className="font-bold text-[13px] block">Drop new ID + bill here</span>
            <span className="text-[11px] text-[#4B5563]">JPG, PNG or PDF • Max 8MB each • Clear, no crop</span>
            <div className="mt-2">
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E2D9] font-bold text-[11px]">
                <span className="mr-1">✨</span>Auto-check blur in 2s
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              <ShieldCheck size={12} className="inline mr-1" />
              Data encrypted • Auto-delete raw
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              <Clock size={12} className="inline mr-1" />
              Re-check 90 sec
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={uploadDocs}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Upload size={18} />
            Upload New Documents
          </button>
          <button
            onClick={() => addToast('Compliance team paged', 'Reply in &lt; 10 min via chat', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Contact Compliance
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Why KYC fails?"
        subtitle="Regulated"
        icon={<ShieldAlert size={24} />}
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Re-upload now
          </button>
        }
      >
        <p className="mb-2">
          Kenya CBK requires <b>liveness + address proof</b>. AI checks blur, glare, tamper. If fails 2x, human reviews (2-4 hrs).
        </p>
        <ul className="ps-3 mb-3 list-disc text-sm">
          <li>Tips: daylight, flat ID, no fingers</li>
          <li>Utility bill matching ID name</li>
          <li>No glare or reflections</li>
        </ul>
        <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
          <span className="text-[#059669] mr-1">✨</span>
          <b>Quick fix:</b> Open API docs → copy example payload → replace with your data → retry. No money was moved.
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scan { animation: scan 2.6s ease-in-out infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #FEE2E2;
        --theme-bg-gradient-2: #FFFBEB;
      }
    `}</style>
</ErrorLayout>
  );
}
