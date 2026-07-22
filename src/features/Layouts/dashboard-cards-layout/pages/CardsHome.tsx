/* ============================================================================
 * CardsHome.tsx — the /app/card-overview home rendered inside CardsShell outlet.
 * ----------------------------------------------------------------------------
 * Surfaces the card operating overview and a grid of every navigable module.
 * Uses the same initialMockData the shell loads (kept in sync via TanStack Query's cache).
 * ========================================================================== */
import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { cx, fetchCardsLayoutContent, initialMockData } from '../data/cardsLayoutData';
import { useCardsShell } from '../data/cardsLayoutContext';
import cardsPage from '../styles/cardsLayout.module.css';
import shellDash from '../../shell/styles/dashboard.module.css';

const c = cardsPage as Record<string, string>;
const d = shellDash as Record<string, string>;

export default function CardsHome() {
  const { showToast } = useCardsShell();

  const { data } = useQuery({
    queryKey: ['cards-layout-content'],
    queryFn: fetchCardsLayoutContent,
    staleTime: 5 * 60_000,
  });
  const content = data ?? initialMockData;

  const home = content.modules[0];
  const quickLinks = content.modules.filter((m) => m.key !== 'card-overview');

  const handleAction = (label: string) =>
    showToast({ message: `"${label}" opened.`, type: 'info', title: 'Quick action' });

  return (
    <div className={d.pageWrap}>
      {/* ---------- hero ---------- */}
      <section
        className={d.hero}
        style={{ '--mod-c1': home.c1, '--mod-c2': home.c2 } as CSSProperties}
      >
        <div className={d.heroAccent} />
        <div className={d.heroInner}>
          <span className={d.pill}><span className={d.pillDot} /> {home.pill}</span>
          <h1 className={d.heroTitle}>
            {home.titlePre}<span className={c.textGradient}>{home.titleAccent}</span>
          </h1>
          <p className={d.heroCopy}>{home.copy}</p>
          <div className={d.heroActions}>
            <button type="button" className={c.btnPrimary} onClick={() => handleAction('Issue card')}>
              <i className="bi bi-plus-lg" /> Issue card
            </button>
            <button type="button" className={c.btnGhost} onClick={() => handleAction('Export statement')}>
              <i className="bi bi-download" /> Export statement
            </button>
          </div>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <div className={d.statsGrid}>
        {home.stats.map((stat) => (
          <div className={d.statCard} key={stat.label}>
            <div className={d.statLabel}>{stat.label}</div>
            <div className={d.statValue}>{stat.value}</div>
            {stat.delta && (
              <div className={cx(d.statDelta, stat.up ? d.up : d.down)}>
                <i className={stat.up ? 'bi bi-arrow-up-right' : 'bi bi-arrow-down-right'} />
                {stat.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---------- module grid ---------- */}
      <section className={d.sectionCard}>
        <div className={d.sectionHead}>
          <div>
            <h2 className={d.sectionTitle}>
              <i className="bi bi-grid-1x2" /> Your workspaces
            </h2>
            <p className={d.sectionSub}>Jump straight into any card module.</p>
          </div>
        </div>
        <div className={d.moduleGrid}>
          {quickLinks.map((mod) => (
            <Link
              key={mod.key}
              to="/cards/app/$section"
              params={{ section: mod.key }}
              className={d.moduleCard}
            >
              <span
                className={d.moduleIcon}
                style={{ background: `linear-gradient(135deg, ${mod.c1}, ${mod.c2})` }}
              >
                <i className={`bi ${mod.icon}`} />
              </span>
              <h3 className={d.moduleTitle}>{mod.label}</h3>
              <p className={d.moduleDesc}>{mod.copy}</p>
              <div className={d.moduleFoot}>
                <span className={cx(c.badgeMini, c.badgeSoft)} style={{ fontSize: '0.68rem' }}>
                  {mod.pill}
                </span>
                <i className={cx('bi bi-arrow-right', d.moduleArrow)} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
