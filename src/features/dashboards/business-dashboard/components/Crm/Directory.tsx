import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, Upload, Download, MoreVertical, Users, MessageCircle, Phone,
  FileText, GitMerge, Pencil, Trash2, X, Crown, AlertTriangle,
  CheckCircle2, Star, StarOff,
} from "lucide-react";
import type { CrmCustomer, Tier } from "../../dataCrm";
import { cls, daysAgo, downloadCSV, fmt, fmtDate, uid, type QAction } from "../../lib";
import { Avatar, Badge, Confirm, EmptyState, Field, Kpi, Modal, PillTabs, Section, SlideOver, Stepper } from "../Getpaid/ui";
import { invoicesSeed } from "../../dataGetpaid";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export const tierMeta: Record<Tier, { label: string; tone: string; icon: React.ReactNode }> = {
  vip: { label: "VIP", tone: "success", icon: <Crown size={12} /> },
  regular: { label: "Regular", tone: "info", icon: <Star size={12} /> },
  new: { label: "New", tone: "muted", icon: <Star size={12} /> },
  risk: { label: "At-Risk", tone: "danger", icon: <AlertTriangle size={12} /> },
};

export default function Directory({ customers, setCustomers, notify, emit, qa, onConsume }: {
  customers: CrmCustomer[];
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState<"ltv" | "balance" | "name" | "added">("ltv");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [profile, setProfile] = useState<CrmCustomer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editFor, setEditFor] = useState<CrmCustomer | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [mergeFor, setMergeFor] = useState<CrmCustomer | null>(null);
  const [deleteFor, setDeleteFor] = useState<CrmCustomer | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "newCustomer": setAddOpen(true); break;
      case "importCustomers": setImportOpen(true); break;
      case "exportCustomers": setExportOpen(true); break;
      case "openCustomer": {
        const c = customers.find((x) => x.id === qa.p);
        if (c) setProfile(c);
        break;
      }
      case "crmTags": setTagsOpen(true); break;
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const allTags = useMemo(() => [...new Set(customers.flatMap((c) => c.tags))].sort(), [customers]);
  const invFor = (id: string) => invoicesSeed.filter((i) => i.customerId === id);

  const list = useMemo(() => {
    let rows = customers;
    if (tab !== "all") rows = rows.filter((c) => c.tier === tab);
    if (tagFilter !== "all") rows = rows.filter((c) => c.tags.includes(tagFilter));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((c) => (c.name + c.business + c.phone + c.email + c.pin + c.tags.join(" ")).toLowerCase().includes(s));
    }
    return [...rows].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "added" ? b.added.localeCompare(a.added) : b[sort] - a[sort]));
  }, [customers, tab, q, tagFilter, sort]);

  const totalLtv = customers.reduce((s, c) => s + c.ltv, 0);
  const totalBal = customers.reduce((s, c) => s + c.balance, 0);

  const doExport = () => {
    downloadCSV(`paymo-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      [["Name", "Business", "Phone", "Email", "KRA PIN", "Balance", "LTV", "Tier", "Tags", "Avg days to pay", "Added"],
      ...list.map((c) => [c.name, c.business, c.phone, c.email, c.pin, c.balance, c.ltv, tierMeta[c.tier].label, c.tags.join(" | "), c.avgDays, c.added])]);
    notify({ tone: "success", title: "Customers exported", body: `${list.length} record(s) saved as CSV.` });
    setExportOpen(false);
  };

  return (
    <>
      <Section
        no="6.1" sub="Money In · Relationships" id="sec-directory"
        title="Customer Directory & 360° Profiles"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setImportOpen(true)}><Upload size={15} /> Import</button>
            <button className="btn pm-btn-soft" onClick={() => setExportOpen(true)}><Download size={15} /> Export</button>
            <button className="btn pm-btn-primary" onClick={() => setAddOpen(true)}><Plus size={15} /> Add Customer</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Users size={16} />} label="Total customers" value={`${customers.length} contacts`} delta="▲ 2 this month" sub="3 sources: manual · import · walk-in" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Crown size={16} />} label="VIP customers" value={`${customers.filter((c) => c.tier === "vip").length} VIPs`} delta={fmt(customers.filter((c) => c.tier === "vip").reduce((s, c) => s + c.ltv, 0))} sub="of total lifetime value" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<FileText size={16} />} label="Total lifetime value" value={fmt(totalLtv)} delta="▲ 14.2%" sub="across all customers" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Outstanding balances" value={fmt(totalBal)} delta={`${customers.filter((c) => c.balance > 0).length} customers`} sub="see receivables in Get Paid" deltaTone="down" /></div>
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: customers.length },
                { id: "vip", label: "VIP", count: customers.filter((c) => c.tier === "vip").length },
                { id: "regular", label: "Regular", count: customers.filter((c) => c.tier === "regular").length },
                { id: "new", label: "New", count: customers.filter((c) => c.tier === "new").length },
                { id: "risk", label: "At-Risk", count: customers.filter((c) => c.tier === "risk").length, tone: "danger" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <div className="pm-search"><Search size={15} /><input placeholder="Search name, phone, PIN, tag…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <select className="form-select form-select-sm pm-input pm-w-140" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="all">All tags</option>
                {allTags.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select className="form-select form-select-sm pm-input pm-w-130" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="ltv">Sort: LTV</option>
                <option value="balance">Sort: Balance</option>
                <option value="name">Sort: Name</option>
                <option value="added">Sort: Newest</option>
              </select>
              <div className="pm-mode-tabs">
                <button className={cls("pm-mode-tab", view === "cards" && "pm-mode-on")} onClick={() => setView("cards")}>Cards</button>
                <button className={cls("pm-mode-tab", view === "table" && "pm-mode-on")} onClick={() => setView("table")}>Table</button>
              </div>
            </div>
          </div>

          {view === "cards" ? (
            <div className="row g-3 mt-2">
              {list.map((c) => (
                <div className="col-12 col-md-6 col-xl-4" key={c.id}>
                  <div className="pm-card pm-cust-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex gap-2 align-items-center">
                        <Avatar name={c.name} size={38} />
                        <div>
                          <button className="pm-num-link pm-fs-14" onClick={() => setProfile(c)}>{c.name}</button>
                          <div className="pm-muted pm-fs-11">{c.business}</div>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <Badge tone={tierMeta[c.tier].tone} dot>{tierMeta[c.tier].label}</Badge>
                      </div>
                    </div>
                    <div className="pm-cust-stats">
                      <div><b>{fmt(c.ltv)}</b><span>lifetime value</span></div>
                      <div><b>{c.avgDays}d</b><span>avg to pay</span></div>
                      <div><b>{c.totalInvoices}</b><span>invoices</span></div>
                    </div>
                    {c.balance > 0 && (
                      <div className={cls("pm-warn-chip w-100 justify-content-start", c.balance > 50000 && "pm-warn-chip-red")}>
                        <AlertTriangle size={13} /> {fmt(c.balance)} outstanding · {c.openInvoices} invoice(s)
                      </div>
                    )}
                    <div className="pm-tag-row mt-2">
                      {c.tags.map((t) => <span className="pm-tag-chip" key={t}># {t}</span>)}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="pm-muted pm-fs-11">last contact {daysAgo(c.lastContact)}d ago · {c.channel}</span>
                      <div className="d-flex gap-1">
                        <button className="pm-icon-btn" title="Message" onClick={() => emit({ a: "compose", p: c.id })}><MessageCircle size={13} /></button>
                        <button className="pm-icon-btn" title="Call" onClick={() => notify({ tone: "info", title: `Calling ${c.phone}`, body: "Tap-to-call dialled (demo)." })}><Phone size={13} /></button>
                        <button className="pm-icon-btn" title="New invoice" onClick={() => emit({ a: "invoiceFor", p: c.id })}><FileText size={13} /></button>
                        <button className="pm-icon-btn" title="More" onClick={() => setMenuFor(menuFor === c.id ? null : c.id)}><MoreVertical size={13} /></button>
                        {menuFor === c.id && (
                          <>
                            <div className="pm-menu-backdrop" onClick={() => setMenuFor(null)} />
                            <div className="pm-menu" style={{ right: 0 }}>
                              <button onClick={() => { setProfile(c); setMenuFor(null); }}>Open 360° profile</button>
                              <button onClick={() => { setEditFor(c); setMenuFor(null); }}><Pencil size={13} /> Edit</button>
                              <button onClick={() => { setMergeFor(c); setMenuFor(null); }}><GitMerge size={13} /> Merge duplicate</button>
                              <button className="pm-menu-danger" onClick={() => { setDeleteFor(c); setMenuFor(null); }}><Trash2 size={13} /> Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="col-12"><EmptyState icon={<Users size={26} />} title="No customers match" body="Adjust the filter, search or tab." /></div>}
            </div>
          ) : (
            <div className="table-responsive mt-2">
              <table className="table pm-table align-middle mb-0">
                <thead><tr><th>Customer</th><th>Contact</th><th>KRA PIN</th><th>Tier</th><th className="text-end">Balance</th><th className="text-end">LTV</th><th>Avg pay</th><th>Last contact</th><th className="text-end" /></tr></thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.id} className="pm-click-row" onClick={() => setProfile(c)}>
                      <td><div className="d-flex align-items-center gap-2"><Avatar name={c.name} size={26} /><div><div className="fw-semibold pm-fs-13">{c.name}</div><div className="pm-muted pm-fs-11">{c.business}</div></div></div></td>
                      <td className="pm-fs-12">{c.phone}<div className="pm-muted pm-fs-11">{c.email}</div></td>
                      <td className="pm-mono pm-fs-12">{c.pin}</td>
                      <td><Badge tone={tierMeta[c.tier].tone} dot>{tierMeta[c.tier].label}</Badge></td>
                      <td className={cls("text-end pm-fs-13 fw-bold", c.balance > 0 && "t-warning")}>{c.balance ? fmt(c.balance) : "—"}</td>
                      <td className="text-end pm-fs-13">{fmt(c.ltv)}</td>
                      <td className="pm-fs-13">{c.avgDays}d</td>
                      <td className="pm-muted pm-fs-12">{daysAgo(c.lastContact)}d ago</td>
                      <td className="text-end"><button className="pm-link-btn pm-fs-12" onClick={(e) => { e.stopPropagation(); setProfile(c); }}>Open →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>

      {/* ════ 360° profile ════ */}
      <Profile360
        c={profile} onClose={() => setProfile(null)}
        invFor={invFor}
        notify={notify} emit={emit}
        onEdit={(c) => { setProfile(null); setEditFor(c); }}
        onMerge={(c) => { setProfile(null); setMergeFor(c); }}
        setCustomers={setCustomers}
      />

      {/* ════ add customer wizard ════ */}
      <AddWizard open={addOpen} onClose={() => setAddOpen(false)} notify={notify} setCustomers={setCustomers} />

      {/* ════ edit ════ */}
      <EditModal c={editFor} onClose={() => setEditFor(null)} notify={notify} setCustomers={setCustomers} />

      {/* ════ import wizard ════ */}
      <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} notify={notify} setCustomers={setCustomers} />

      {/* ════ merge wizard ════ */}
      <MergeWizard c={mergeFor} onClose={() => setMergeFor(null)} customers={customers} notify={notify} setCustomers={setCustomers} />

      {/* ════ delete confirm ════ */}
      <Confirm open={!!deleteFor} onClose={() => setDeleteFor(null)}
        onConfirm={() => { if (deleteFor) { setCustomers((cs) => cs.filter((x) => x.id !== deleteFor.id)); notify({ tone: "danger", title: "Customer deleted", body: `${deleteFor.name} removed. History is preserved in the audit trail.` }); } }}
        title="Delete customer" confirmLabel="Delete" tone="danger"
        body={<span>Delete <b>{deleteFor?.name}</b> from {deleteFor?.business}? Their invoices and ledger entries remain untouched.</span>}
        icon={<Trash2 size={18} />} />

      {/* ════ tag manager ════ */}
      <TagManager open={tagsOpen} onClose={() => setTagsOpen(false)} customers={customers} setCustomers={setCustomers} notify={notify} />

      {/* ════ export ════ */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} kicker="Export" title="Export customers"
        footer={<><button className="btn pm-btn-ghost" onClick={() => setExportOpen(false)}>Cancel</button>
          <button className="btn pm-btn-primary" onClick={doExport}><Download size={15} /> Download CSV</button></>}
      >
        <Field label="Scope"><input className="form-control pm-input" value={`${list.length} customer(s) — current view`} disabled /></Field>
        <div className="pm-note">Columns: name, business, phone, email, KRA PIN, balance, LTV, tier, tags, payment speed, date added.</div>
      </Modal>
    </>
  );
}

/* ═══════════════ 360° profile ═══════════════ */

function Profile360({ c, onClose, invFor, notify, emit, onEdit, onMerge, setCustomers }: {
  c: CrmCustomer | null; onClose: () => void;
  invFor: (id: string) => typeof invoicesSeed;
  notify: Notify; emit: (q: QAction) => void;
  onEdit: (c: CrmCustomer) => void; onMerge: (c: CrmCustomer) => void;
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
}) {
  const [note, setNote] = useState("");
  if (!c) return null;
  const invoices = invFor(c.id);
  const addNote = () => {
    if (!note.trim()) return;
    setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, notes: [...x.notes, { t: new Date().toISOString(), text: note, by: "Wanjiru K." }] } : x)));
    notify({ tone: "success", title: "Note added", body: `${c.name} — pinned to their 360° profile.` });
    setNote("");
  };
  return (
    <SlideOver open={!!c} onClose={onClose} kicker="Customer 360°" title={c.name} width={640}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => emit({ a: "compose", p: c.id })}><MessageCircle size={14} /> Message</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => notify({ tone: "info", title: `Calling ${c.phone}`, body: "Tap-to-call dialled (demo)." })}><Phone size={14} /> Call</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => emit({ a: "invoiceFor", p: c.id })}><FileText size={14} /> New Invoice</button>
          <button className="btn pm-btn-primary btn-sm" onClick={() => emit({ a: "statementFor", p: c.id })}><Download size={14} /> Statement</button>
        </>
      }
    >
      {/* head */}
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={c.name} size={52} />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <b className="pm-fs-15">{c.name}</b>
              <Badge tone={tierMeta[c.tier].tone} dot>{tierMeta[c.tier].label}</Badge>
            </div>
            <div className="pm-muted pm-fs-12">{c.business} · {c.phone} · {c.email}</div>
            <div className="pm-muted pm-fs-11 pm-mono">KRA PIN {c.pin} · customer since {fmtDate(c.added)}</div>
          </div>
          <div className="text-end">
            <div className="pm-money-lg">{fmt(c.ltv)}</div>
            <div className="pm-muted pm-fs-11">lifetime value</div>
          </div>
        </div>
        <div className="pm-stat-row mt-3">
          <div><b>{fmt(c.balance)}</b><span>outstanding</span></div>
          <div><b>{c.avgDays}d</b><span>avg to pay</span></div>
          <div><b>{c.totalInvoices}</b><span>invoices</span></div>
          <div><b>{c.channel}</b><span>prefers</span></div>
        </div>
      </div>

      {/* tags */}
      <div className="pm-detail-section">
        <div className="pm-preview-label">Tags</div>
        <div className="pm-tag-row">
          {c.tags.map((t) => (
            <button className="pm-tag-chip pm-tag-removable" key={t} onClick={() => { setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, tags: x.tags.filter((y) => y !== t) } : x))); notify({ tone: "info", title: "Tag removed", body: `#${t}` }); }}>
              # {t} <X size={11} />
            </button>
          ))}
          <button className="pm-tag-add" onClick={() => { const t = window.prompt("New tag for this customer"); if (t) { setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, tags: [...new Set([...x.tags, t.trim()])] } : x))); notify({ tone: "success", title: "Tag added", body: `#${t.trim()}` }); } }}>+ tag</button>
        </div>
      </div>

      {/* recent invoices */}
      <div className="pm-detail-section">
        <div className="pm-preview-label">Recent invoices ({invoices.length})</div>
        {invoices.length === 0 && <div className="pm-muted pm-fs-13">No invoices on record for this customer.</div>}
        {invoices.slice(0, 4).map((inv) => (
          <div className="pm-line-view" key={inv.id}>
            <div className="flex-grow-1">
              <button className="pm-link-btn pm-fs-13 fw-semibold" onClick={() => { onClose(); emit({ a: "openInvoice", p: inv.id }); }}>{inv.number}</button>
              <div className="pm-muted pm-fs-11">issued {fmtDate(inv.issue)} · due {fmtDate(inv.due)}</div>
            </div>
            <div className="text-end">
              <b className="pm-fs-13">{fmt(inv.amount)}</b>
              <div><Badge tone={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : inv.status === "partial" ? "warning" : "muted"}>{inv.status}</Badge></div>
            </div>
          </div>
        ))}
      </div>

      {/* activity timeline */}
      <div className="pm-detail-section">
        <div className="pm-preview-label">Activity & communication</div>
        {[
          { t: c.lastContact, text: `Last contact · ${c.channel} · ${daysAgo(c.lastContact)} days ago`, kind: "msg" },
          ...(c.balance > 0 ? [{ t: new Date().toISOString(), text: `Balance outstanding ${fmt(c.balance)} across ${c.openInvoices} invoice(s)`, kind: "warn" }] : []),
          { t: c.added, text: `Customer added (${c.source})`, kind: "sys" },
        ].map((a, i) => (
          <div className="pm-tl-item" key={i}>
            <span className={cls("pm-tl-dot", a.kind === "warn" ? "pm-tl-dot-rem" : a.kind === "msg" ? "pm-tl-dot-view" : "pm-tl-dot-sent")} />
            <div><div className="pm-fs-13">{a.text}</div><div className="pm-muted pm-fs-11">{fmtDate(a.t)}</div></div>
          </div>
        ))}
      </div>

      {/* notes */}
      <div className="pm-detail-section">
        <div className="pm-preview-label">Team notes</div>
        {c.notes.map((n, i) => (
          <div className="pm-note-item" key={i}>
            <div className="pm-fs-13">{n.text}</div>
            <div className="pm-muted pm-fs-11">{n.by} · {fmtDate(n.t)}</div>
          </div>
        ))}
        <div className="d-flex gap-2 mt-2">
          <input className="form-control form-control-sm pm-input flex-grow-1" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} />
          <button className="btn pm-btn-soft btn-sm" onClick={addNote}>Add</button>
        </div>
      </div>

      {/* documents */}
      <div className="pm-detail-section">
        <div className="pm-preview-label">Documents ({c.docs.length})</div>
        {c.docs.length === 0 && <div className="pm-muted pm-fs-13">No documents filed.</div>}
        {c.docs.map((d) => (
          <div className="pm-evidence" key={d.name}><FileText size={14} /> {d.name}<span className="pm-muted pm-fs-11 ms-2">{d.kind}</span>
            <button className="pm-link-btn ms-auto" onClick={() => notify({ tone: "info", title: "Document opened", body: `${d.name} (demo preview).` })}>View</button></div>
        ))}
        <button className="btn pm-btn-soft btn-sm mt-2" onClick={() => notify({ tone: "info", title: "Document uploaded", body: "File attached to the customer vault." })}><Upload size={13} /> Upload document</button>
      </div>

      <div className="pm-detail-actions">
        <button className="pm-action-tile" onClick={() => emit({ a: "segment" })}><Users size={16} /><span>View segment</span></button>
        <button className="pm-action-tile" onClick={() => onEdit(c)}><Pencil size={16} /><span>Edit profile</span></button>
        <button className="pm-action-tile" onClick={() => onMerge(c)}><GitMerge size={16} /><span>Merge</span></button>
        <button className="pm-action-tile" onClick={() => { setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, tier: x.tier === "vip" ? "regular" : "vip" } : x))); notify({ tone: "info", title: "Tier updated", body: `${c.name} is now ${c.tier === "vip" ? "Regular" : "VIP"}.` }); onClose(); }}>
          {c.tier === "vip" ? <StarOff size={16} /> : <Star size={16} />}<span>{c.tier === "vip" ? "Remove VIP" : "Make VIP"}</span>
        </button>
      </div>
    </SlideOver>
  );
}

