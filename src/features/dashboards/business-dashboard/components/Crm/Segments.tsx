import { useEffect, useMemo, useState } from "react";
import {
  Users, Plus, Pencil, Trash2, Megaphone, Download, Search, CheckCircle2,
  GitBranch,
} from "lucide-react";
import type { CrmCustomer, SmartList } from "../../dataCrm";
import { CRM_FIELDS, segmentDefs, smartListsSeed } from "../../dataCrm";
import { cls, downloadCSV, fmt, todayISO, uid, type QAction } from "../../lib";
import { Avatar, Badge, Confirm, Field, Kpi, Modal, Section, SlideOver, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Segments({ customers, notify, qa, onConsume }: {
  customers: CrmCustomer[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [lists, setLists] = useState<SmartList[]>(smartListsSeed);
  const [detailSeg, setDetailSeg] = useState<string | null>(null);
  const [detailList, setDetailList] = useState<SmartList | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [delFor, setDelFor] = useState<SmartList | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "segment") { setDetailSeg("champions"); document.getElementById("sec-segments")?.scrollIntoView({ behavior: "smooth" }); }
    if (qa.a === "smartList") setWizardOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  /* segment resolution */
  const segCustomers = useMemo(() => {
    const map: Record<string, CrmCustomer[]> = {};
    map["champions"] = customers.filter((c) => c.tier === "vip");
    map["loyal"] = customers.filter((c) => c.avgDays <= 20 && c.totalInvoices >= 10 && c.tier !== "risk");
    map["new"] = customers.filter((c) => c.tier === "new");
    map["risk"] = customers.filter((c) => c.tier === "risk");
    map["lost"] = customers.filter((c) => c.lastInvoice && new Date(c.lastInvoice) < new Date(new Date().getTime() - 90 * 86400000));
    return map;
  }, [customers]);

  const evalList = (l: SmartList) => customers.filter((c) => l.rules.every((r) => {
    const v = r.field === "tags" ? c.tags.join(",").toLowerCase() : String((c as unknown as Record<string, unknown>)[r.field]);
    switch (r.op) {
      case ">": return Number(v) > Number(r.value);
      case "<": return Number(v) < Number(r.value);
      case "is": return String(v).toLowerCase() === r.value.toLowerCase();
      case "contains": return String(v).toLowerCase().includes(r.value.toLowerCase());
      default: return true;
    }
  }));

  const segStats = segmentDefs.map((s) => {
    const list = segCustomers[s.id] ?? [];
    return {
      ...s,
      count: list.length,
      revenue: list.reduce((x, c) => x + c.ltv, 0),
      bal: list.reduce((x, c) => x + c.balance, 0),
    };
  });

  const exportSeg = (s: (typeof segStats)[number]) => {
    const list = segCustomers[s.id] ?? [];
    downloadCSV(`segment-${s.name.toLowerCase().replace(/\W+/g, "-")}-${todayISO()}.csv`,
      [["Name", "Business", "Phone", "LTV", "Balance", "Avg pay"], ...list.map((c) => [c.name, c.business, c.phone, c.ltv, c.balance, c.avgDays])]);
    notify({ tone: "success", title: "Segment exported", body: `${s.name} · ${list.length} customer(s) saved as CSV.` });
  };

  return (
    <>
      <Section
        no="6.4" sub="Money In · Targeting" id="sec-segments"
        title="Segmentation & Targeting"
        right={
          <button className="btn pm-btn-primary" onClick={() => setWizardOpen(true)}><Plus size={15} /> New Smart List</button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Users size={16} />} label="Segment coverage" value={`${customers.length} customers`} delta={`${segmentDefs.length} segments`} sub="every customer fits one" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<GitBranch size={16} />} label="Smart lists" value={`${lists.length} lists`} delta="dynamic rules" sub="re-evaluated live" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Megaphone size={16} />} label="Campaign-ready" value={`${segStats[0].count + segStats[1].count} customers`} delta="VIP + loyal" sub="broadcast in one tap" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="At-risk value" value={fmt(segStats[3].bal)} delta={`${segStats[3].count} customers`} sub="recoverable with nudges" deltaTone="down" /></div>
        </div>

        {/* segment cards */}
        <div className="row g-3">
          {segStats.map((s) => (
            <div className="col-12 col-md-6 col-xl-4" key={s.id}>
              <div className="pm-card h-100" style={{ borderTop: `4px solid ${s.color}` }}>
                <div className="d-flex justify-content-between align-items-start">
                  <span className="pm-seg-icon" style={{ background: s.color + "1a" }}>{s.icon}</span>
                  <Badge tone={s.id === "risk" ? "warning" : s.id === "lost" ? "danger" : "success"}>{s.count} customers</Badge>
                </div>
                <div className="pm-card-title mt-2">{s.name}</div>
                <div className="pm-card-sub">{s.desc}</div>
                <div className="pm-seg-metrics">
                  <div><b>{fmt(s.revenue)}</b><span>combined LTV</span></div>
                  <div><b>{fmt(s.bal)}</b><span>outstanding</span></div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setDetailSeg(s.id)}>View list</button>
                  <button className="btn pm-btn-ghost btn-sm" onClick={() => notify({ tone: "info", title: `Broadcast to ${s.name}`, body: `${s.count} customer(s) — compose in the Communication Hub (6.2).` })}><Megaphone size={13} /></button>
                  <button className="btn pm-btn-ghost btn-sm" onClick={() => exportSeg(s)}><Download size={13} /></button>
                </div>
              </div>
            </div>
          ))}

          {/* smart lists */}
          <div className="col-12">
            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">Smart lists (dynamic)</div>
                <button className="pm-link-btn pm-fs-12" onClick={() => setWizardOpen(true)}>+ Build a list</button>
              </div>
              {lists.map((l) => {
                const n = evalList(l).length;
                return (
                  <div className="pm-sched-row" key={l.id}>
                    <span className="pm-seg-icon" style={{ background: l.color + "1a" }}><GitBranch size={15} /></span>
                    <div className="flex-grow-1">
                      <b className="pm-fs-13">{l.name}</b>
                      <span className="pm-muted pm-fs-11 d-block">{l.rules.map((r) => `${CRM_FIELDS.find((f) => f.id === r.field)?.label} ${r.op} ${r.value}`).join(" AND ")}</span>
                    </div>
                    <Badge tone="info">{n} match</Badge>
                    <div className="d-flex gap-1">
                      <button className="pm-icon-btn" onClick={() => setDetailList(l)}><Pencil size={13} /></button>
                      <button className="pm-icon-btn pm-icon-danger" onClick={() => setDelFor(l)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ════ segment detail ════ */}
      <SlideOver open={!!detailSeg} onClose={() => setDetailSeg(null)} kicker="Segment" title={segStats.find((s) => s.id === detailSeg)?.name ?? ""} width={540}
        footer={<><button className="btn pm-btn-soft btn-sm" onClick={() => { const s = segStats.find((x) => x.id === detailSeg); if (s) exportSeg(s); }}><Download size={14} /> Export CSV</button>
          <button className="btn pm-btn-primary btn-sm" onClick={() => { notify({ tone: "info", title: "Broadcast opened", body: "The Communication Hub is ready with this segment pre-selected." }); setDetailSeg(null); }}><Megaphone size={14} /> Message all</button></>}
      >
        {(segCustomers[detailSeg ?? ""] ?? []).map((c) => (
          <div className="pm-tx-row mb-2" key={c.id}>
            <div className="d-flex align-items-center gap-2">
              <Avatar name={c.name} size={28} />
              <div>
                <div className="fw-semibold pm-fs-13">{c.name}</div>
                <div className="pm-muted pm-fs-11">{c.business} · {c.phone}</div>
              </div>
            </div>
            <div className="text-end">
              <b className="pm-fs-13">{fmt(c.ltv)}</b>
              {c.balance > 0 && <div className="t-warning pm-fs-11 fw-bold">{fmt(c.balance)} owed</div>}
            </div>
          </div>
        ))}
      </SlideOver>

      {/* ════ smart list detail / edit ════ */}
      <SmartListModal list={detailList} onClose={() => setDetailList(null)} notify={notify}
        onSave={(l) => setLists((ls) => ls.map((x) => (x.id === l.id ? l : x)))} />

      {/* ════ smart list wizard ════ */}
      <SmartListWizard open={wizardOpen} onClose={() => setWizardOpen(false)} customers={customers} notify={notify}
        onCreate={(l) => setLists((ls) => [...ls, l])} />

      {/* ════ delete ════ */}
      <Confirm open={!!delFor} onClose={() => setDelFor(null)}
        onConfirm={() => { if (delFor) { setLists((ls) => ls.filter((x) => x.id !== delFor.id)); notify({ tone: "danger", title: "Smart list deleted", body: delFor.name }); } }}
        title="Delete smart list" confirmLabel="Delete" tone="danger"
        body={<span>Delete <b>{delFor?.name}</b>? Customers themselves are untouched.</span>} icon={<Trash2 size={18} />} />
    </>
  );
}

/* ═══════════════ smart list wizard ═══════════════ */

function SmartListWizard({ open, onClose, customers, notify, onCreate }: {
  open: boolean; onClose: () => void; customers: CrmCustomer[]; notify: Notify;
  onCreate: (l: SmartList) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7c3aed");
  const [rules, setRules] = useState<SmartList["rules"]>([{ field: "balance", op: ">", value: "0" }]);
  useEffect(() => { if (open) { setStep(1); setName(""); setRules([{ field: "balance", op: ">", value: "0" }]); } }, [open]);

  const matches = customers.filter((c) => rules.every((r) => {
    const v = r.field === "tags" ? c.tags.join(",").toLowerCase() : String((c as unknown as Record<string, unknown>)[r.field]);
    switch (r.op) {
      case ">": return Number(v) > Number(r.value);
      case "<": return Number(v) < Number(r.value);
      case "is": return String(v).toLowerCase() === r.value.toLowerCase();
      case "contains": return String(v).toLowerCase().includes(r.value.toLowerCase());
      default: return true;
    }
  }));

  const save = () => {
    onCreate({ id: uid("sl"), name: name || "Untitled list", rules, color });
    notify({ tone: "success", title: "Smart list saved", body: `${name || "Untitled list"} · ${matches.length} customer(s) match right now — updates live.` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Segmentation" title="Build a smart list" subtitle="Dynamic — customers join and leave automatically as their data changes." size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 && !name.trim()} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-primary" onClick={save}><CheckCircle2 size={15} /> Save list</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Name & colour", "Rules", "Preview"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-8"><Field label="List name" req><input className="form-control pm-input" placeholder="e.g. Big accounts in arrears" value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
          <div className="col-md-4"><Field label="Colour"><div className="d-flex gap-2">{["#7c3aed", "#0ea37f", "#0e7490", "#f59e0b", "#e11d48"].map((c) => <button key={c} className={cls("pm-swatch", color === c && "pm-swatch-on")} style={{ background: c }} onClick={() => setColor(c)} />)}</div></Field></div>
        </div>
      )}
      {step === 2 && (
        <div>
          {rules.map((r, i) => (
            <div className="d-flex gap-2 mb-2 align-items-center" key={i}>
              <select className="form-select form-select-sm pm-input flex-grow-1" value={r.field} onChange={(e) => setRules((rs) => rs.map((x, j) => (j === i ? { ...x, field: e.target.value } : x)))}>
                {CRM_FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <select className="form-select form-select-sm pm-input pm-w-120" value={r.op} onChange={(e) => setRules((rs) => rs.map((x, j) => (j === i ? { ...x, op: e.target.value } : x)))}>
                {r.field === "tags" ? <option value="contains">contains</option> : ["is", ">", "<"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {CRM_FIELDS.find((f) => f.id === r.field)?.type === "select" ? (
                <select className="form-select form-select-sm pm-input pm-w-140" value={r.value} onChange={(e) => setRules((rs) => rs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}>
                  {CRM_FIELDS.find((f) => f.id === r.field)!.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input className="form-control form-control-sm pm-input pm-w-140" placeholder="value" value={r.value} onChange={(e) => setRules((rs) => rs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              )}
              <button className="pm-icon-btn pm-icon-danger" disabled={rules.length === 1} onClick={() => setRules((rs) => rs.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
            </div>
          ))}
          <button className="btn pm-btn-soft btn-sm" onClick={() => setRules((rs) => [...rs, { field: "avgDays", op: ">", value: "0" }])}><Plus size={13} /> Add rule (AND)</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card mb-2">
            <div className="pm-summary-row"><span>Name</span><b>{name}</b></div>
            <div className="pm-summary-row"><span>Rules</span><b>{rules.map((r) => `${CRM_FIELDS.find((f) => f.id === r.field)?.label} ${r.op} ${r.value}`).join(" AND ")}</b></div>
            <div className="pm-summary-row"><span>Matches now</span><b>{matches.length} customers</b></div>
          </div>
          {matches.slice(0, 5).map((c) => (
            <div className="pm-tx-row mb-2" key={c.id}>
              <div className="d-flex align-items-center gap-2"><Avatar name={c.name} size={26} /><b className="pm-fs-13">{c.name}</b></div>
              <span className="pm-muted pm-fs-12">{c.business}</span>
            </div>
          ))}
          {matches.length === 0 && <div className="pm-empty-inline">No customers match yet — the list will fill automatically when they do.</div>}
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ smart list detail ═══════════════ */

function SmartListModal({ list, onClose, notify, onSave }: {
  list: SmartList | null; onClose: () => void; notify: Notify;
  onSave: (l: SmartList) => void;
}) {
  const [name, setName] = useState("");
  useEffect(() => { if (list) setName(list.name); }, [list]);
  if (!list) return null;
  return (
    <Modal open={!!list} onClose={onClose} kicker="Smart List" title={list.name}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-primary" onClick={() => { onSave({ ...list, name }); notify({ tone: "success", title: "List renamed", body: name }); onClose(); }}>Save name</button></>}
    >
      <Field label="Name"><input className="form-control pm-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="pm-preview-label">Rules</div>
      {list.rules.map((r, i) => (
        <div className="pm-evidence" key={i}><Search size={13} /> {CRM_FIELDS.find((f) => f.id === r.field)?.label} {r.op} <b>{r.value}</b></div>
      ))}
      <div className="pm-cyan-note mt-2">Tip: use smart lists as audiences in broadcasts (6.2) and nudge automations (6.6).</div>
    </Modal>
  );
}
