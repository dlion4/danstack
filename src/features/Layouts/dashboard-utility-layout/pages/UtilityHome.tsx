/* ============================================================================
 * UtilityHome.tsx — the /utility overview rendered inside the UtilityShell.
 * ----------------------------------------------------------------------------
 * Surfaces the utility overview (hero + key stats) and a grid of every
 * navigable service/management/system module. Reuses the shared shell
 * dashboard.module.css visuals (the `d.*` classes) like the other layouts.
 * ========================================================================== */
import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { cx, fetchUtilityLayoutContent, initialMockData } from '../data/utilityLayoutData';
import { useUtilityShell } from '../data/utilityLayoutContext';
import c from '../styles/utilityLayout.module.css';
import d from '@/features/shell/styles/dashboard.module.css';

export default function UtilityHome() {
  const { showToast } = useUtilityShell();

  const { data } = useQuery({
    queryKey: ['utility-layout-content'],
    queryFn: fetchUtilityLayoutContent,
    staleTime: 5 * 60_000,
  });
  const content = data ?? initialMockData;

  const home = content.modules.find((m) => m.key === 'home') ?? content.modules[0];
  const quickLinks = content.modules.filter((m) => m.key !== 'home');

  const handleAction = (label: string) =>
    showToast({ message: `"${label}" opened.`, type: 'info', title: 'Quick action' });

  if (!home) return null;

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
            {home.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.tone === 'primary' ? c.btnPrimary : c.btnGhost}
                onClick={() => handleAction(action.label)}
              >
                <i className={`bi ${action.icon}`} /> {action.label}
              </button>
            ))}
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
              <i className="bi bi-grid-1x2" /> Your services
            </h2>
            <p className={d.sectionSub}>Jump straight into any utility service or tool.</p>
          </div>
        </div>
        <div className={d.moduleGrid}>
          {quickLinks.map((mod) => (
            <Link
              key={mod.key}
              to="/utility/$module"
              params={{ module: mod.key }}
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
