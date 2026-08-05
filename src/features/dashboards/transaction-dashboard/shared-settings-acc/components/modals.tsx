/* ============================================================================
 * shared/components/modals.tsx
 * ----------------------------------------------------------------------------
 * Reusable, state-driven modal primitives used by every page of the PayMo
 * app. These replace the legacy Bootstrap-Modal + innerHTML `doAction()`
 * helpers from the original HTML prototypes.
 *
 * Provided:
 *   - ModalShell       : base overlay/dialog chrome (header, body, footer)
 *   - SimpleModal      : single-purpose modal with optional submit + success receipt
 *   - FlowModal        : multi-step wizard (stepper + back/next/finish footer)
 *   - TabbedModal      : modal with pill tabs and switchable panels
 *   - PinRow           : OTP / PIN digit inputs with auto-advance
 *   - ReviewRow        : label/value review line (receipt style)
 *   - SelectField      : labelled <select> helper
 *   - Toggle           : accessible on/off switch
 * ========================================================================== */
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import shared from "../styles/appPage.module.css";

const s = shared as Record<string, string>;

/* ------------------------------------------------------------------ */
/*  ModalShell — base chrome                                          */
/* ------------------------------------------------------------------ */

export interface ModalShellProps {
  show: boolean;
  onClose: () => void;
  iconCls?: string;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
}

export function ModalShell({
  show,
  onClose,
  iconCls,
  title,
  size = "md",
  children,
  footer,
}: ModalShellProps) {
  const sizeClass =
    size === "lg"
      ? s.modalLg
      : size === "xl"
        ? s.modalXl
        : size === "sm"
          ? s.modalSm
          : s.modalMd;

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${s.dialog} ${sizeClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className={s.modalHeader}>
          <h5 className={s.modalTitle}>
            {iconCls && <i className={`${iconCls} ${s.modalIcon}`} />}
            {title}
          </h5>
          <button className={s.modalClose} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SimpleModal — optional submit + success receipt flow             */
/* ------------------------------------------------------------------ */

export interface SimpleModalProps {
  show: boolean;
  onClose: () => void;
  iconCls?: string;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
  submitLabel?: string;
  submitVariant?: "primary" | "danger" | "accent";
  successTitle?: string;
  successMsg?: string;
  successRef?: string;
  cancelLabel?: string;
  closable?: boolean;
}

export function SimpleModal({
  show,
  onClose,
  iconCls,
  title,
  size = "md",
  children,
  footer,
  submitLabel,
  submitVariant = "primary",
  successTitle = "Success",
  successMsg,
  successRef,
  cancelLabel = "Cancel",
  closable = true,
}: SimpleModalProps) {
  const [done, setDone] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (show) {
      setDone(false);
      setProcessing(false);
    }
  }, [show]);

  const submitBtnClass =
    submitVariant === "danger"
      ? `${s.button} ${s.buttonDanger}`
      : submitVariant === "accent"
        ? `${s.button} ${s.buttonAccent}`
        : `${s.button} ${s.buttonPrimary}`;

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 900);
  };

  const handleClose = () => {
    if (!closable) return;
    onClose();
  };

  let body = children;
  if (processing) {
    body = (
      <div className={s.modalProcessing}>
        <div className={s.spinner} />
        <p className={s.processingText}>Processing...</p>
      </div>
    );
  } else if (done) {
    body = (
      <div className={s.receipt}>
        <div className={s.receiptIcon}>
          <i className="bi bi-check-lg" />
        </div>
        <h5 className={s.receiptTitle}>{successTitle}</h5>
        {successMsg && <p className={s.receiptMsg}>{successMsg}</p>}
        {successRef && (
          <p className={s.receiptRef}>
            Reference: <strong>{successRef}</strong>
          </p>
        )}
      </div>
    );
  }

  let foot = footer;
  if (!foot) {
    if (processing || done) {
      foot = (
        <>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={handleClose}>
            Done
          </button>
        </>
      );
    } else if (submitLabel) {
      foot = (
        <>
          <button className={s.button} onClick={handleClose}>
            {cancelLabel}
          </button>
          <button className={submitBtnClass} onClick={handleSubmit}>
            {submitLabel}
          </button>
        </>
      );
    } else {
      foot = (
        <>
          <button className={s.button} onClick={handleClose}>
            Close
          </button>
        </>
      );
    }
  }

  return (
    <ModalShell
      show={show}
      onClose={handleClose}
      iconCls={iconCls}
      title={title}
      size={size}
      footer={foot}
    >
      {body}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  FlowModal — stepper wizard (uncontrolled or controlled)          */
/* ------------------------------------------------------------------ */

export interface FlowModalProps {
  show: boolean;
  onClose: () => void;
  iconCls?: string;
  title?: string;
  steps: string[];
  confirmLabel?: string;
  currentStep?: number;
  submitVariant?: "primary" | "danger" | "accent";
  children: ReactNode | ((step: number) => ReactNode);
}

export function FlowModal({
  show,
  onClose,
  iconCls,
  title,
  steps,
  confirmLabel = "Confirm",
  currentStep,
  submitVariant = "primary",
  children,
}: FlowModalProps) {
  const [internalStep, setInternalStep] = useState(1);
  const controlled = typeof currentStep === "number";
  const step = controlled ? currentStep + 1 : internalStep;
  const total = steps.length;

  useEffect(() => {
    if (show) setInternalStep(1);
  }, [show]);

  const renderFn = typeof children === "function" ? (children as (step: number) => ReactNode) : null;
  const renderBody = renderFn ? renderFn(step) : children;

  const submitBtnClass =
    submitVariant === "danger"
      ? `${s.button} ${s.buttonDanger}`
      : submitVariant === "accent"
        ? `${s.button} ${s.buttonAccent}`
        : `${s.button} ${s.buttonPrimary}`;

  let footer: ReactNode = null;
  if (!controlled) {
    if (step === total) {
      footer = (
        <>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={onClose}>
            Done
          </button>
        </>
      );
    } else {
      footer = (
        <>
          <button className={s.button} onClick={step > 1 ? () => setInternalStep(step - 1) : onClose}>
            {step > 1 ? "Back" : "Cancel"}
          </button>
          <button
            className={step === total - 1 ? submitBtnClass : `${s.button} ${s.buttonPrimary}`}
            onClick={() => (step === total - 1 ? undefined : setInternalStep(step + 1))}
          >
            {step === total - 1 ? confirmLabel : "Continue"}
            <i className="bi bi-arrow-right" />
          </button>
        </>
      );
    }
  }

  return (
    <ModalShell show={show} onClose={onClose} iconCls={iconCls} title={title} size="lg" footer={footer}>
      <div className={s.stepper}>
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const stateClass =
            stepNum < step ? s.stepDone : stepNum === step ? s.stepActive : "";
          return (
            <span key={label} className={`${s.step} ${stateClass}`}>
              <span className={s.stepNum}>{stepNum < step ? <i className="bi bi-check" /> : stepNum}</span>
              <span className={s.stepLabel}>{label}</span>
              {i < steps.length - 1 && <span className={s.stepLine} />}
            </span>
          );
        })}
      </div>
      {renderBody}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  TabbedModal — pill-tabbed panels                                 */
