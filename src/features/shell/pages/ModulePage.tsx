/* ============================================================================
 * ModulePage.tsx — generic /app/$section destination.
 * ----------------------------------------------------------------------------
 * Every sidebar entry resolves here. It reads the section param, finds the
 * matching module def, and renders a hero + stats + features + actions. If the
 * section is unknown it renders a friendly empty state (never a broken page).
 * ========================================================================== */
import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { cx, fetchShellContent, findModule, initialMockData } from '../data/shellData';
import { useShell } from '../data/shellContext';
import dash from '../styles/dashboard.module.css';
import shell from '../styles/shell.module.css';

const d = dash as Record<string, string>;
const s = shell as Record<string, string>;

interface ModulePageProps {
  section: string;
}

export default function ModulePage({ section }: ModulePageProps) {
  const { showToast, openAside } = useShell();

  const { data } = useQuery({
    queryKey: ['paymo-shell-content'],
    queryFn: fetchShellContent,
    staleTime: 5 * 60_000,
  });
  const content = data ?? initialMockData;
  const mod = findModule(content, section);

  const isDevelopers = section === 'developers';
  const isSecurity = section === 'security';

  const handleAction = (label: string) =>
    showToast({ message: `"${label}" opened.`, type: 'info', title: 'Action' });

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
            {mod.titlePre}<span className={s.textGradient}>{mod.titleAccent}</span>
          </h1>
          <p className={d.heroCopy}>{mod.copy}</p>
          <div className={d.heroActions}>
            {mod.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.tone === 'primary' ? s.btnPrimary : s.btnGhost}
                onClick={() => handleAction(action.label)}
              >
                <i className={`bi ${action.icon}`} /> {action.label}
              </button>
            ))}
            {isDevelopers && (
              <button type="button" className={s.btnGhost} onClick={() => openAside('developers')}>
                <i className="bi bi-code-slash" /> Open dev tools
              </button>
            )}
            {isSecurity && (
              <button type="button" className={s.btnGhost} onClick={() => openAside('security')}>
                <i className="bi bi-shield-check" /> Open security
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
        <Link to="/app" className={s.btnLink} style={{ textDecoration: 'none' }}>
          <i className="bi bi-arrow-left" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
