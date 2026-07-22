/* ============================================================================
 * DevModulePage.tsx — generic /dev/$module destination for the dev layout.
 * ----------------------------------------------------------------------------
 * Every sidebar entry (except the dashboard home) resolves here. It reads the
 * module param, finds the matching module def, and renders a hero + stats +
 * features + actions. If the module is unknown it renders a friendly empty
 * state (never a broken page). Mirrors the cards layout's CardsModulePage.
 * ========================================================================== */
import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { cx, fetchDevLayoutContent, findModule, initialMockData } from '../data/devLayoutData';
import type { AsideKind } from '../data/devLayoutData';
import { useDevShell } from '../data/devLayoutContext';
import c from '../styles/devLayout.module.css';
import d from '@/features/shell/styles/dashboard.module.css';

interface DevModulePageProps {
  module: string;
}

// Modules that have a matching quick-access context panel in the right aside.
const ASIDE_FOR: Record<string, AsideKind> = {
  'api-keys': 'apiKeys',
  explorer: 'apiExplorer',
  servers: 'systemStatus',
  metrics: 'systemStatus',
};

export default function DevModulePage({ module }: DevModulePageProps) {
  const { showToast, openAside } = useDevShell();

  const { data } = useQuery({
    queryKey: ['dev-layout-content'],
    queryFn: fetchDevLayoutContent,
    staleTime: 5 * 60_000,
  });
  const content = data ?? initialMockData;
  const mod = findModule(content, module);

  const asideKind = ASIDE_FOR[module];
  const known = content.modules.some((m) => m.key === module);

  const handleAction = (label: string) =>
    showToast({ message: `"${label}" opened.`, type: 'info', title: 'Action' });

  if (!known || !mod) {
    return (
      <div className={d.pageWrap}>
        <section className={d.sectionCard}>
          <div className={d.emptyState}>
            <i className="bi bi-cone-striped" />
            <h3>Workspace not found</h3>
            <p style={{ color: 'var(--sh-ink-2)' }}>
              There is no developer module at <code>/{module}</code>.
            </p>
            <div className={d.actionRow} style={{ justifyContent: 'center' }}>
              <Link to="/dev" className={c.btnPrimary} style={{ textDecoration: 'none' }}>
                <i className="bi bi-arrow-left" /> Back to dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={d.pageWrap}>
      {/* ---------- hero ---------- */}
      <section
        className={d.hero}
        style={{ '--mod-c1': mod.c1, '--mod-c2': mod.c2 } as CSSProperties}
      >
        <div className={d.heroAccent} />
        <div className={d.heroInner}>
          <span className={d.pill}><span className={d.pillDot} /> {mod.pill}</span>
          <h1 className={d.heroTitle}>
            {mod.titlePre}<span className={c.textGradient}>{mod.titleAccent}</span>
          </h1>
          <p className={d.heroCopy}>{mod.copy}</p>
          <div className={d.heroActions}>
            {mod.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.tone === 'primary' ? c.btnPrimary : c.btnGhost}
                onClick={() => handleAction(action.label)}
              >
                <i className={`bi ${action.icon}`} /> {action.label}
              </button>
            ))}
            {asideKind && (
              <button type="button" className={c.btnGhost} onClick={() => openAside(asideKind)}>
                <i className="bi bi-layout-sidebar-reverse" /> Open panel
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <div className={d.statsGrid}>
        {mod.stats.map((stat) => (
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

      {/* ---------- features ---------- */}
      <section className={d.sectionCard}>
        <div className={d.sectionHead}>
          <div>
            <h2 className={d.sectionTitle}>
              <i className={`bi ${mod.icon}`} /> {mod.label} capabilities
            </h2>
            <p className={d.sectionSub}>What you can do from here.</p>
          </div>
        </div>
        <div className={d.featureList}>
          {mod.features.map((feat) => (
            <div className={d.featureItem} key={feat.text}>
              <span className={d.featureIcon}><i className={`bi ${feat.icon}`} /></span>
              <span>{feat.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- back link ---------- */}
      <div className={d.actionRow}>
        <Link to="/dev" className={c.btnLink} style={{ textDecoration: 'none' }}>
          <i className="bi bi-arrow-left" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