/* ------------------------------------------------------------------ */

export interface TabbedModalTab {
  key: string;
  label: string;
  render: () => ReactNode;
}

export interface TabbedModalProps {
  show: boolean;
  onClose: () => void;
  iconCls?: string;
  title?: string;
  tabs: TabbedModalTab[];
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  initialTab?: number;
}

export function TabbedModal({
  show,
  onClose,
  iconCls,
  title,
  tabs,
  size = "lg",
  footer,
  initialTab = 0,
}: TabbedModalProps) {
  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    if (show) setActive(initialTab);
  }, [show, initialTab]);

  return (
    <ModalShell
      show={show}
      onClose={onClose}
      iconCls={iconCls}
      title={title}
      size={size}
      footer={
        footer ?? (
          <button className={s.button} onClick={onClose}>
            Close
          </button>
        )
      }
    >
      <div className={s.pills} style={{ marginBottom: 20 }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            className={`${s.pill} ${active === i ? s.pillActive : ""}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.render()}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  PinRow — OTP / PIN digit entry                                    */
/* ------------------------------------------------------------------ */

export interface PinRowProps {
  length?: number;
  label?: string;
  onComplete?: (code: string) => void;
}

export function PinRow({ length = 4, label, onComplete }: PinRowProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
    const code = next.join("");
    if (code.length === length) onComplete?.(code);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    text.split("").forEach((ch, i) => (next[i] = ch));
    setValues(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
    if (text.length === length) onComplete?.(text);
  };

  return (
    <div>
      {label && <div className={s.fieldLabel}>{label}</div>}
      <div className={s.pinRow}>
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={s.pinInput}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={v}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReviewRow — receipt style label/value line                        */
/* ------------------------------------------------------------------ */

export interface ReviewRowProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  muted?: boolean;
}

export function ReviewRow({ label, value, highlight, muted }: ReviewRowProps) {
  return (
    <div className={`${s.reviewRow} ${highlight ? s.reviewRowHighlight : ""}`}>
      <span className={`${s.reviewLabel} ${muted ? s.reviewMuted : ""}`}>{label}</span>
      <span className={`${s.reviewValue} ${highlight ? s.reviewValueHighlight : ""}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectField — labelled select                                     */
/* ------------------------------------------------------------------ */

export interface SelectFieldProps {
  label?: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SelectField({
  label,
  options,
  defaultValue,
  placeholder,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="mb-3">
      {label && <label className={s.fieldLabel}>{label}</label>}
      <select
        className={s.field}
        defaultValue={defaultValue ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle — accessible switch                                        */
/* ------------------------------------------------------------------ */

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  danger?: boolean;
}

export function Toggle({ checked, onChange, disabled, label, description, danger }: ToggleProps) {
  return (
    <div className={s.switchRow}>
      {(label || description) && (
        <div>
          {label && <div className={s.switchLabel}>{label}</div>}
          {description && <div className={s.switchDescription}>{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`${s.toggle} ${checked ? (danger ? s.toggleOnDanger : s.toggleOn) : ""}`}
        onClick={() => onChange(!checked)}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <span className={s.toggleKnob} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatPill / InfoBox helpers                                        */
/* ------------------------------------------------------------------ */

export function InfoBox({
  variant = "info",
  children,
}: {
  variant?: "info" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const cls =
    variant === "success"
      ? `${s.hintBox} ${s.hintBoxSuccess}`
      : variant === "warning"
        ? `${s.hintBox} ${s.hintBoxWarning}`
        : variant === "danger"
          ? `${s.hintBox} ${s.hintBoxDanger}`
          : `${s.hintBox} ${s.hintBoxInfo}`;
  return <div className={cls}>{children}</div>;
}
