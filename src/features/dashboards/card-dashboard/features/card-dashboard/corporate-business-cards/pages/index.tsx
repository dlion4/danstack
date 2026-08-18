import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp } from "../../../../lib";
import { kes, kesShort } from "../../../../lib";
import {
  CYCLE_DAY_OPTIONS,
  GRACE_OPTIONS,
  LIABILITY_MODELS,
  PROGRAM_STATS,
  SEED_APPROVALS,
  SETTLEMENT_ACCOUNTS,
  type BillingConfig,
  type LiabilityModel,
} from "../../../../lib";

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
    <section id="overview" className="scroll-mt-24">
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Cards
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.6</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                 Business Cards
              </h1>
              <p className="mt-2 max-w-[510px] text-[13px] leading-relaxed text-white/65">
                Run multi-department card programmes with central liability, controlled budgets,
                enforced spend policies and automated settlement — one programme, full visibility.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="users" onClick={() => openModal({ type: "inviteEmployee" })}>Issue Employee Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "billing" })}>Billing &amp; Settlement</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Departments", v: String(PROGRAM_STATS.activeDepartments) },
                  { k: "Employee cards", v: "32" },
                  { k: "B2B spend MTD", v: kesShort(PROGRAM_STATS.b2bSpendMtd) },
                  { k: "Open approvals", v: String(SEED_APPROVALS.length), warn: true },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className={cn("font-display num text-[17px] font-bold", s.warn ? "text-[#ffd27d]" : "text-white")}>{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[230px] w-[300px] flex-none md:block">
              <div className="absolute right-0 top-0 w-[240px] rotate-[6deg] rounded-2xl p-4 text-white shadow-[var(--shadow-card)]" style={{ background: "linear-gradient(118deg,#0b1322 0%,#123a2c 55%,#0d5c38 100%)" }}>
                <div className="pm-hero-dots absolute inset-0 rounded-2xl" />
                <p className="font-display relative text-[13px] font-bold">PayMo Corporate</p>
                <p className="relative mt-auto pt-12 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Company Liable</p>
                <p className="num relative font-display text-[16px] font-bold">KES 4.5M / mo</p>
              </div>
              <div className="absolute bottom-0 left-1 w-[240px] -rotate-[4deg] rounded-2xl p-4 text-white shadow-[var(--shadow-card)]" style={{ background: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)" }}>
                <div className="pm-hero-dots absolute inset-0 rounded-2xl" />
                <p className="font-display relative text-[13px] font-bold">Fleet Management</p>
                <p className="relative mt-auto pt-12 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">12 cards · 84% used</p>
                <div className="relative mt-1.5 h-[4px] overflow-hidden rounded-full bg-white/25"><span className="block h-full w-[84%] rounded-full bg-white/90" /></div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "building" as IconName, tone: "bg-pmgreen-soft text-[#067647]", label: "Departments", value: String(PROGRAM_STATS.activeDepartments), note: `${PROGRAM_STATS.employeeCards.toLocaleString()} cards programme-wide`, spark: [2, 2, 3, 3, 4, 4, 4, 4], stroke: "#12b76a" },
          { icon: "wallet" as IconName, tone: "bg-pmblue-soft text-[#175cd3]", label: "B2B Spend MTD", value: kesShort(PROGRAM_STATS.b2bSpendMtd), note: "76% of allocated budget", spark: [22, 28, 33, 40, 46, 52, 58, 63], stroke: "#2e90fa" },
          { icon: "shield" as IconName, tone: "bg-pmviolet-soft text-[#5925dc]", label: "Active Policies", value: `${activePolicies}/${policies.length}`, note: "Enforced on every card", spark: [3, 3, 4, 4, 5, 5, 5, 5], stroke: "#7a5af8" },
          { icon: "flag" as IconName, tone: "bg-warn-soft text-[#93370d]", label: "Pending Approvals", value: String(SEED_APPROVALS.length), note: `${kesShort(418000)} awaiting sign-off`, spark: [1, 2, 2, 3, 2, 3, 3, 3], stroke: "#f79009", action: () => document.getElementById("approvals")?.scrollIntoView({ behavior: "smooth" }) },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <button onClick={k.action} className={cn("group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200", k.action ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-pm-lg" : "cursor-default")}>
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}><Icon name={k.icon} size={19} /></span>
                <Spark points={k.spark} stroke={k.stroke} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[22px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-faint">{k.note}</p>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Liability summary */}
      <Reveal delay={100}>
        <div className="mt-4 rounded-2xl border border-line bg-white p-4 shadow-pm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-pmgreen-soft text-[#067647]"><Icon name="shieldCheck" size={18} /></span>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">Current liability model</p>
                <p className="font-display text-[15px] font-bold text-ink">{liability.title} — {liability.blurb}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success" dot>Cycle ends day {billing.cycleEndDay}</Badge>
              <Badge tone={billing.autoDebit ? "info" : "warning"}>{billing.autoDebit ? "Auto-debit on" : "Manual settlement"}</Badge>
              <Badge tone="muted">{billing.graceDays}-day grace</Badge>
              <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "billing" })}>Change</Btn>
            </div>
          </div>
          <p className="mt-2.5 rounded-lg bg-canvas/70 px-3 py-2 text-[11.5px] leading-relaxed text-muted">{liability.detail} <span className="font-bold text-ink">{liability.risk}.</span></p>
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
    <section id="departments" className="scroll-mt-24">
      <SectionHead  title="Departments & Budgets" sub="Each department gets its own card pool, budget ceiling and cardholder list.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Department report exported", `${depts.length} departments written to departments.csv`)}>Export</Btn>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "inviteEmployee" })}>Add Cardholder</Btn>
      </SectionHead>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { k: "Allocated monthly", v: kes(totalBudget), tone: "text-ink" },
          { k: "Spent MTD", v: kes(totalSpent), tone: "text-[#175cd3]" },
          { k: "Utilisation", v: `${Math.round((totalSpent / totalBudget) * 100)}%`, tone: "text-[#067647]" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">{s.k}</p>
            <p className={cn("num font-display mt-1 text-[20px] font-bold tracking-tight", s.tone)}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {depts.map((d, i) => {
          const pct = Math.round((d.spentMonth / d.budgetMonth) * 100);
          const over = pct > 85;
          return (
            <Reveal key={d.id} delay={i * 70}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: d.tone }}><Icon name={d.icon} size={18} /></span>
                  <Badge tone={over ? "danger" : pct > 60 ? "warning" : "success"} dot>{pct}%</Badge>
                </div>
                <p className="font-display mt-3 text-[14px] font-bold tracking-tight text-ink">{d.name}</p>
                <p className="text-[11px] font-semibold text-faint">{d.lead}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
                    <span className="num">{kesShort(d.spentMonth)}</span>
                    <span className="num">of {kesShort(d.budgetMonth)}</span>
                  </div>
                  <Progress value={pct} tone={over ? "red" : pct > 60 ? "amber" : "green"} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
                  <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-muted"><Icon name="card" size={13} /> {d.cards} cards</span>
                  <button onClick={() => openModal({ type: "inviteEmployee" })} className="text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">Add card →</button>
                </div>
              </div>
            </Reveal>
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
    <section id="employees" className="scroll-mt-24">
      <SectionHead  title="Employee Cards" sub="Every cardholder, their department, their card and how much of their limit is used.">
        <div className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a cardholder…" className="focus-ring w-[190px] rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-[12.5px] font-semibold outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50" />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "inviteEmployee" })}>Issue Card</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
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
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                    <th className="px-4 py-2.5">Cardholder</th>
                    <th className="px-3 py-2.5">Department</th>
                    <th className="px-3 py-2.5">Card</th>
                    <th className="px-3 py-2.5 w-[160px]">Limit used</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {shown.map((e) => {
                    const pct = Math.round((e.spent / e.limit) * 100);
                    return (
                      <tr key={e.id} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink font-display text-[10.5px] font-bold text-pmgreen">
                              {e.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                            <div className="leading-tight">
                              <p className="font-bold text-ink">{e.name}</p>
                              <p className="text-[10.5px] font-semibold text-faint">{e.role} · •• {e.last4}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-semibold text-muted">{e.dept}</td>
                        <td className="px-3 py-3">
                          <Badge tone={e.card.includes("Virtual") ? "violet" : e.card.includes("Premium") ? "success" : "muted"}>{e.card}</Badge>
                          {e.status === "delivering" && <Badge tone="warning" className="ml-1">In delivery</Badge>}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} className="w-[100px]" />
                            <span className="num text-[11px] font-bold text-muted">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "limits", cardId: e.id })}>Limits</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/70 md:hidden">
              {shown.map((e) => {
                const pct = Math.round((e.spent / e.limit) * 100);
                return (
                  <li key={e.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-ink font-display text-[11px] font-bold text-pmgreen">{e.name.split(" ").map((n) => n[0]).join("")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-ink">{e.name}</p>
                        <p className="text-[10.5px] font-semibold text-faint">{e.dept} · •• {e.last4}</p>
                      </div>
                      <Btn size="sm" variant="outline" onClick={() => openModal({ type: "limits", cardId: e.id })}>Limits</Btn>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} />
                      <span className="num text-[11px] font-bold text-faint">{pct}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-line bg-canvas/60 px-4 py-2.5">
              <p className="text-[11.5px] font-bold text-muted">{shown.length} cardholder{shown.length === 1 ? "" : "s"}</p>
              <p className="num text-[11.5px] font-bold text-muted">Combined limits · <span className="font-display text-[13px] text-ink">{kesShort(shown.reduce((s, e) => s + e.limit, 0))}</span></p>
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
    <section id="policies" className="scroll-mt-24">
      <SectionHead  title="Spend Policies" sub="Rules enforced automatically at the point of authorisation — no chasing receipts afterwards.">
        <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "policy" })}>Policy detail</Btn>
      </SectionHead>
      <Reveal>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
          <ul className="space-y-2">
            {policies.map((p) => (
              <li key={p.id} className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-3 transition", p.enabled ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/40")}>
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", p.enabled ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}>
                  <Icon name={p.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{p.title}</p>
                  <p className="text-[11px] leading-snug text-muted">{p.desc}</p>
                </div>
                <Badge tone={p.enabled ? "success" : "muted"} dot>{p.enabled ? "Enforced" : "Off"}</Badge>
                <Toggle on={p.enabled} label={p.title} onChange={() => togglePolicy(p.id)} />
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-muted">
            <Icon name="info" size={13} className="mt-0.5 flex-none text-pmblue" />
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
    <section id="approvals" className="scroll-mt-24">
      <SectionHead  title="Approvals & Violations" sub="Requests waiting on you and policy breaches caught at authorisation time.">
        <Btn size="sm" variant="outline" icon="flag" onClick={() => toast("info", "Weekly compliance digest", "A summary of approvals and violations will be emailed every Monday 08:00.")}>Digest</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip on={tab === "approvals"} onClick={() => setTab("approvals")} count={approvals.length}>Pending approvals</Chip>
        <Chip on={tab === "violations"} onClick={() => setTab("violations")} count={violations.length}>Policy violations</Chip>
      </div>

      {tab === "approvals" ? (
        approvals.length === 0 ? (
          <Empty icon="checkCircle" title="Nothing awaiting approval" sub="Requests above policy caps will appear here for sign-off." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {approvals.map((a, i) => (
              <Reveal key={a.id} delay={i * 70}>
                <div className="rounded-2xl border border-warn/35 bg-warn-soft/35 p-4 shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-warn/15 text-[#93370d]"><Icon name="flag" size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold text-ink">{a.merchant}</p>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-muted">{a.requester} · {deptName(a.deptId)} · {a.requestedAgo}</p>
                      <Badge tone="warning" className="mt-1.5">{a.reason}</Badge>
                    </div>
                    <p className="num font-display text-[16px] font-bold text-ink">{kesShort(a.amount)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-warn/25 pt-3">
                    <Btn size="sm" icon="check" onClick={() => { toast("success", "Request approved", `${kes(a.amount)} to ${a.merchant} unlocked for ${a.requester}.`); }}>Approve</Btn>
                    <Btn size="sm" variant="outline" onClick={() => toast("warn", "Request declined", `${a.requester} has been notified.`)}>Decline</Btn>
                    <Btn size="sm" variant="outline" icon="chevRight" className="ml-auto" onClick={() => openModal({ type: "approve", approvalId: a.id })}>Details</Btn>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )
      ) : violations.length === 0 ? (
        <Empty icon="shieldCheck" title="No open violations" sub="Policy breaches you resolve will disappear from this list." />
      ) : (
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                    <th className="px-4 py-2.5">Employee Card</th>
                    <th className="px-3 py-2.5">Merchant</th>
                    <th className="px-3 py-2.5">Violation</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {violations.map((v) => (
                    <tr key={v.id} className="text-[12.5px] transition hover:bg-danger-soft/15">
                      <td className="px-4 py-3">
                        <p className="font-bold text-ink">•••• {v.last4} ({v.holder})</p>
                        <p className="text-[10.5px] font-semibold text-faint">{v.date}</p>
                      </td>
                      <td className="px-3 py-3 font-semibold text-muted">{v.merchant}</td>
                      <td className="px-3 py-3"><Badge tone={v.severity === "high" ? "danger" : "warning"} dot>{v.violation}</Badge></td>
                      <td className="num px-3 py-3 text-right font-display font-bold text-ink">{kes(v.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Btn size="sm" variant="outline" onClick={() => resolveViolation(v.id, "warn")}>Warn</Btn>
                          <Btn size="sm" variant="dangerGhost" onClick={() => resolveViolation(v.id, "card")}>Freeze card</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/70 md:hidden">
              {violations.map((v) => (
                <li key={v.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-danger-soft text-[#b42318]"><Icon name="alertTri" size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-ink">{v.merchant}</p>
                      <p className="text-[10.5px] font-semibold text-faint">•• {v.last4} · {v.holder} · {v.date}</p>
                      <Badge tone={v.severity === "high" ? "danger" : "warning"} className="mt-1">{v.violation}</Badge>
                    </div>
                    <p className="num font-display text-[13.5px] font-bold text-ink">{kesShort(v.amount)}</p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Btn size="sm" variant="outline" onClick={() => resolveViolation(v.id, "warn")}>Warn</Btn>
                    <Btn size="sm" variant="dangerGhost" onClick={() => resolveViolation(v.id, "card")}>Freeze card</Btn>
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
    <section id="program-billing" className="scroll-mt-24">
      <SectionHead  title="Billing & Settlement" sub="Who settles the bill, when the cycle closes, and how payment is collected.">
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "billing" })}>Edit Configuration</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Programme configuration</p>
            <div className="overflow-hidden rounded-xl border border-line">
              {[
                ["Liability Model", liability.title, liability.blurb],
                ["Billing Cycle End Date", `Day ${billing.cycleEndDay} of each month`, "Statement generated the following day"],
                ["Auto-Debit Settlement", billing.autoDebit ? "Enabled" : "Disabled", billing.autoDebit ? `${billing.minPaymentPct}% of the statement` : "Manual transfer required"],
                ["Settlement Grace Period", `${billing.graceDays} days`, billing.graceDays === 0 ? "No grace — late fee applies immediately" : "Late fee applies after grace elapses"],
                ["Settlement Account", billing.settlementAccount, "Primary funding source for settlement"],
              ].map(([k, v, note], i) => (
                <div key={k} className={cn("flex flex-wrap items-center gap-2 px-4 py-3", i % 2 === 0 ? "bg-canvas/50" : "bg-white")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{k}</p>
                    <p className="text-[10.5px] font-semibold text-faint">{note}</p>
                  </div>
                  <Badge tone={i === 2 ? (billing.autoDebit ? "success" : "warning") : "muted"}>{v}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-pmgreen-soft/50 p-3">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#067647]"><Icon name="checkCircle" size={13} /> Settlement is up to date</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#067647]/80">Next auto-debit runs on day {billing.cycleEndDay + 1}. No outstanding programme balance.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Liability model comparison</p>
              <ul className="space-y-2">
                {LIABILITY_MODELS.map((l) => (
                  <button key={l.id} onClick={() => openModal({ type: "billing" })} className={cn("w-full rounded-xl border p-3 text-left transition", l.id === billing.liability ? "border-pmgreen bg-pmgreen-soft/40" : "border-line bg-canvas/40 hover:border-[#c4c9d4]")}>
                    <p className="flex items-center justify-between text-[12.5px] font-bold text-ink">
                      {l.title}
                      {l.id === billing.liability && <Badge tone="success">Current</Badge>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{l.blurb}</p>
                  </button>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Programme at a glance</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Companies", String(PROGRAM_STATS.companies)],
                  ["Employee cards", PROGRAM_STATS.employeeCards.toLocaleString()],
                  ["B2B spend MTD", kesShort(PROGRAM_STATS.b2bSpendMtd)],
                  ["Departments", String(PROGRAM_STATS.activeDepartments)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-canvas/70 p-2.5 text-center">
                    <p className="num font-display text-[14px] font-bold text-ink">{v}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{k}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">Corporate spend represents <strong className="text-ink">34%</strong> of total dashboard volume with highly profitable interchange margins.</p>
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
      <div className="space-y-4">
        <div>
          <FieldLabel>Liability Model</FieldLabel>
          <div className="space-y-1.5">
            {LIABILITY_MODELS.map((l) => (
              <button key={l.id} onClick={() => set({ liability: l.id as LiabilityModel })} className={cn("flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition", b.liability === l.id ? "border-pmgreen bg-pmgreen-soft/45" : "border-line bg-white hover:border-[#c4c9d4]")}>
                <span className={cn("mt-1 grid h-4 w-4 flex-none place-items-center rounded-full border-2", b.liability === l.id ? "border-pmgreen" : "border-[#d0d5dd]")}>
                  {b.liability === l.id && <span className="h-2 w-2 rounded-full bg-pmgreen" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-ink">{l.title} — {l.blurb}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted">{l.detail}</span>
                  <span className="mt-1 block text-[10.5px] font-bold text-pmgreen-dark">{l.risk}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel hint="Statement issued the next day">Billing Cycle End Date</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CYCLE_DAY_OPTIONS.map((d) => (
              <button key={d} onClick={() => set({ cycleEndDay: d })} className={cn("num rounded-[10px] border-2 px-3.5 py-2 font-display text-[12.5px] font-bold transition", b.cycleEndDay === d ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>
                Day {d}
              </button>
            ))}
          </div>
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border p-3.5 transition", b.autoDebit ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/50")}>
          <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", b.autoDebit ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name="refresh" size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold text-ink">Auto-Debit Settlement</p>
            <p className="text-[11px] text-muted">Automatically debit the settlement account on the due date.</p>
          </div>
          <Toggle on={b.autoDebit} label="Auto-debit settlement" onChange={(v) => set({ autoDebit: v })} />
        </div>

        {b.autoDebit && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel>Auto-debit amount</FieldLabel>
              <span className="num font-display text-[14px] font-bold text-ink">{b.minPaymentPct}% of statement</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={b.minPaymentPct} onChange={(e) => set({ minPaymentPct: Number(e.target.value) })} className="w-full" aria-label="Auto-debit percentage" />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-faint"><span>10% minimum</span><span>100% full balance</span></div>
          </div>
        )}

        <div>
          <FieldLabel>Settlement Grace Period</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GRACE_OPTIONS.map((g) => (
              <button key={g} onClick={() => set({ graceDays: g })} className={cn("rounded-[10px] border-2 px-3 py-2 text-[12px] font-bold transition", b.graceDays === g ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>
                {g === 0 ? "None" : `${g} days`}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">Late settlement fees apply once the grace period elapses.</p>
        </div>

        <div>
          <FieldLabel>Settlement account</FieldLabel>
          <select value={b.settlementAccount} onChange={(e) => set({ settlementAccount: e.target.value })} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
            {SETTLEMENT_ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="rounded-xl border border-line bg-ink p-3.5 text-white">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">Summary</p>
          <div className="mt-1.5 space-y-1 text-[12px]">
            <p className="flex justify-between"><span className="text-white/70">Cycle closes</span><span className="font-bold">Day {b.cycleEndDay} monthly</span></p>
            <p className="flex justify-between"><span className="text-white/70">Auto-debit</span><span className="font-bold">{b.autoDebit ? `${dueLabel} · ${b.minPaymentPct}%` : "Off — manual"}</span></p>
            <p className="flex justify-between"><span className="text-white/70">Grace</span><span className="font-bold">{b.graceDays === 0 ? "None" : `${b.graceDays} days`}</span></p>
            <p className="flex justify-between"><span className="text-white/70">From</span><span className="font-bold">{b.settlementAccount.split("·")[0].trim()}</span></p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="font-display text-[15px] font-bold text-ink">{name} has been invited</p>
          <p className="max-w-[300px] text-[12.5px] leading-relaxed text-muted">They'll receive an activation email at {email}. The card appears under Employee Cards once activated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel>Cardholder name</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Wanjiru" className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px] font-bold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white" />
          </div>
          <div>
            <FieldLabel>Work email</FieldLabel>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@acmetraders.co.ke" className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px] font-bold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white" />
          </div>
          <div>
            <FieldLabel>Department</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {depts.map((d) => (
                <button key={d} onClick={() => setDept(d)} className={cn("rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition", dept === d ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Card type</FieldLabel>
            <div className="space-y-1.5">
              {cardTypes.map((c) => (
                <button key={c.id} onClick={() => setCardType(c.id)} className={cn("flex w-full items-center gap-3 rounded-[10px] border-2 px-3.5 py-2.5 text-left transition", cardType === c.id ? "border-pmgreen bg-pmgreen-soft/45" : "border-line bg-white hover:border-[#c4c9d4]")}>
                  <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-lg", cardType === c.id ? "bg-pmgreen text-white" : "bg-canvas text-muted")}><Icon name={c.icon} size={15} /></span>
                  <span className="flex-1"><span className="block text-[12.5px] font-bold text-ink">{c.id}</span><span className="block text-[10.5px] text-muted">{c.sub}</span></span>
                  {cardType === c.id && <Icon name="check" size={15} className="text-pmgreen" strokeWidth={2.6} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel>Monthly limit</FieldLabel>
              <span className="num font-display text-[15px] font-bold text-ink">{kes(limit)}</span>
            </div>
            <input type="range" min={5000} max={300000} step={5000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full" aria-label="Monthly limit" />
          </div>
          <div>
            <FieldLabel hint="Authorises issuance">Enter your PayMo PIN</FieldLabel>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-pmgreen focus:bg-white" />
          </div>
          <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
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
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-warn/35 bg-warn-soft/40 p-3.5">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-white text-[#93370d] shadow-sm"><Icon name="flag" size={17} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink">{approval.merchant}</p>
            <p className="text-[11.5px] font-semibold text-muted">{approval.requester} · {approval.requestedAgo}</p>
          </div>
          <p className="num font-display text-[16px] font-bold text-ink">{kes(approval.amount)}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-line">
          {[
            ["Department", deptName(approval.deptId)],
            ["Reason for review", approval.reason],
            ["Requested amount", kes(approval.amount)],
            ["Department budget left", kes(180000)],
            ["Budget after approval", kes(180000 - approval.amount)],
          ].map(([k, v], i) => (
            <div key={k} className={cn("flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
              <span className="font-semibold text-muted">{k}</span>
              <span className="text-right font-bold text-ink">{v}</span>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
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
      <ul className="space-y-2">
        {policies.map((p) => (
          <li key={p.id} className={cn("flex items-center gap-3 rounded-xl border p-3", p.enabled ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/40")}>
            <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", p.enabled ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name={p.icon} size={16} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-ink">{p.title}</p>
              <p className="text-[11px] leading-snug text-muted">{p.desc}</p>
            </div>
            <Toggle on={p.enabled} label={p.title} onChange={() => togglePolicy(p.id)} />
          </li>
        ))}
      </ul>
    </Modal>
  );
}
