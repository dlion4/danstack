/* ============================================================================
 * Card Dashboard — page 5.6 · Corporate & Business Card Programs (Bootstrap 5)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "./ui";
import { useApp } from "./store";
import {
  CYCLE_DAY_OPTIONS,
  GRACE_OPTIONS,
  LIABILITY_MODELS,
  PROGRAM_STATS,
  SEED_APPROVALS,
  SETTLEMENT_ACCOUNTS,
  kes,
  kesShort,
  type BillingConfig,
  type LiabilityModel,
} from "./data";

const DEPT_NAMES: Record<string, string> = {
  d1: "Fleet Management",
  d2: "Sales & Marketing",
  d3: "Executive Travel",
  d4: "Operations",
};
const deptName = (id: string) => DEPT_NAMES[id] ?? "—";

/* ============ 01 · Programme overview ============ */

export function CorporateOverview() {
  const { billing, policies, setPage, openModal } = useApp();
  const liability = LIABILITY_MODELS.find((l) => l.id === billing.liability) ?? LIABILITY_MODELS[0];
  const activePolicies = policies.filter((p) => p.enabled).length;

  return (
    <section id="overview" className="pmc-scroll-mt">
      <Reveal>
        <div className="pmc-hero">
          <div className="pmc-hero-dots" />
          <div className="position-relative d-flex flex-wrap align-items-center pmc-gap-6">
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 300 }}>
              <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                <span className="pmc-hero-chip d-inline-flex align-items-center pmc-gap-15 text-uppercase fw-bold" style={{ letterSpacing: "0.12em" }}>
                  <span className="pmc-live-dot" /> BAAS · Cards
                </span>
                <span className="pmc-hero-chip">Module 5.6</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Corporate &amp; Business<br className="d-none d-sm-inline" /> Card Programs
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 510 }}>
                Run multi-department card programmes with central liability, controlled budgets,
                enforced spend policies and automated settlement — one programme, full visibility.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="users" onClick={() => openModal({ type: "inviteEmployee" })}>Issue Employee Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "billing" })}>Billing &amp; Settlement</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Departments", v: String(PROGRAM_STATS.activeDepartments) },
                  { k: "Employee cards", v: "32" },
                  { k: "B2B spend MTD", v: kesShort(PROGRAM_STATS.b2bSpendMtd) },
                  { k: "Open approvals", v: String(SEED_APPROVALS.length), warn: true },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value" style={s.warn ? { color: "#ffd27d" } : undefined}>{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 230 }}>
              <div className="position-absolute p-4 text-white" style={{ right: 0, top: 0, width: 240, transform: "rotate(6deg)", borderRadius: 16, boxShadow: "var(--shadow-card)", background: "linear-gradient(118deg,#0b1322 0%,#123a2c 55%,#0d5c38 100%)" }}>
                <div className="pmc-hero-dots" style={{ borderRadius: 16 }} />
                <p className="pmc-display position-relative pmc-fs-13 fw-bold mb-0">PayMo Corporate</p>
                <p className="position-relative pmc-fs-10 fw-bold text-uppercase" style={{ marginTop: "auto", paddingTop: 48, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>Company Liable</p>
                <p className="pmc-num position-relative pmc-display pmc-fs-16 fw-bold mb-0">KES 4.5M / mo</p>
              </div>
              <div className="position-absolute p-4 text-white" style={{ bottom: 0, left: 4, width: 240, transform: "rotate(-4deg)", borderRadius: 16, boxShadow: "var(--shadow-card)", background: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)" }}>
                <div className="pmc-hero-dots" style={{ borderRadius: 16 }} />
                <p className="pmc-display position-relative pmc-fs-13 fw-bold mb-0">Fleet Management</p>
                <p className="position-relative pmc-fs-10 fw-bold text-uppercase" style={{ marginTop: "auto", paddingTop: 48, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>12 cards · 84% used</p>
                <div className="position-relative overflow-hidden" style={{ marginTop: 6, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.25)" }}>
                  <span className="d-block h-100" style={{ width: "84%", borderRadius: 99, background: "rgba(255,255,255,0.9)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {[
          { icon: "building" as IconName, tone: "pmc-tone-green", label: "Departments", value: String(PROGRAM_STATS.activeDepartments), note: `${PROGRAM_STATS.employeeCards.toLocaleString()} cards programme-wide`, spark: [2, 2, 3, 3, 4, 4, 4, 4], stroke: "#12b76a" },
          { icon: "wallet" as IconName, tone: "pmc-tone-blue", label: "B2B Spend MTD", value: kesShort(PROGRAM_STATS.b2bSpendMtd), note: "76% of allocated budget", spark: [22, 28, 33, 40, 46, 52, 58, 63], stroke: "#2e90fa" },
          { icon: "shield" as IconName, tone: "pmc-tone-violet", label: "Active Policies", value: `${activePolicies}/${policies.length}`, note: "Enforced on every card", spark: [3, 3, 4, 4, 5, 5, 5, 5], stroke: "#7a5af8" },
          { icon: "flag" as IconName, tone: "pmc-tone-warn", label: "Pending Approvals", value: String(SEED_APPROVALS.length), note: `${kesShort(418000)} awaiting sign-off`, spark: [1, 2, 2, 3, 2, 3, 3, 3], stroke: "#f79009", action: () => document.getElementById("approvals")?.scrollIntoView({ behavior: "smooth" }) },
        ].map((k, i) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <button
                type="button"
                onClick={k.action}
                className={cn("pmc-card pmc-stat pmc-focus h-100", k.action && "pmc-lift")}
                style={k.action ? undefined : { cursor: "default" }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}><Icon name={k.icon} size={19} /></span>
                  <Spark points={k.spark} stroke={k.stroke} />
                </div>
                <p className="pmc-stat-label">{k.label}</p>
                <p className="pmc-stat-value">{k.value}</p>
                <p className="pmc-mt-2 pmc-fs-11 fw-semibold pmc-faint mb-0">{k.note}</p>
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      {/* Liability summary */}
      <Reveal delay={100}>
        <div className="pmc-card pmc-mt-4 p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-3">
            <div className="d-flex align-items-center pmc-gap-3">
              <span className="pmc-icon-sq d-grid flex-none pmc-tone-green" style={{ width: 40, height: 40 }}><Icon name="shieldCheck" size={18} /></span>
              <div>
                <p className="pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.1em" }}>Current liability model</p>
                <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{liability.title} — {liability.blurb}</p>
              </div>
            </div>
            <div className="d-flex flex-wrap align-items-center pmc-gap-2">
              <Badge tone="success" dot>Cycle ends day {billing.cycleEndDay}</Badge>
              <Badge tone={billing.autoDebit ? "info" : "warning"}>{billing.autoDebit ? "Auto-debit on" : "Manual settlement"}</Badge>
              <Badge tone="muted">{billing.graceDays}-day grace</Badge>
              <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "billing" })}>Change</Btn>
            </div>
          </div>
          <p className="pmc-note pmc-note-canvas pmc-mt-25 mb-0" style={{ display: "block" }}>{liability.detail} <span className="fw-bold pmc-ink">{liability.risk}.</span></p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 02 · Departments & budgets ============ */

export function DepartmentsSection() {
  const { openModal, toast } = useApp();
  const depts = [
    { id: "d1", name: "Fleet Management", lead: "Michael Kariuki", cards: 12, budgetMonth: 2500000, spentMonth: 2100000, tone: "#12b76a", icon: "card" as IconName },
    { id: "d2", name: "Sales & Marketing", lead: "Grace Kamau", cards: 9, budgetMonth: 1000000, spentMonth: 950000, tone: "#7a5af8", icon: "chart" as IconName },
    { id: "d3", name: "Executive Travel", lead: "David Ochieng", cards: 4, budgetMonth: 800000, spentMonth: 350000, tone: "#2e90fa", icon: "globe" as IconName },
    { id: "d4", name: "Operations", lead: "Peter Mutua", cards: 7, budgetMonth: 600000, spentMonth: 412000, tone: "#f79009", icon: "building" as IconName },
  ];
  const totalBudget = depts.reduce((s, d) => s + d.budgetMonth, 0);
  const totalSpent = depts.reduce((s, d) => s + d.spentMonth, 0);

  return (
    <section id="departments" className="pmc-scroll-mt">
      <SectionHead no="02" title="Departments & Budgets" sub="Each department gets its own card pool, budget ceiling and cardholder list.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Department report exported", `${depts.length} departments written to departments.csv`)}>Export</Btn>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "inviteEmployee" })}>Add Cardholder</Btn>
      </SectionHead>

      <div className="row g-3 pmc-mb-4">
        {[
          { k: "Allocated monthly", v: kes(totalBudget), tone: "pmc-ink" },
          { k: "Spent MTD", v: kes(totalSpent), tone: "pmc-blue-ink" },
          { k: "Utilisation", v: `${Math.round((totalSpent / totalBudget) * 100)}%`, tone: "pmc-green-ink" },
        ].map((s) => (
          <div key={s.k} className="col-12 col-sm-4">
            <div className="pmc-card p-4 h-100">
              <p className="pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>{s.k}</p>
              <p className={cn("pmc-num pmc-display pmc-mt-1 pmc-fs-20 fw-bold mb-0", s.tone)} style={{ letterSpacing: "-0.02em" }}>{s.v}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row pmc-g-3">
        {depts.map((d, i) => {
          const pct = Math.round((d.spentMonth / d.budgetMonth) * 100);
          const over = pct > 85;
          return (
            <div key={d.id} className="col-12 col-sm-6 col-xl-3">
              <Reveal delay={i * 70} className="h-100">
                <div className="pmc-card pmc-lift d-flex flex-column p-4 h-100">
                  <div className="d-flex align-items-start justify-content-between">
                    <span className="pmc-icon-sq d-grid text-white" style={{ width: 40, height: 40, background: d.tone }}><Icon name={d.icon} size={18} /></span>
                    <Badge tone={over ? "danger" : pct > 60 ? "warning" : "success"} dot>{pct}%</Badge>
                  </div>
                  <p className="pmc-display pmc-mt-3 pmc-fs-14 fw-bold pmc-ink mb-0" style={{ letterSpacing: "-0.02em" }}>{d.name}</p>
                  <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{d.lead}</p>
                  <div className="pmc-mt-3">
                    <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                      <span className="pmc-num">{kesShort(d.spentMonth)}</span>
                      <span className="pmc-num">of {kesShort(d.budgetMonth)}</span>
                    </div>
                    <Progress value={pct} tone={over ? "red" : pct > 60 ? "amber" : "green"} />
                  </div>
                  <div className="pmc-mt-3 d-flex align-items-center justify-content-between" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", paddingTop: 12 }}>
                    <span className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-muted"><Icon name="card" size={13} /> {d.cards} cards</span>
                    <button type="button" onClick={() => openModal({ type: "inviteEmployee" })} className="pmc-focus pmc-fs-115 fw-bold pmc-green-dark border-0 bg-transparent p-0">Add card →</button>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============ 03 · Employee cards ============ */

const EMPLOYEES = [
  { id: "e1", name: "Grace Kamau", role: "Marketing Lead", dept: "Sales & Marketing", last4: "8810", card: "Corporate Physical", limit: 95000, spent: 71200, status: "active" },
  { id: "e2", name: "Michael Kariuki", role: "Fleet Manager", dept: "Fleet Management", last4: "9921", card: "Fleet Fuel Card", limit: 250000, spent: 210000, status: "active" },
  { id: "e3", name: "Peter Mutua", role: "Ops Officer", dept: "Operations", last4: "2214", card: "Standard Debit", limit: 60000, spent: 0, status: "delivering" },
  { id: "e4", name: "David Ochieng", role: "Director", dept: "Executive Travel", last4: "8821", card: "Premium Travel", limit: 200000, spent: 46500, status: "active" },
  { id: "e5", name: "James Kamau", role: "Media Buyer", dept: "Sales & Marketing", last4: "3094", card: "Virtual Credit", limit: 40000, spent: 23400, status: "active" },
  { id: "e6", name: "Mary Wanjiku", role: "Cloud Engineer", dept: "Operations", last4: "7710", card: "Virtual Debit", limit: 10000, spent: 4600, status: "active" },
];

export function EmployeesSection() {
  const { openModal } = useApp();
  const [filter, setFilter] = useState<"all" | "active" | "delivering">("all");
  const [query, setQuery] = useState("");
  const shown = EMPLOYEES.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${e.name} ${e.dept} ${e.role} ${e.last4}`.toLowerCase().includes(q);
  });

  return (
    <section id="employees" className="pmc-scroll-mt">
      <SectionHead no="03" title="Employee Cards" sub="Every cardholder, their department, their card and how much of their limit is used.">
        <div className="position-relative">
          <Icon name="search" size={14} className="position-absolute pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a cardholder…"
            className="pmc-focus pmc-radius-sm pmc-fs-125 fw-semibold pmc-ink"
            style={{ width: 190, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px 8px 36px", outline: "none" }}
          />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "inviteEmployee" })}>Issue Card</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "active", "delivering"] as const).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={f === "all" ? EMPLOYEES.length : EMPLOYEES.filter((e) => e.status === f).length}>
            {f === "all" ? "All cardholders" : f === "active" ? "Active" : "In delivery"}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="users" title="No cardholders match" sub="Try another search term or filter." action={<Btn size="sm" variant="outline" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</Btn>} />
      ) : (
        <Reveal>
          <div className="pmc-table-frame">
            <div className="d-none d-md-block">
              <table className="pmc-table w-100 text-start">
                <thead>
                  <tr>
                    <th className="pmc-px-4 pmc-py-25">Cardholder</th>
                    <th className="pmc-px-3 pmc-py-25">Department</th>
                    <th className="pmc-px-3 pmc-py-25">Card</th>
                    <th className="pmc-px-3 pmc-py-25" style={{ width: 160 }}>Limit used</th>
                    <th className="pmc-px-4 pmc-py-25 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e) => {
                    const pct = Math.round((e.spent / e.limit) * 100);
                    return (
                      <tr key={e.id}>
                        <td className="pmc-px-4 pmc-py-3">
                          <div className="d-flex align-items-center pmc-gap-25">
                            <span className="pmc-display d-grid flex-none fw-bold pmc-green" style={{ width: 32, height: 32, borderRadius: 99, background: "var(--pmc-ink)", fontSize: 10.5 }}>
                              {e.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                            <div className="lh-sm">
                              <p className="fw-bold pmc-ink mb-0">{e.name}</p>
                              <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{e.role} · •• {e.last4}</p>
                            </div>
                          </div>
                        </td>
                        <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{e.dept}</td>
                        <td className="pmc-px-3 pmc-py-3">
                          <Badge tone={e.card.includes("Virtual") ? "violet" : e.card.includes("Premium") ? "success" : "muted"}>{e.card}</Badge>
                          {e.status === "delivering" && <Badge tone="warning" className="ms-1">In delivery</Badge>}
                        </td>
                        <td className="pmc-px-3 pmc-py-3">
                          <div className="d-flex align-items-center pmc-gap-2">
                            <div className="d-inline-block" style={{ width: 100 }}>
                              <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} />
                            </div>
                            <span className="pmc-num pmc-fs-11 fw-bold pmc-muted">{pct}%</span>
                          </div>
                        </td>
                        <td className="pmc-px-4 pmc-py-3 text-end"><Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "limits", cardId: e.id })}>Limits</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="pmc-mobile-list d-md-none">
              {shown.map((e) => {
                const pct = Math.round((e.spent / e.limit) * 100);
                return (
                  <li key={e.id}>
                    <div className="w-100">
                      <div className="d-flex align-items-center pmc-gap-3">
                        <span className="pmc-display d-grid flex-none fw-bold pmc-green" style={{ width: 36, height: 36, borderRadius: 99, background: "var(--pmc-ink)", fontSize: 11 }}>{e.name.split(" ").map((n) => n[0]).join("")}</span>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <p className="text-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{e.name}</p>
                          <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{e.dept} · •• {e.last4}</p>
                        </div>
                        <Btn size="sm" variant="outline" onClick={() => openModal({ type: "limits", cardId: e.id })}>Limits</Btn>
                      </div>
                      <div className="pmc-mt-2 d-flex align-items-center pmc-gap-2">
                        <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} />
                        <span className="pmc-num pmc-fs-11 fw-bold pmc-faint">{pct}%</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="d-flex align-items-center justify-content-between px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
              <p className="pmc-fs-115 fw-bold pmc-muted mb-0">{shown.length} cardholder{shown.length === 1 ? "" : "s"}</p>
              <p className="pmc-num pmc-fs-115 fw-bold pmc-muted mb-0">Combined limits · <span className="pmc-display pmc-fs-13 pmc-ink">{kesShort(shown.reduce((s, e) => s + e.limit, 0))}</span></p>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/* ============ 04 · Spend policies ============ */

export function PoliciesSection() {
  const { policies, togglePolicy, openModal } = useApp();
  return (
    <section id="policies" className="pmc-scroll-mt">
      <SectionHead no="04" title="Spend Policies" sub="Rules enforced automatically at the point of authorisation — no chasing receipts afterwards.">
        <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "policy" })}>Policy detail</Btn>
      </SectionHead>
      <Reveal>
        <div className="pmc-card p-4">
          <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
            {policies.map((p) => (
              <li
                key={p.id}
                className="d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius p-3"
                style={p.enabled ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
              >
                <span className={cn("pmc-icon-sq d-grid flex-none", p.enabled ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: p.enabled ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                  <Icon name={p.icon} size={16} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{p.title}</p>
                  <p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{p.desc}</p>
                </div>
                <Badge tone={p.enabled ? "success" : "muted"} dot>{p.enabled ? "Enforced" : "Off"}</Badge>
                <Toggle on={p.enabled} label={p.title} onChange={() => togglePolicy(p.id)} />
              </li>
            ))}
          </ul>
          <p className="pmc-note pmc-note-canvas pmc-mt-3 mb-0">
            <Icon name="info" size={13} className="flex-none pmc-blue" style={{ marginTop: 2 }} />
            Policy changes take effect on the next authorisation and apply retrospectively to future charges only.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 05 · Approvals & violations ============ */

export function ApprovalsSection() {
  const { violations, resolveViolation, openModal, toast } = useApp();
  const [tab, setTab] = useState<"approvals" | "violations">("approvals");
  const approvals = SEED_APPROVALS;

  return (
    <section id="approvals" className="pmc-scroll-mt">
      <SectionHead no="05" title="Approvals & Violations" sub="Requests waiting on you and policy breaches caught at authorisation time.">
        <Btn size="sm" variant="outline" icon="flag" onClick={() => toast("info", "Weekly compliance digest", "A summary of approvals and violations will be emailed every Monday 08:00.")}>Digest</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        <Chip on={tab === "approvals"} onClick={() => setTab("approvals")} count={approvals.length}>Pending approvals</Chip>
        <Chip on={tab === "violations"} onClick={() => setTab("violations")} count={violations.length}>Policy violations</Chip>
      </div>

      {tab === "approvals" ? (
        approvals.length === 0 ? (
          <Empty icon="checkCircle" title="Nothing awaiting approval" sub="Requests above policy caps will appear here for sign-off." />
        ) : (
          <div className="row pmc-g-3">
            {approvals.map((a, i) => (
              <div key={a.id} className="col-12 col-lg-6">
                <Reveal delay={i * 70} className="h-100">
                  <div className="pmc-card pmc-lift p-4 h-100" style={{ border: "1px solid rgba(247,144,9,0.35)", background: "rgba(255,250,235,0.35)" }}>
                    <div className="d-flex align-items-start pmc-gap-3">
                      <span className="pmc-icon-sq d-grid flex-none" style={{ width: 40, height: 40, background: "rgba(247,144,9,0.15)", color: "#93370d" }}><Icon name="flag" size={18} /></span>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="d-flex flex-wrap align-items-center pmc-gap-2 pmc-fs-135 fw-bold pmc-ink mb-0">{a.merchant}</p>
                        <p className="pmc-mt-05 pmc-fs-115 fw-semibold pmc-muted mb-0">{a.requester} · {deptName(a.deptId)} · {a.requestedAgo}</p>
                        <Badge tone="warning" className="pmc-mt-15">{a.reason}</Badge>
                      </div>
                      <p className="pmc-num pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">{kesShort(a.amount)}</p>
                    </div>
                    <div className="pmc-mt-3 d-flex flex-wrap pmc-gap-2" style={{ borderTop: "1px solid rgba(247,144,9,0.25)", paddingTop: 12 }}>
                      <Btn size="sm" icon="check" onClick={() => { toast("success", "Request approved", `${kes(a.amount)} to ${a.merchant} unlocked for ${a.requester}.`); }}>Approve</Btn>
                      <Btn size="sm" variant="outline" onClick={() => toast("warn", "Request declined", `${a.requester} has been notified.`)}>Decline</Btn>
                      <Btn size="sm" variant="outline" icon="chevRight" className="ms-auto" onClick={() => openModal({ type: "approve", approvalId: a.id })}>Details</Btn>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        )
      ) : violations.length === 0 ? (
        <Empty icon="shieldCheck" title="No open violations" sub="Policy breaches you resolve will disappear from this list." />
      ) : (
        <Reveal>
          <div className="pmc-table-frame">
            <div className="d-none d-md-block">
              <table className="pmc-table w-100 text-start">
                <thead>
                  <tr>
                    <th className="pmc-px-4 pmc-py-25">Employee Card</th>
                    <th className="pmc-px-3 pmc-py-25">Merchant</th>
                    <th className="pmc-px-3 pmc-py-25">Violation</th>
                    <th className="pmc-px-3 pmc-py-25 text-end">Amount</th>
                    <th className="pmc-px-4 pmc-py-25 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v) => (
                    <tr key={v.id}>
                      <td className="pmc-px-4 pmc-py-3">
                        <p className="fw-bold pmc-ink mb-0">•••• {v.last4} ({v.holder})</p>
                        <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{v.date}</p>
                      </td>
                      <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{v.merchant}</td>
                      <td className="pmc-px-3 pmc-py-3"><Badge tone={v.severity === "high" ? "danger" : "warning"} dot>{v.violation}</Badge></td>
                      <td className="pmc-num pmc-px-3 pmc-py-3 text-end pmc-display fw-bold pmc-ink">{kes(v.amount)}</td>
                      <td className="pmc-px-4 pmc-py-3">
                        <div className="d-flex justify-content-end pmc-gap-15">
                          <Btn size="sm" variant="outline" onClick={() => resolveViolation(v.id, "warn")}>Warn</Btn>
                          <Btn size="sm" variant="dangerGhost" onClick={() => resolveViolation(v.id, "card")}>Freeze card</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="pmc-mobile-list d-md-none">
              {violations.map((v) => (
                <li key={v.id}>
                  <div className="w-100">
                    <div className="d-flex align-items-start pmc-gap-3">
                      <span className="pmc-icon-sq d-grid flex-none" style={{ background: "var(--pmc-danger-soft)", color: "#b42318" }}><Icon name="alertTri" size={15} /></span>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="pmc-fs-13 fw-bold pmc-ink mb-0">{v.merchant}</p>
                        <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {v.last4} · {v.holder} · {v.date}</p>
                        <Badge tone={v.severity === "high" ? "danger" : "warning"} className="pmc-mt-1">{v.violation}</Badge>
                      </div>
                      <p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">{kesShort(v.amount)}</p>
                    </div>
                    <div className="pmc-mt-2 d-flex pmc-gap-2">
                      <Btn size="sm" variant="outline" onClick={() => resolveViolation(v.id, "warn")}>Warn</Btn>
                      <Btn size="sm" variant="dangerGhost" onClick={() => resolveViolation(v.id, "card")}>Freeze card</Btn>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/* ============ 06 · Billing & settlement ============ */

export function BillingSection() {
  const { billing, openModal } = useApp();
  const liability = LIABILITY_MODELS.find((l) => l.id === billing.liability) ?? LIABILITY_MODELS[0];

  return (
    <section id="program-billing" className="pmc-scroll-mt">
      <SectionHead no="06" title="Billing & Settlement" sub="Who settles the bill, when the cycle closes, and how payment is collected.">
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "billing" })}>Edit Configuration</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Programme configuration</p>
            <div className="overflow-hidden pmc-radius" style={{ border: "1px solid var(--pmc-line)" }}>
              {[
                ["Liability Model", liability.title, liability.blurb],
                ["Billing Cycle End Date", `Day ${billing.cycleEndDay} of each month`, "Statement generated the following day"],
                ["Auto-Debit Settlement", billing.autoDebit ? "Enabled" : "Disabled", billing.autoDebit ? `${billing.minPaymentPct}% of the statement` : "Manual transfer required"],
                ["Settlement Grace Period", `${billing.graceDays} days`, billing.graceDays === 0 ? "No grace — late fee applies immediately" : "Late fee applies after grace elapses"],
                ["Settlement Account", billing.settlementAccount, "Primary funding source for settlement"],
              ].map(([k, v, note], i) => (
                <div key={k} className="d-flex flex-wrap align-items-center pmc-gap-2 px-4 pmc-py-3" style={{ background: i % 2 === 0 ? "rgba(242,244,248,0.5)" : "#fff" }}>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{k}</p>
                    <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{note}</p>
                  </div>
                  <Badge tone={i === 2 ? (billing.autoDebit ? "success" : "warning") : "muted"}>{v}</Badge>
                </div>
              ))}
            </div>
            <div className="pmc-mt-3 pmc-radius p-3" style={{ background: "rgba(231,248,239,0.5)" }}>
              <p className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold mb-0" style={{ color: "#067647" }}><Icon name="checkCircle" size={13} /> Settlement is up to date</p>
              <p className="pmc-mt-1 pmc-fs-11 mb-0" style={{ color: "rgba(6,119,71,0.8)", lineHeight: 1.6 }}>Next auto-debit runs on day {billing.cycleEndDay + 1}. No outstanding programme balance.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Liability model comparison</p>
              <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
                {LIABILITY_MODELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => openModal({ type: "billing" })}
                    className="pmc-focus w-100 pmc-radius p-3 text-start"
                    style={l.id === billing.liability ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
                  >
                    <p className="d-flex align-items-center justify-content-between pmc-fs-125 fw-bold pmc-ink mb-0">
                      {l.title}
                      {l.id === billing.liability && <Badge tone="success">Current</Badge>}
                    </p>
                    <p className="pmc-mt-05 pmc-fs-11 pmc-muted mb-0">{l.blurb}</p>
                  </button>
                ))}
              </ul>
            </div>
            <div className="pmc-card p-4 flex-grow-1">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Programme at a glance</p>
              <div className="row g-2">
                {[
                  ["Companies", String(PROGRAM_STATS.companies)],
                  ["Employee cards", PROGRAM_STATS.employeeCards.toLocaleString()],
                  ["B2B spend MTD", kesShort(PROGRAM_STATS.b2bSpendMtd)],
                  ["Departments", String(PROGRAM_STATS.activeDepartments)],
                ].map(([k, v]) => (
                  <div key={k} className="col-6">
                    <div className="pmc-radius pmc-p-25 text-center h-100" style={{ background: "rgba(242,244,248,0.7)" }}>
                      <p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{v}</p>
                      <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{k}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="pmc-mt-3 pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.6 }}>Corporate spend represents <strong className="pmc-ink">34%</strong> of total dashboard volume with highly profitable interchange margins.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Modals
   ============================================================ */

/* ============ Billing configuration modal (original 5.6 fields) ============ */

export function BillingModal() {
  const { modal, closeModal, billing, saveBilling } = useApp();
  const open = modal?.type === "billing";
  const [b, setB] = useState<BillingConfig>(billing);

  useEffect(() => {
    if (open) setB(billing);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const set = (patch: Partial<BillingConfig>) => setB((prev) => ({ ...prev, ...patch }));

  const nextDate = new Date(2026, 5, b.cycleEndDay + 1);
  const dueLabel = `${nextDate.getDate()} ${nextDate.toLocaleString("en-KE", { month: "short" })} 2026`;

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="wallet"
      title="Programme Billing & Settlement"
      subtitle="Who settles the bill, when the cycle closes, and how payment is collected."
      width="max-w-xl"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn icon="check" onClick={() => { saveBilling(b); closeModal(); }}>Save Configuration</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-4">
        <div>
          <FieldLabel>Liability Model</FieldLabel>
          <div className="d-flex flex-column pmc-gap-15">
            {LIABILITY_MODELS.map((l) => (
              <button key={l.id} type="button" onClick={() => set({ liability: l.id as LiabilityModel })} className={cn("pmc-focus pmc-choice", b.liability === l.id && "on")} style={{ padding: 12 }}>
                <span className="d-grid flex-none" style={{ width: 16, height: 16, marginTop: 4, borderRadius: 99, border: `2px solid ${b.liability === l.id ? "var(--pmc-green)" : "#d0d5dd"}`, placeItems: "center" }}>
                  {b.liability === l.id && <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--pmc-green)" }} />}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="d-block pmc-fs-13 fw-bold pmc-ink">{l.title} — {l.blurb}</span>
                  <span className="d-block pmc-mt-05 pmc-fs-11 pmc-muted" style={{ lineHeight: 1.35 }}>{l.detail}</span>
                  <span className="d-block pmc-mt-1 pmc-fs-105 fw-bold pmc-green-dark">{l.risk}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel hint="Statement issued the next day">Billing Cycle End Date</FieldLabel>
          <div className="d-flex flex-wrap pmc-gap-2">
            {CYCLE_DAY_OPTIONS.map((d) => (
              <button key={d} type="button" onClick={() => set({ cycleEndDay: d })} className={cn("pmc-focus pmc-rect-choice pmc-num pmc-display", b.cycleEndDay === d && "on")}>
                Day {d}
              </button>
            ))}
          </div>
        </div>

        <div
          className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-p-35"
          style={b.autoDebit ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
        >
          <span className={cn("pmc-icon-sq d-grid flex-none", b.autoDebit ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: b.autoDebit ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}><Icon name="refresh" size={16} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Auto-Debit Settlement</p>
            <p className="pmc-fs-11 pmc-muted mb-0">Automatically debit the settlement account on the due date.</p>
          </div>
          <Toggle on={b.autoDebit} label="Auto-debit settlement" onChange={(v) => set({ autoDebit: v })} />
        </div>

        {b.autoDebit && (
          <div>
            <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
              <FieldLabel>Auto-debit amount</FieldLabel>
              <span className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink">{b.minPaymentPct}% of statement</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={b.minPaymentPct} onChange={(e) => set({ minPaymentPct: Number(e.target.value) })} className="form-range w-100" aria-label="Auto-debit percentage" />
            <div className="pmc-mt-1 d-flex justify-content-between pmc-fs-10 fw-semibold pmc-faint"><span>10% minimum</span><span>100% full balance</span></div>
          </div>
        )}

        <div>
          <FieldLabel>Settlement Grace Period</FieldLabel>
          <div className="d-flex flex-wrap pmc-gap-2">
            {GRACE_OPTIONS.map((g) => (
              <button key={g} type="button" onClick={() => set({ graceDays: g })} className={cn("pmc-focus pmc-rect-choice", b.graceDays === g && "on")}>
                {g === 0 ? "None" : `${g} days`}
              </button>
            ))}
          </div>
          <p className="pmc-mt-15 pmc-fs-11 pmc-muted mb-0">Late settlement fees apply once the grace period elapses.</p>
        </div>

        <div>
          <FieldLabel>Settlement account</FieldLabel>
          <select value={b.settlementAccount} onChange={(e) => set({ settlementAccount: e.target.value })} className="form-select pmc-focus pmc-fs-125 fw-bold">
            {SETTLEMENT_ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="pmc-radius pmc-p-35 text-white" style={{ border: "1px solid var(--pmc-line)", background: "var(--pmc-ink)" }}>
          <p className="pmc-fs-105 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Summary</p>
          <div className="pmc-mt-15 d-flex flex-column pmc-gap-1" style={{ fontSize: 12 }}>
            <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Cycle closes</span><span className="fw-bold">Day {b.cycleEndDay} monthly</span></p>
            <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Auto-debit</span><span className="fw-bold">{b.autoDebit ? `${dueLabel} · ${b.minPaymentPct}%` : "Off — manual"}</span></p>
            <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Grace</span><span className="fw-bold">{b.graceDays === 0 ? "None" : `${b.graceDays} days`}</span></p>
            <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>From</span><span className="fw-bold">{b.settlementAccount.split("·")[0].trim()}</span></p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Issue employee card modal ============ */

export function InviteEmployeeModal() {
  const { modal, closeModal, toast, pushNotif } = useApp();
  const open = modal?.type === "inviteEmployee";
  const [name, setName] = useState("");
  const [dept, setDept] = useState("Fleet Management");
  const [cardType, setCardType] = useState("Corporate Physical");
  const [limit, setLimit] = useState(60000);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(""); setDept("Fleet Management"); setCardType("Corporate Physical"); setLimit(60000); setEmail(""); setPin(""); setDone(false);
  }, [open]);

  if (!open) return null;
  const valid = name.trim().length > 2 && email.includes("@") && pin.length === 4;

  const depts = ["Fleet Management", "Sales & Marketing", "Executive Travel", "Operations"];
  const cardTypes = [
    { id: "Corporate Physical", sub: "Tap in-store · KES 450", icon: "card" as IconName },
    { id: "Virtual Corporate", sub: "Instant · online only · Free", icon: "zap" as IconName },
    { id: "Premium Travel", sub: "Lounge + best FX · KES 1,000", icon: "spark" as IconName },
  ];

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="users"
      title={done ? "Employee card issued" : "Issue an employee card"}
      subtitle={done ? undefined : "The cardholder gets an invite to activate their card in the PayMo app."}
      width="max-w-lg"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="lock" disabled={!valid} onClick={() => {
              setDone(true);
              toast("success", "Employee card issued", `${name} has been invited to activate their ${cardType}.`);
              pushNotif({ channel: "email", title: "Cardholder invited", body: `${name} (${dept}) — ${cardType} with a ${kes(limit)} monthly limit.` });
            }}>Issue Card</Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 py-4 text-center">
          <span className="pmc-done-icon d-grid"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{name} has been invited</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 300, lineHeight: 1.6 }}>They'll receive an activation email at {email}. The card appears under Employee Cards once activated.</p>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div>
            <FieldLabel>Cardholder name</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Wanjiru" className="form-control pmc-focus fw-bold" />
          </div>
          <div>
            <FieldLabel>Work email</FieldLabel>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@acmetraders.co.ke" className="form-control pmc-focus fw-bold" />
          </div>
          <div>
            <FieldLabel>Department</FieldLabel>
            <div className="d-flex flex-wrap pmc-gap-2">
              {depts.map((d) => (
                <button key={d} type="button" onClick={() => setDept(d)} className={cn("pmc-focus pmc-pill-choice", dept === d && "on")}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Card type</FieldLabel>
            <div className="d-flex flex-column pmc-gap-15">
              {cardTypes.map((c) => (
                <button key={c.id} type="button" onClick={() => setCardType(c.id)} className={cn("pmc-focus pmc-choice", cardType === c.id && "on")} style={{ padding: "10px 14px" }}>
                  <span className={cn("pmc-icon-sq d-grid flex-none", cardType === c.id ? "pmc-tone-green-solid" : "pmc-tone-muted")} style={{ width: 32, height: 32, borderRadius: 8 }}><Icon name={c.icon} size={15} /></span>
                  <span className="flex-grow-1"><span className="d-block pmc-fs-125 fw-bold pmc-ink">{c.id}</span><span className="d-block pmc-fs-105 pmc-muted">{c.sub}</span></span>
                  {cardType === c.id && <Icon name="check" size={15} className="pmc-green" strokeWidth={2.6} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
              <FieldLabel>Monthly limit</FieldLabel>
              <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(limit)}</span>
            </div>
            <input type="range" min={5000} max={300000} step={5000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="form-range w-100" aria-label="Monthly limit" />
          </div>
          <div>
            <FieldLabel hint="Authorises issuance">Enter your PayMo PIN</FieldLabel>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="pmc-focus pmc-pin-input"
              style={{ letterSpacing: "0.5em" }}
            />
          </div>
          <p className="pmc-note pmc-note-canvas mb-0">
            Active spend policies apply automatically. The cardholder cannot exceed {kes(limit)} per month.
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ============ Approval detail modal ============ */

export function ApprovalModal() {
  const { modal, closeModal, toast } = useApp();
  const open = modal?.type === "approve";
  const approval = SEED_APPROVALS.find((a) => a.id === (modal?.type === "approve" ? modal.approvalId : ""));
  if (!open || !approval) return null;

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="flag"
      title="Approval request"
      subtitle="Review the request against department budget and policy before deciding."
      width="max-w-lg"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Close</Btn>
          <Btn variant="dangerGhost" icon="x" onClick={() => { toast("warn", "Request declined", `${approval.requester} has been notified.`); closeModal(); }}>Decline</Btn>
          <Btn icon="check" onClick={() => { toast("success", "Request approved", `${kes(approval.amount)} to ${approval.merchant} unlocked.`); closeModal(); }}>Approve</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-4">
        <div className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-p-35" style={{ border: "1px solid rgba(247,144,9,0.35)", background: "rgba(255,250,235,0.4)" }}>
          <span className="pmc-icon-sq d-grid flex-none" style={{ width: 40, height: 40, background: "#fff", color: "#93370d", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" }}><Icon name="flag" size={17} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <p className="pmc-fs-135 fw-bold pmc-ink mb-0">{approval.merchant}</p>
            <p className="pmc-fs-115 fw-semibold pmc-muted mb-0">{approval.requester} · {approval.requestedAgo}</p>
          </div>
          <p className="pmc-num pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">{kes(approval.amount)}</p>
        </div>
        <div className="overflow-hidden pmc-radius" style={{ border: "1px solid var(--pmc-line)" }}>
          {[
            ["Department", deptName(approval.deptId)],
            ["Reason for review", approval.reason],
            ["Requested amount", kes(approval.amount)],
            ["Department budget left", kes(180000)],
            ["Budget after approval", kes(180000 - approval.amount)],
          ].map(([k, v]) => (
            <div key={k} className="pmc-kv">
              <span className="fw-semibold pmc-muted">{k}</span>
              <span className="text-end fw-bold pmc-ink">{v}</span>
            </div>
          ))}
        </div>
        <p className="pmc-note pmc-note-canvas mb-0">
          Approving raises this card's per-transaction ceiling for 24 hours only. The standing policy stays unchanged.
        </p>
      </div>
    </Modal>
  );
}

/* ============ Policy detail modal ============ */

export function PolicyModal() {
  const { modal, closeModal, policies, togglePolicy } = useApp();
  const open = modal?.type === "policy";
  if (!open) return null;
  return (
    <Modal open={open} onClose={closeModal} icon="shield" title="Spend policy detail" subtitle="Toggle rules on or off. Changes apply to the next authorisation." width="max-w-lg" footer={<Btn onClick={closeModal}>Done</Btn>}>
      <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
        {policies.map((p) => (
          <li
            key={p.id}
            className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
            style={p.enabled ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
          >
            <span className={cn("pmc-icon-sq d-grid flex-none", p.enabled ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: p.enabled ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}><Icon name={p.icon} size={16} /></span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{p.title}</p>
              <p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{p.desc}</p>
            </div>
            <Toggle on={p.enabled} label={p.title} onChange={() => togglePolicy(p.id)} />
          </li>
        ))}
      </ul>
    </Modal>
  );
}
