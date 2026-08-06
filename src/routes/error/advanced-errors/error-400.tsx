import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Info, Copy, Wrench, ExternalLink, Clipboard, X } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-400')({
  component: Error400,
});

function Error400() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [traceId, setTraceId] = useState('');
  const [liveClock, setLiveClock] = useState('');
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    setTraceId('api_' + Math.random().toString(36).slice(2, 8) + '_x88');
    const updateClock = () => {
      setLiveClock(new Date().toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const addToast = (title: string, message: string, type: Toast['type'] = 'emerald') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyCode = () => {
    const codeText = `{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Missing required field: routing_number",
  "errors": [
    { "field": "routing_number", "reason": "Required for KES bank transfers" },
    { "field": "amount", "reason": "Must be > 0 and <= 5,000,000" }
  ],
  "trace_id": "${traceId}",
  "hint": "Use IBAN for foreign, routing_number for KES"
}`;
    navigator.clipboard.writeText(codeText);
    addToast('JSON copied', 'Payload copied to clipboard');
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 1800);
  };

  const copyTrace = () => {
    navigator.clipboard.writeText(traceId);
    addToast('Trace ID copied', 'Share with support if needed');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
          <span className="text-lg">⚡</span>
        </div>
      }
      rightAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="w-10 h-10 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center hover:border-[#10b981] hover:text-[#10b981] transition-all"
            title="Why this happened?"
          >
            <Info size={18} />
          </button>
          <Link
            to="/docs"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all"
          >
            <span>Docs</span>
          </Link>
        </div>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Header */}
        <div className="p-5.5 sm:p-7 border-b border-[#E8E2D9] flex items-center justify-between gap-3">
          <div className="flex gap-3 items-center">
            <div className="w-[76px] h-[76px] rounded-[22px] bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center text-3xl relative animate-shakeSoft">
              <span className="font-mono">{`{ }`}</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
                400 • Validation Failed
              </div>
              <div className="font-['Space_Grotesk'] text-[28px] font-bold mt-1.5 mb-2">
                Check your request
              </div>
              <div className="text-[14.5px] text-[#4B5563] leading-relaxed">
                Your payload failed schema validation. Don't worry — here's exactly what to fix.
              </div>
            </div>
          </div>
          <button
            onClick={copyTrace}
            className="hidden md:grid w-10 h-10 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center hover:border-[#10b981] hover:text-[#10b981] transition-all"
            title="Copy Trace ID"
          >
            <Copy size={18} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px] tracking-wider">
              <span className="font-mono text-sm">/</span>
              API Error Response
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[#059669] font-bold text-[11px] transition-opacity ${copyOk ? 'opacity-100' : 'opacity-0'}`}
              >
                Copied!
              </span>
              <button
                onClick={copyCode}
                className="px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[12px] hover:bg-gray-50 transition-colors"
              >
                <Copy size={14} className="inline mr-1" />
                Copy JSON
              </button>
            </div>
          </div>

          {/* Code Panel */}
          <div className="bg-[#0F172A] rounded-[18px] p-4.5 pt-4 relative overflow-hidden mt-4">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#EF4444] to-[#F59E0B]"></div>
            <div className="flex justify-between items-center text-[#94A3B8] text-[11px] uppercase tracking-wider font-bold mb-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                paymo_api • v2/transfers
              </span>
              <span>{liveClock}</span>
            </div>
            <pre className="font-mono text-[12.8px] text-[#E2E8F0] whitespace-pre-wrap break-words leading-relaxed m-0">
              <span className="text-[#93C5FD]">"status"</span>: <span className="text-[#F87171]">"error"</span>,
              <br />
              <span className="text-[#93C5FD]">"code"</span>: <span className="text-[#F87171]">"VALIDATION_FAILED"</span>,
              <br />
              <span className="text-[#93C5FD]">"message"</span>: <span className="text-[#A7F3D0]">"Missing required field: routing_number"</span>,
              <br />
              <span className="text-[#93C5FD]">"errors"</span>: [
              <br />
              &nbsp;&nbsp;{`{`} <span className="text-[#93C5FD]">"field"</span>: <span className="text-[#A7F3D0]">"routing_number"</span>, <span className="text-[#93C5FD]">"reason"</span>: <span className="text-[#A7F3D0]">"Required for KES bank transfers"</span> {`}`},
              <br />
              &nbsp;&nbsp;{`{`} <span className="text-[#93C5FD]">"field"</span>: <span className="text-[#A7F3D0]">"amount"</span>, <span className="text-[#93C5FD]">"reason"</span>: <span className="text-[#A7F3D0]">"Must be &gt; 0 and &lt;= 5,000,000"</span> {`}`}
              <br />
              ],
              <br />
              <span className="text-[#93C5FD]">"trace_id"</span>: <span className="text-[#A7F3D0]">"{traceId}"</span>,
              <br />
              <span className="text-[#93C5FD]">"hint"</span>: <span className="text-[#A7F3D0]">"Use IBAN for foreign, routing_number for KES"</span>
            </pre>
          </div>

          {/* Reason Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <div className="flex gap-2.5 bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#EF4444] flex-shrink-0">
                <span className="text-sm">I</span>
              </div>
              <div>
                <span className="font-bold text-[12px] block">Missing field</span>
                <span className="text-[12px] text-[#4B5563]">routing_number not sent — required for local KES rails</span>
              </div>
            </div>
            <div className="flex gap-2.5 bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#D97706] flex-shrink-0">
                <span className="text-sm">#</span>
              </div>
              <div>
                <span className="font-bold text-[12px] block">Invalid amount</span>
                <span className="text-[12px] text-[#4B5563]">Send a positive number without commas</span>
              </div>
            </div>
            <div className="flex gap-2.5 bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#10b981] flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <span className="font-bold text-[12px] block">Fix is safe</span>
                <span className="text-[12px] text-[#4B5563]">No funds moved. Correct payload and retry</span>
              </div>
            </div>
            <div className="flex gap-2.5 bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6366F1] flex-shrink-0">
                <span className="text-sm">💡</span>
              </div>
              <div>
                <span className="font-bold text-[12px] block">Pro tip</span>
                <span className="text-[12px] text-[#4B5563]">Validate with /v1/validate before submit</span>
              </div>
            </div>
          </div>

          {/* Trace Info */}
          <div className="flex items-center gap-2 mt-4 text-[12px] text-gray-500">
            <span className="text-gray-400">🔍</span> Trace ID:{' '}
            <code className="bg-[#F5F1EC] px-2 py-0.5 rounded-lg border border-[#E8E2D9]">{traceId}</code>
            <span className="ml-auto flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-[#E8E2D9] text-[10px] font-bold">
                KES • Local
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] font-bold">
                No charge
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => addToast('Re-validating payload...', 'Checking schema', 'emerald')}
              className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Wrench size={18} />
              Fix Request
            </button>
            <Link to="/docs" className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center">
              <ExternalLink size={16} className="mr-1.5" />
              API Docs
            </Link>
            <button
              onClick={copyTrace}
              className="md:hidden px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center"
            >
              <Clipboard size={16} />
            </button>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span>🕐</span> Detected 2 sec ago •{' '}
            <Link to="/" className="no-underline text-[#059669] font-semibold">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Why 400 happens?"
        subtitle="Friendly explainer"
        icon={<span className="text-2xl">ℹ️</span>}
        iconBg="#ECFDF5"
        iconColor="#047857"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Got it — fix my payload
          </button>
        }
      >
        <p className="mb-2">
          This is a <b>client-side validation error</b> — your server sent JSON that doesn't match Paymo's schema.
        </p>
        <ul className="ps-3 mb-3 list-disc">
          <li>Missing required keys (like routing_number for KES)</li>
          <li>Wrong type (string vs number)</li>
          <li>Whitespace or trailing commas</li>
        </ul>
        <div className="p-3 rounded-2xl bg-[#FFFCF5] border border-dashed border-[#E8E2D9]">
          <span className="text-[#F59E0B] mr-1">✨</span>
          <b>Quick fix:</b> Open API docs → copy example payload → replace with your data → retry. No money was moved.
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(18px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shakeSoft {
          0%, 90%, 100% { transform: rotate(0deg); }
          92% { transform: rotate(-6deg); }
          94% { transform: rotate(6deg); }
          96% { transform: rotate(-3deg); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideIn { animation: slideIn 0.4s ease; }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        .animate-shakeSoft { animation: shakeSoft 4s ease-in-out infinite; }
        .animate-pulse { animation: pulse 1.5s infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #D1FAE5;
        --theme-bg-gradient-2: #FEF3C7;
      }
    `}</style>
</ErrorLayout>
  );
}
