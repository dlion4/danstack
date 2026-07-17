/* ============================================================================
 * AccountStatus.tsx — Paymo BAAS Account Status / Recovery Center
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page55.html (1,454 LOC) — pure custom CSS + FontAwesome
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/accountStatus.module.css.
 * REPO NOTES ...: tuned for dlion4/danstack — FontAwesome glyphs mapped to
 *                 bootstrap-icons (already in repo); the two FA icons BS lacks
 *                 (handshake, gavel) come from lucide-react (also already in
 *                 repo). Zero new packages.
 *
 * THEME NOTE ...: legacy slate/cyan surfaces were re-themed to the emerald
 *                 glass palette; per-card tone families (mint/blue/gold/
 * purple/red/green tiles) from the legacy design are preserved.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   DOMContentLoaded progress-fill width loop ... inline width from data
 *   mouseenter/mouseleave transform listeners .. pure CSS :hover (same effect)
 *   6 hardcoded <a> action cards + lists ....... initialMockData extraction
 *     rendered through typed .map() loops (backend-ready shape)
 * ========================================================================== */

import { useQuery } from '@tanstack/react-query';
import { Gavel, Handshake } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from '../styles/accountStatus.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type CardTone = 'toneMint' | 'toneBlue' | 'toneGold' | 'tonePurple' | 'toneRed' | 'toneGreen';
type StatusKind = 'required' | 'pending' | 'optional';
type BannerKind = 'statusFrozen' | 'statusFlagged' | 'statusVerification' | 'statusDormant';

interface ActionCard {
  id: string;
  tone: CardTone;
  icon: string;               // bootstrap-icons class
  lucide?: 'handshake' | 'gavel'; // fallback glyph (FA icons BS lacks)
  status: { label: string; kind: StatusKind };
  title: string;
  description: string;
  details: Array<{ label: string; value: string; danger?: boolean }>;
  meta: Array<{ icon: string; lucide?: 'handshake' | 'gavel'; label: string }>;
  actionLabel: string;
  progress: number;
  url: string;
}

