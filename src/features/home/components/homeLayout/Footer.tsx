"use client";

/**
 * Footer.tsx — Paymo BaaS footer (matches the Header navbar theme)
 * --------------------------------------------------------------------------
 * Replaces the old `Footer.jsx` (Tailwind + emerald-500 look) with a
 * dark-green Paymo BaaS themed footer that mirrors the Header:
 *   - Same brand color tokens (brand-500 #16a861, surface-900 #0a1a12, ...)
 *   - Same button styles (.btnPrimary / .btnGhost mirror Header's)
 *   - Same status badge pattern (mirrors the ticker "Systems Operational" badge)
 *   - Same social icon-box pattern (rounded squares, brand-tinted backgrounds)
 *   - Same font system (DM Sans body + Space Grotesk display)
 *   - Top glow strip echoes the FX ticker bar above the header
 *
 * Sections:
 *   1. CTA band ("Ready to build?" + Get Started / Talk to Sales)
 *   2. Brand column (logo + tagline + status badge + newsletter + socials)
 *   3. Four link columns (Products / Solutions / Developers / Resources)
 *   4. Bottom bar (copyright + legal links + region chip)
 *
 * Fully responsive: 5-col → 3-col → 2-col → 1-col across desktop / tablet / mobile.
 */

import {
  ArrowRight,
  Github,
  type LucideIcon,
  Linkedin,
  Mail,
  MessageSquare,
  Send,
  Twitter,
  Zap,
} from "lucide-react";
import { useState } from "react";
import styles from "./Footer.module.css";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Products",
    links: [
      { label: "Payments", href: "#" },
      { label: "Wallets", href: "#" },
      { label: "FX Exchange", href: "#" },
      { label: "Banking as a Service", href: "#" },
      { label: "Virtual Cards", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "E-Commerce", href: "#" },
      { label: "Lending", href: "#" },
      { label: "Fintech Startups", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Marketplaces", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "SDKs & Libraries", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "System Status", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Case Studies", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Events & Webinars", href: "#" },
      { label: "Trust & Security", href: "#" },
    ],
  },
];

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: MessageSquare, href: "#", label: "Discord" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // In production this would POST to /api/newsletter/subscribe
    setEmail("");
    // Surface a friendly confirmation (parent app may hook into a toast)
    if (typeof window !== "undefined") {
      const event = new CustomEvent("paymo:toast", {
        detail: { message: "Subscribed to Paymo updates" },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* ===== CTA band ===== */}
        <div className={styles.ctaBand}>
          <div className={styles.ctaText}>
            <h3 className={`${styles.fontDisplay}`}>
              Ready to build with Paymo?
            </h3>
            <p>
              Spin up a free sandbox, drop in our APIs, and launch financial
              products across Africa in days — not quarters.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a href="#" className={styles.btnPrimary}>
              Get Started Free
              <ArrowRight size={14} />
            </a>
            <a href="#" className={styles.btnGhost}>
              <MessageSquare size={13} />
              Talk to Sales
            </a>
          </div>
        </div>

        {/* ===== Main grid ===== */}
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <span className={styles.brandMark}>
                <Zap size={15} color="#ffffff" fill="#ffffff" />
              </span>
              <span>
                <span
                  className={`${styles.fontDisplay} ${styles.brandName}`}
                >
                  Paymo
                </span>
                <span
                  className={`${styles.fontDisplay} ${styles.brandTag}`}
                >
                  BaaS PLATFORM
                </span>
              </span>
            </div>

            <p className={styles.brandDesc}>
              Licensed Banking-as-a-Service infrastructure powering Africa&apos;s
              digital economy — payments, wallets, FX, and embedded banking in
              one API.
            </p>

            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Systems 100% Operational
            </span>

            {/* Newsletter */}
            <form className={styles.newsletter} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="you@company.com"
                aria-label="Email address"
                className={styles.newsletterInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className={styles.newsletterBtn}
                aria-label="Subscribe"
              >
                <Send size={14} />
              </button>
            </form>

            {/* Social */}
            <div className={styles.socialRow}>
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className={styles.socialIcon}
                  aria-label={label}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={styles.linkCol}>
              <h5 className={`${styles.fontDisplay}`}>{col.title}</h5>
              <ul className={styles.linkList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>
                      <span>{link.label}</span>
                      <ArrowRight size={11} className={styles.linkArrow} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ===== Bottom bar ===== */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Paymo Technologies Inc. All rights
            reserved.
          </p>

          <span className={styles.regionChip}>
            <Mail size={11} />
            hello@paymo.africa
          </span>

          <div className={styles.legalRow}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Compliance</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