/* ═══════════════ add wizard ═══════════════ */

function AddWizard({ open, onClose, notify, setCustomers }: {
  open: boolean; onClose: () => void; notify: Notify;
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
}) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", business: "", phone: "", email: "", source: "manual" });
  const [c2, setC2] = useState({ address: "", city: "Nairobi", note: "" });
  const [c3, setC3] = useState({ pin: "", tags: "", tier: "new", channel: "WhatsApp" });
  useEffect(() => { if (open) { setStep(1); setF({ name: "", business: "", phone: "", email: "", source: "manual" }); setC2({ address: "", city: "Nairobi", note: "" }); setC3({ pin: "", tags: "", tier: "new", channel: "WhatsApp" }); } }, [open]);
  const valid1 = f.name && f.phone;
  const save = () => {
    setCustomers((cs) => [...cs, {
      id: uid("crm"), name: f.name, business: f.business || f.name, phone: f.phone, email: f.email,
      pin: c3.pin || "PENDING", balance: 0, avgDays: 0, ltv: 0, tier: c3.tier as Tier,
      tags: c3.tags ? c3.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      lastContact: new Date().toISOString(), lastInvoice: "", openInvoices: 0, totalInvoices: 0,
      added: new Date().toISOString().slice(0, 10), source: f.source as CrmCustomer["source"], channel: c3.channel as CrmCustomer["channel"],
      notes: c2.note ? [{ t: new Date().toISOString(), text: c2.note, by: "Wanjiru K." }] : [], docs: [], portal: false,
    }]);
    notify({ tone: "success", title: "Customer created", body: `${f.name} · ${f.business || f.name} added to the directory.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Customers & CRM" title="Add a customer" subtitle="Only name and phone are required — the 360° profile builds itself over time." size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 && !valid1} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-primary" onClick={save}><CheckCircle2 size={15} /> Save customer</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Business details", "Address & notes", "Tax & preferences"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="Full name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Business name"><input className="form-control pm-input" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Phone" req><input className="form-control pm-input" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Email"><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
          <div className="col-12"><Field label="How did they find you?"><div className="pm-mode-tabs">{["manual", "import", "walkin"].map((s) => <button key={s} className={cls("pm-mode-tab", f.source === s && "pm-mode-on")} onClick={() => setF({ ...f, source: s })}>{s === "walkin" ? "Walk-in sale" : s === "import" ? "Bulk import" : "Manual entry"}</button>)}</div></Field></div>
        </div>
      )}
      {step === 2 && (
        <div className="row g-3">
          <div className="col-12"><Field label="Address"><input className="form-control pm-input" value={c2.address} onChange={(e) => setC2({ ...c2, address: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="City"><select className="form-select pm-input" value={c2.city} onChange={(e) => setC2({ ...c2, city: e.target.value })}><option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Nakuru</option><option>Other</option></select></Field></div>
          <div className="col-md-6"><Field label="Opening note"><input className="form-control pm-input" placeholder="Anything the team should know?" value={c2.note} onChange={(e) => setC2({ ...c2, note: e.target.value })} /></Field></div>
        </div>
      )}
      {step === 3 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="KRA PIN" hint="Auto-validated against iTax."><input className="form-control pm-input pm-mono" placeholder="P0123456X" value={c3.pin} onChange={(e) => setC3({ ...c3, pin: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Preferred channel"><select className="form-select pm-input" value={c3.channel} onChange={(e) => setC3({ ...c3, channel: e.target.value })}><option>WhatsApp</option><option>Email</option><option>SMS</option></select></Field></div>
          <div className="col-md-6"><Field label="Starting tier"><select className="form-select pm-input" value={c3.tier} onChange={(e) => setC3({ ...c3, tier: e.target.value })}><option value="new">New</option><option value="regular">Regular</option><option value="vip">VIP</option></select></Field></div>
          <div className="col-md-6"><Field label="Tags" hint="Comma-separated, e.g. Retail, Referred"><input className="form-control pm-input" placeholder="Retail, Referred by Amina" value={c3.tags} onChange={(e) => setC3({ ...c3, tags: e.target.value })} /></Field></div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ edit ═══════════════ */

function EditModal({ c, onClose, notify, setCustomers }: {
  c: CrmCustomer | null; onClose: () => void; notify: Notify;
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
}) {
  const [f, setF] = useState({ name: "", business: "", phone: "", email: "", pin: "", channel: "" });
  useEffect(() => { if (c) setF({ name: c.name, business: c.business, phone: c.phone, email: c.email, pin: c.pin, channel: c.channel }); }, [c]);
  if (!c) return null;
  return (
    <Modal open={!!c} onClose={onClose} kicker="Customers & CRM" title={`Edit ${c.name}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-primary" onClick={() => { setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, ...f, channel: f.channel as CrmCustomer["channel"] } : x))); notify({ tone: "success", title: "Profile updated", body: c.name }); onClose(); }}>Save changes</button></>}
    >
      <div className="row g-3">
        <div className="col-md-6"><Field label="Name"><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Business"><input className="form-control pm-input" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Phone"><input className="form-control pm-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Email"><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="KRA PIN"><input className="form-control pm-input pm-mono" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Preferred channel"><select className="form-select pm-input" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}><option>WhatsApp</option><option>Email</option><option>SMS</option></select></Field></div>
      </div>
    </Modal>
  );
}

/* ═══════════════ import wizard ═══════════════ */

function ImportWizard({ open, onClose, notify, setCustomers }: {
  open: boolean; onClose: () => void; notify: Notify;
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
}) {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<{ name: string; phone: string; business: string }[]>([]);
  useEffect(() => { if (open) { setStep(1); setFileName(null); setParsing(false); setPreview([]); } }, [open]);

  const parse = () => {
    setParsing(true);
    window.setTimeout(() => {
      setParsing(false);
      setPreview([
        { name: "Halima Noor", phone: "0723 111 998", business: "Noor Trading" },
        { name: "Victor Mwenda", phone: "0745 667 331", business: "Mwenda Farms" },
        { name: "Cynthia Jepkorir", phone: "0790 224 517", business: "Jepkorir Catering" },
        { name: "Mark Odhiambo", phone: "0702 448 109", business: "Odhiambo Plumbing" },
      ]);
      notify({ tone: "info", title: "File parsed", body: "4 rows found — columns mapped automatically." });
    }, 1500);
  };

  const confirm = () => {
    const now = new Date().toISOString().slice(0, 10);
    const added = preview.map((p) => ({
      id: uid("crm"), name: p.name, business: p.business, phone: p.phone, email: "",
      pin: "PENDING", balance: 0, avgDays: 0, ltv: 0, tier: "new" as Tier, tags: ["Imported"],
      lastContact: new Date().toISOString(), lastInvoice: "", openInvoices: 0, totalInvoices: 0,
      added: now, source: "import" as const, channel: "WhatsApp" as CrmCustomer["channel"],
      notes: [], docs: [], portal: false,
    }));
    setCustomers((cs) => [...cs, ...added]);
    notify({ tone: "success", title: "Import complete", body: `${added.length} customer(s) imported and tagged #Imported.` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Bulk Import" title="Import customers" subtitle="CSV or Excel — columns are matched automatically." size="lg"
      footer={
        step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={!fileName} onClick={parse}><Upload size={15} /> Parse file</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={confirm}><CheckCircle2 size={15} /> Import {preview.length} customer(s)</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Upload file", "Review & confirm"]} />
      {step === 1 && (
        <div>
          <div className={cls("pm-dropzone", fileName && "pm-dropzone-has")} role="button" onClick={() => setFileName("customers-batch-04.csv")}>
            <Upload size={22} />
            {fileName ? <><b>{fileName}</b><span className="pm-muted pm-fs-12">Tap to choose a different file · 18 KB</span></> : <><b>Drop the file here</b><span className="pm-muted pm-fs-12">CSV or XLSX · columns: name, phone, business, email, PIN</span></>}
          </div>
          {parsing && (
            <div className="pm-sync-list mt-3">
              <div className="pm-sync-step pm-sync-active"><span className="pm-spin" style={{ display: "inline-grid" }}>⏳</span> Reading file…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">2</span> Mapping columns…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">3</span> Validating phones & PINs…</div>
            </div>
          )}
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="pm-wizard-hint">Column mapping: Name ✓ · Phone ✓ · Business ✓ · Email ✓ · KRA PIN (empty → PENDING)</div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Name</th><th>Phone</th><th>Business</th><th>Status</th></tr></thead>
              <tbody>
                {preview.map((p) => (
                  <tr key={p.phone}>
                    <td className="fw-semibold pm-fs-13">{p.name}</td>
                    <td className="pm-fs-13">{p.phone}</td>
                    <td className="pm-fs-13">{p.business}</td>
                    <td><Badge tone="success">Ready</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-cyan-note mt-2">Duplicates are detected by phone — existing customers are updated instead of copied.</div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ merge wizard ═══════════════ */

function MergeWizard({ c, onClose, customers, notify, setCustomers }: {
  c: CrmCustomer | null; onClose: () => void; customers: CrmCustomer[]; notify: Notify;
  setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
}) {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState("");
  const [keepName, setKeepName] = useState(true);
  useEffect(() => { if (c) { setStep(1); setTarget(""); setKeepName(true); } }, [c]);
  if (!c) return null;
  const candidates = customers.filter((x) => x.id !== c.id);
  const t = customers.find((x) => x.id === target);
  const mergedLtv = c.ltv + (t?.ltv ?? 0);
  const merge = () => {
    if (!t) return;
    setCustomers((cs) => cs.filter((x) => x.id !== c.id).map((x) => x.id === t.id
      ? { ...x, ltv: mergedLtv, totalInvoices: x.totalInvoices + c.totalInvoices, tags: [...new Set([...x.tags, ...c.tags])], notes: [...x.notes, ...c.notes], openInvoices: x.openInvoices + c.openInvoices, name: keepName ? x.name : c.name }
      : x));
    notify({ tone: "success", title: "Customers merged", body: `${c.name} folded into ${t.name}. LTV, tags and history combined — audit trail preserved.` });
    onClose();
  };
  return (
    <Modal open={!!c} onClose={onClose} kicker="Data Hygiene" title={`Merge ${c.name} into…`} subtitle="Combine duplicates — history is preserved, nothing is lost."
      footer={
        step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={!target} onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={merge}><GitMerge size={15} /> Confirm merge</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Choose the keeper", "Confirm"]} />
      {step === 1 ? (
        <div className="pm-select-list">
          {candidates.map((x) => (
            <button key={x.id} className={cls("pm-check-list-item", target === x.id && "pm-check-on")} onClick={() => setTarget(x.id)}>
              <span className="pm-checkbox">{target === x.id ? "✓" : ""}</span>
              <Avatar name={x.name} size={26} />
              <span className="flex-grow-1 text-start"><b className="pm-fs-13">{x.name}</b><span className="pm-muted pm-fs-11 d-block">{x.business} · LTV {fmt(x.ltv)}</span></span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Keeping</span><b>{t?.name} ({t?.business})</b></div>
            <div className="pm-summary-row"><span>Merging in</span><b>{c.name} ({c.business})</b></div>
            <div className="pm-summary-row"><span>Combined LTV</span><b>{fmt(mergedLtv)}</b></div>
            <div className="pm-summary-row"><span>Combined invoices</span><b>{(t?.totalInvoices ?? 0) + c.totalInvoices}</b></div>
            <div className="pm-summary-row"><span>Tags kept</span><b>{[...new Set([...(t?.tags ?? []), ...c.tags])].join(", ")}</b></div>
          </div>
          <div className="pm-toggle-row mt-2">
            <button className="pm-toggle-wrap" onClick={() => setKeepName(!keepName)}><span className={cls("pm-toggle", keepName && "pm-toggle-on")}><span className="pm-toggle-knob" /></span></button>
            <span className="pm-fs-13 fw-semibold">Keep "{keepName ? t?.name : c.name}" as the display name</span>
          </div>
          <div className="pm-cyan-note mt-2">Invoices and ledger entries of both records are relinked to the keeper. The merge is logged in the audit trail.</div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ tag manager ═══════════════ */

function TagManager({ open, onClose, customers, setCustomers, notify }: {
  open: boolean; onClose: () => void; customers: CrmCustomer[]; setCustomers: React.Dispatch<React.SetStateAction<CrmCustomer[]>>;
  notify: Notify;
}) {
  const allTags = [...new Set(customers.flatMap((c) => c.tags))].sort();
  const [newTag, setNewTag] = useState("");
  const addTag = () => {
    if (!newTag.trim()) return;
    setCustomers((cs) => cs.map((c) => (c.tags.includes(newTag.trim()) ? c : { ...c, tags: [...c.tags, newTag.trim()] })));
    notify({ tone: "success", title: "Tag applied", body: `#${newTag.trim()} added to all customers.` });
    setNewTag("");
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Tags" title="Tag manager" subtitle="Tags power segments, smart lists and campaigns." size="lg"
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      <div className="d-flex gap-2 mb-3">
        <input className="form-control form-control-sm pm-input flex-grow-1" placeholder="New tag…" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} />
        <button className="btn pm-btn-primary btn-sm" onClick={addTag}><Plus size={13} /> Apply to all</button>
      </div>
      <div className="pm-tag-row">
        {allTags.map((t) => (
          <span className="pm-tag-chip pm-tag-big" key={t}>
            # {t} · {customers.filter((c) => c.tags.includes(t)).length} customers
            <button className="pm-tag-x" onClick={() => {
              setCustomers((cs) => cs.map((c) => ({ ...c, tags: c.tags.filter((y) => y !== t) })));
              notify({ tone: "warning", title: "Tag deleted", body: `#${t} removed everywhere.` });
            }}><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="pm-note mt-3">Tags are shared across the whole suite — segments (6.4) and nudges (6.6) both read them.</div>
    </Modal>
  );
}
