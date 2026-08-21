/* ============================================================================
 * Card Dashboard — icon components (bootstrap-icons edition)
 * ----------------------------------------------------------------------------
 * `Icon` renders bootstrap-icons font glyphs via the semantic `IconName` map in
 * `lib/icons.ts`. The prop API (`name`, `size`, `className`, `strokeWidth`)
 * is unchanged so every call site and the `Parameters<typeof Icon>[0]["name"]`
 * type pattern keep working. `strokeWidth` is accepted for compatibility but
 * font icons carry their own weight.
 * ========================================================================== */

import type { CSSProperties } from "react";
import { iconClass, type IconName } from "./lib/icons";

export type { IconName };

export interface IconProps {
  name: IconName | (string & {});
  /** Pixel size — applied as font-size so the glyph scales like the old SVG. */
  size?: number;
  className?: string;
  /** Accepted for backwards compatibility (font icons have a fixed weight). */
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, className = "", style }: IconProps) {
  return (
    <i
      className={`bi ${iconClass(name)}${className ? ` ${className}` : ""}`}
      style={{ fontSize: size, lineHeight: 1, ...style }}
      aria-hidden="true"
    />
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#12b76a" />
      <path
        d="M10 23V9h7.2a4.6 4.6 0 010 9.2H13.4V23H10z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="21.5" r="2.6" fill="#0b1322" />
    </svg>
  );
}

export function NetworkMark({ network, light = true }: { network: "VISA" | "Mastercard"; light?: boolean }) {
  if (network === "VISA") {
    return (
      <span
        className="pmc-display"
        style={{ fontStyle: "italic", fontSize: 15, fontWeight: 800, letterSpacing: "0.02em", color: light ? "#fff" : "#101828" }}
      >
        VISA
      </span>
    );
  }
  return (
    <span className="d-inline-flex align-items-center" style={{ marginLeft: 0 }} aria-label="Mastercard">
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(235,0,27,0.9)" }} />
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(247,158,27,0.9)", marginLeft: -10 }} />
    </span>
  );
}
