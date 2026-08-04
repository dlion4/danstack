"use client";

import styles from "./PaymoLogo.module.css";

export type PaymoLogoVariant = "classic" | "gradient";
export type PaymoLogoSize = "sm" | "md" | "lg";

interface PaymoLogoProps {
  variant?: PaymoLogoVariant;
  size?: PaymoLogoSize;
  showBadge?: boolean;
  showTagline?: boolean;
  className?: string;
}

export default function PaymoLogo({
  variant = "classic",
  size = "md",
  showBadge = true,
  showTagline = true,
  className,
}: PaymoLogoProps) {
  const isGradient = variant === "gradient";
  return (
    <span
      className={[
        styles.logo,
        styles[size],
        isGradient ? styles.gradientVariant : styles.classicVariant,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showBadge && (
        <span className={styles.badge} aria-hidden="true">
          PM
        </span>
      )}
      <span className={styles.textWrap}>
        <span className={`${styles.wordmark} ${styles.fontDisplay}`}>
          Pay<span className={styles.accent}>MO</span>
        </span>
        {showTagline && (
          <span className={`${styles.tagline} ${styles.fontDisplay}`}>
            
          </span>
        )}
      </span>
    </span>
  );
}