interface StatusConfig {
  nav: { title: string; sub: string; sessionBadge: string; userName: string; userInitials: string; userMode: string };
  banner: { icon: string; title: string; badges: Array<{ label: string; kind: BannerKind }>; copy: string };
  hero: {
    indicator: { icon: string; text: string };
    titlePre: string;
    titleAccent: string;
    description: string;
    risk: { icon: string; pre: string; level: string; post: string };
  };
  summary: {
    typeLabel: string;
    statusTitle: string;
    icon: string;
    flow: Array<{ icon: string; label: string; active?: boolean }>;
    route: string;
    modulesTitle: string;
    modules: Array<{ label: string; locked?: boolean }>;
  };
  cardsSection: { title: string; sub: string };
  cards: ActionCard[];
  warnings: { title: string; icon: string; items: string[] };
  tips: { title: string; icon: string; items: string[] };
  contact: {
    title: string;
    copy: string;
    buttons: Array<{ icon: string; label: string; href: string; external?: boolean }>;
  };
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — ALL hardcoded legacy content extracted (6 action
 *    cards, banner badges, summary modules, warnings, tips, contacts).
 *    GET /api/account-status returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: StatusConfig = {
  nav: {
    title: 'Paymo BAAS',
    sub: 'Account Recovery Center',
    sessionBadge: 'Secured session verified',
    userName: 'Amara Okafor',
    userInitials: 'AO',
    userMode: 'Limited Access Mode',
  },

  banner: {
    icon: 'bi-lock-fill',
    title: 'Account Access Restricted',
    badges: [
      { label: 'Account Frozen', kind: 'statusFrozen' },
      { label: 'Under Review', kind: 'statusFlagged' },
    ],
    copy: 'Your account has been temporarily restricted due to security concerns. Complete the required verification steps below to restore full access to your account and resume all transactions.',
  },

  hero: {
    indicator: { icon: 'bi-shield-check', text: 'Account Security & Recovery' },
    titlePre: 'Restore your account ',
    titleAccent: 'access.',
    description: 'Your account security is our priority. Select the appropriate verification path below to unlock your account. Each section addresses specific restrictions placed on your account. Complete all required steps to regain full functionality.',
    risk: { icon: 'bi-exclamation-triangle', pre: 'Risk Level: ', level: 'High', post: ' — Immediate action required' },
  },

  summary: {
    typeLabel: 'Account Status',
    statusTitle: 'Restricted Access',
    icon: 'bi-person-lock',
    flow: [
      { icon: 'bi-check', label: 'Login', active: true },
      { icon: 'bi-lock', label: 'Verify' },
      { icon: 'bi-unlock', label: 'Access' },
    ],
    route: 'Route: /recovery/verify?status=restricted&priority=high',
    modulesTitle: 'Restricted Modules',
    modules: [
      { label: 'Transfers', locked: true },
      { label: 'Withdrawals', locked: true },
      { label: 'Bill Payments', locked: true },
      { label: 'View Only' },
      { label: 'Support' },
    ],
  },

  cardsSection: {
    title: 'Verification Required',
    sub: 'Complete these verification steps to restore full account functionality. Required actions must be completed before access is restored.',
  },

  cards: [
    {
      id: 'identity-verification',
      tone: 'toneMint',
      icon: 'bi-person-vcard',
      status: { label: 'Required', kind: 'required' },
      title: 'Verify Your Identity',
      description: 'Complete KYC verification to confirm your identity. Upload government-issued ID, proof of address, and complete facial verification to unlock account features.',
      details: [
        { label: 'Documents Needed', value: '3 items' },
        { label: 'Est. Time', value: '5-10 minutes' },
        { label: 'Review Time', value: '24-48 hours' },
      ],
      meta: [
        { icon: 'bi-shield-check', label: 'Bank-grade security' },
        { icon: 'bi-camera', label: 'Live selfie required' },
      ],
      actionLabel: 'Start Verification',
      progress: 0,
      url: 'https://verify.paymo.com/identity/kyc',
    },
    {
      id: 'bank-verification',
      tone: 'toneBlue',
      icon: 'bi-bank',
      status: { label: 'Required', kind: 'required' },
      title: 'Verify Linked Accounts',
      description: 'Confirm ownership of all linked bank accounts and mobile wallets. This prevents unauthorized access and ensures secure transaction processing across all your connected financial accounts.',
      details: [
        { label: 'Bank Accounts', value: '2 pending' },
        { label: 'Mobile Wallets', value: '1 pending' },
        { label: 'Verification Method', value: 'Micro-deposit' },
      ],
      meta: [
        { icon: 'bi-clock', label: '1-2 business days' },
        { icon: 'bi-arrow-repeat', label: 'Auto-verification' },
      ],
      actionLabel: 'Verify Accounts',
      progress: 25,
      url: 'https://verify.paymo.com/linked-accounts',
    },
    {
      id: 'transaction-review',
      tone: 'toneGold',
      icon: 'bi-arrow-left-right',
      status: { label: '4 Pending', kind: 'pending' },
      title: 'Review Flagged Transactions',
      description: 'Several transactions on your account have been flagged for review due to unusual patterns. Confirm these transactions were authorized by you to remove the hold on your account.',
      details: [
        { label: 'Flagged Count', value: '4 transactions' },
        { label: 'Total Amount', value: 'NGN 2,450,000' },
        { label: 'Date Range', value: 'Last 14 days' },
      ],
      meta: [
        { icon: 'bi-search', label: 'Detailed review' },
        { icon: 'bi-chat-dots', label: 'Add notes' },
      ],
      actionLabel: 'Review Now',
      progress: 40,
      url: 'https://verify.paymo.com/transactions/review',
    },
    {
      id: 'dispute-resolution',
      tone: 'tonePurple',
      icon: 'bi-people',
      lucide: 'handshake',
      status: { label: '1 Active', kind: 'pending' },
      title: 'Resolve Customer Disputes',
      description: 'A customer has flagged a transaction from your account through another channel. Provide evidence of transaction legitimacy including invoices, delivery confirmations, or communication records.',
      details: [
        { label: 'Dispute ID', value: '#DSP-2024-8842' },
        { label: 'Amount in Dispute', value: 'NGN 150,000' },
        { label: 'Response Due', value: '48 hours', danger: true },
      ],
      meta: [
        { icon: 'bi-flag', lucide: 'gavel', label: 'Arbitration ready' },
        { icon: 'bi-cloud-upload', label: 'Upload proof' },
      ],
      actionLabel: 'Resolve Dispute',
      progress: 15,
      url: 'https://verify.paymo.com/disputes/resolve',
    },
    {
      id: 'fraud-appeal',
      tone: 'toneRed',
      icon: 'bi-exclamation-circle',
      status: { label: 'High Priority', kind: 'required' },
      title: 'Fraud Flag Appeal',
      description: 'Your account has been flagged for potential fraudulent activity. Submit comprehensive documentation to prove your business legitimacy and transaction authenticity to our compliance team.',
      details: [
        { label: 'Flag Reason', value: 'Unusual volume spike' },
        { label: 'Evidence Required', value: 'Business docs' },
        { label: 'Case Priority', value: 'Urgent', danger: true },
      ],
      meta: [
        { icon: 'bi-person-shield', label: 'Compliance review' },
        { icon: 'bi-building', label: 'Business verify' },
      ],
      actionLabel: 'Submit Appeal',
      progress: 5,
      url: 'https://verify.paymo.com/compliance/fraud-appeal',
    },
    {
      id: 'business-verification',
      tone: 'toneGreen',
      icon: 'bi-building',
      status: { label: 'Business', kind: 'optional' },
      title: 'Business Verification (KYB)',
      description: 'For business accounts, complete Know Your Business verification. Submit corporate documents, beneficial ownership information, and business registration certificates to unlock higher transaction limits.',
      details: [
        { label: 'Business Type', value: 'Private Limited' },
        { label: 'Documents', value: 'CAC, Tax ID, etc.' },
        { label: 'Current Limit', value: 'NGN 10M/month' },
      ],
      meta: [
        { icon: 'bi-graph-up', label: 'Higher limits' },
        { icon: 'bi-patch-check', label: 'Verified badge' },
      ],
      actionLabel: 'Start KYB',
      progress: 60,
      url: 'https://verify.paymo.com/business/kyb',
    },
  ],

  warnings: {
    title: 'Important Warnings',
    icon: 'bi-exclamation-triangle',
    items: [
      'Do not create new accounts to bypass restrictions — this will result in permanent suspension of all associated accounts.',
      'Providing false documentation or misleading information is a criminal offense and will be reported to authorities.',
      'Account recovery must be completed within 30 days or your account will be converted to dormant status with fund remittance to unclaimed property.',
      'Third-party account recovery services are fraudulent — Paymo will never ask for your password or PIN via email or phone.',
    ],
  },

  tips: {
    title: 'Tips to Unlock Faster',
    icon: 'bi-lightbulb',
    items: [
      'Ensure all uploaded documents are clear, high-resolution, and not cropped — blurry documents delay review by 3-5 days.',
      'Use the same name across all documents that matches your Paymo profile exactly, including middle names.',
      'For disputed transactions, provide complete communication history — screenshots, emails, delivery receipts help resolve cases faster.',
      'Check your email and SMS regularly for verification codes and additional requests from our compliance team.',
      'Complete identity verification during daytime hours for better lighting during the facial recognition step.',
    ],
  },

  contact: {
    title: 'Need Help With Recovery?',
    copy: 'Our specialized account recovery team is available 24/7 to assist you through the verification process.',
    buttons: [
      { icon: 'bi-telephone', label: 'Call Support: 800-PAYMO-HELP', href: 'tel:+234800PAYMO' },
      { icon: 'bi-envelope', label: 'Email Recovery Team', href: 'mailto:recovery@paymo.com' },
      { icon: 'bi-chat-dots', label: 'Live Chat', href: 'https://support.paymo.com/live-chat', external: true },
      { icon: 'bi-calendar-check', label: 'Schedule Callback', href: 'https://support.paymo.com/schedule-callback', external: true },
    ],
  },
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchAccountStatus(): Promise<StatusConfig> {
  const response = await fetch('/api/account-status', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Account status API responded HTTP ${response.status}`);
  return response.json() as Promise<StatusConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/** Renders a bi glyph, or the lucide stand-in for the FA icons BS lacks. */
function Glyph({ icon, lucide, size = 20 }: { icon: string; lucide?: 'handshake' | 'gavel'; size?: number }) {
  if (lucide === 'handshake') return <Handshake size={size} strokeWidth={2} aria-hidden="true" />;
  if (lucide === 'gavel') return <Gavel size={size} strokeWidth={2} aria-hidden="true" />;
  return <i className={`bi ${icon}`} aria-hidden="true" />;
}

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function AccountStatus() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-account-status'],
    queryFn: fetchAccountStatus,
    staleTime: 60_000,
    refetchInterval: 60_000, // restriction state can change while the user works
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ---------------------------------------------------------------------- */
  return (
    <div className={s.statusPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Checking your account status…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Account status unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/account-status</code> — {error.message}. Showing the most recent bundled snapshot.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      <div className={s.bgGrid} />

      {/* ================= page top bar ================= */}
      <nav className={s.navbar} aria-label="Recovery center">
        <div className={s.brand}>
          <div className={s.brandLogo}>P</div>
          <div className={s.brandText}>
            <h1>{content.nav.title}</h1>
            <span>{content.nav.sub}</span>
          </div>
        </div>
        <div className={s.navRight}>
          <div className={s.sessionBadge}>{content.nav.sessionBadge}</div>
          <div className={s.userProfile}>
            <div className={s.userAvatar}>{content.nav.userInitials}</div>
            <div className={s.userInfo}>
              <h4>{content.nav.userName}</h4>
              <span>{content.nav.userMode}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className={s.containerBox}>
        {/* ================= alert banner ================= */}
        <div className={s.alertBanner} role="alert">
          <div className={s.alertIcon}>
            <i className={`bi ${content.banner.icon}`} />
          </div>
          <div>
            <h2 className={s.alertTitle}>
              {content.banner.title}
              {content.banner.badges.map((badge) => (
                <span key={badge.label} className={cx(s.statusBadge, s[badge.kind])}>{badge.label}</span>
              ))}
            </h2>
            <p style={{ color: 'var(--as-text-2)', fontSize: '0.9rem', maxWidth: '620px', margin: 0 }}>
              {content.banner.copy}
            </p>
          </div>
        </div>

        {/* ================= hero ================= */}
        <div className={s.heroSection}>
          <div className={s.heroMain}>
            <div className={s.pageIndicator}>
              <i className={`bi ${content.hero.indicator.icon}`} />
              {content.hero.indicator.text}
            </div>
            <h2 className={s.heroTitle}>
              {content.hero.titlePre}
              <span>{content.hero.titleAccent}</span>
            </h2>
            <p className={s.heroDescription}>{content.hero.description}</p>
            <div className={s.riskIndicator}>
              <i className={`bi ${content.hero.risk.icon}`} />
              <span>
                {content.hero.risk.pre}
                <strong>{content.hero.risk.level}</strong>
                {content.hero.risk.post}
              </span>
            </div>
          </div>

          <div className={s.heroSidebar}>
            <div className={s.accountSummary}>
              <div className={s.summaryHeader}>
                <div>
                  <span className={s.summaryType}>{content.summary.typeLabel}</span>
                  <h3>{content.summary.statusTitle}</h3>
                </div>
                <i className={`bi ${content.summary.icon}`} style={{ color: 'var(--as-red)', fontSize: '1.4rem' }} />
              </div>
              <div className={s.accountFlow}>
                {content.summary.flow.map((step, i) => (
                  <div key={step.label} style={{ display: 'contents' }}>
                    <div className={cx(s.flowStep, step.active && s.active)}>
                      <i className={`bi ${step.icon}`} />
                      <span>{step.label}</span>
                    </div>
                    {i < content.summary.flow.length - 1 && <div className={s.flowLine} />}
                  </div>
                ))}
              </div>
              <div className={s.routeInfo}>{content.summary.route}</div>
              <div className={s.enabledModules}>
                <h4>{content.summary.modulesTitle}</h4>
                <div className={s.moduleTags}>
                  {content.summary.modules.map((mod) => (
                    <span key={mod.label} className={cx(s.moduleTag, mod.locked && s.locked)}>{mod.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= section header ================= */}
        <div className={s.sectionHeader}>
          <h2>{content.cardsSection.title}</h2>
          <p>{content.cardsSection.sub}</p>
        </div>

        {/* ================= action cards (legacy 6 hardcoded <a> blocks) ================= */}
        <div className={s.cardsGrid}>
          {content.cards.map((card) => (
            <a key={card.id} href={card.url} target="_blank" rel="noreferrer" className={cx(s.actionCard, s[card.tone])}>
              <span className={s.externalLink}><i className="bi bi-box-arrow-up-right" /></span>
              <div className={s.cardHeader}>
                <div className={s.cardIcon}>
                  <Glyph icon={card.icon} lucide={card.lucide} size={22} />
                </div>
                <span className={cx(s.cardStatus, s[card.status.kind])}>{card.status.label}</span>
              </div>
              <h3 className={s.cardTitle}>{card.title}</h3>
              <p className={s.cardDescription}>{card.description}</p>
              <div className={s.cardDetails}>
                {card.details.map((row) => (
                  <div className={s.detailRow} key={row.label}>
                    <span className={s.detailLabel}>{row.label}</span>
                    <span className={cx(s.detailValue, row.danger && s.danger)}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className={s.cardFooter}>
                <div className={s.cardMeta}>
                  {card.meta.map((m) => (
                    <span className={s.metaItem} key={m.label}>
                      <Glyph icon={m.icon} lucide={m.lucide} size={13} />
                      {m.label}
                    </span>
                  ))}
                </div>
                <span className={s.cardAction}>
                  {card.actionLabel} <i className="bi bi-arrow-right" />
                </span>
              </div>
              <div className={s.progressTrack}>
                <div className={s.progressFill} style={{ width: `${card.progress}%` }} />
              </div>
            </a>
          ))}
        </div>

        {/* ================= info section ================= */}
        <div className={s.infoSection}>
          <div className={s.infoCard}>
            <h3><i className={`bi ${content.warnings.icon}`} /> {content.warnings.title}</h3>
            <ul className={cx(s.lineList, s.warnList)}>
              {content.warnings.items.map((item) => (
                <li key={item.slice(0, 32)}>
                  <i className="bi bi-x-circle" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.infoCard}>
            <h3><i className={`bi ${content.tips.icon}`} /> {content.tips.title}</h3>
            <ul className={cx(s.lineList, s.tipList)}>
              {content.tips.items.map((item) => (
                <li key={item.slice(0, 32)}>
                  <i className="bi bi-check-circle" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= contact section ================= */}
        <div className={s.contactSection}>
          <h3>{content.contact.title}</h3>
          <p>{content.contact.copy}</p>
          <div className={s.contactButtons}>
            {content.contact.buttons.map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                className={s.contactBtn}
                {...(btn.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <i className={`bi ${btn.icon}`} />
                {btn.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
