import { useEffect, useMemo, useState } from "react";
import {
  Search, Download, TrendingUp, TrendingDown, Scale, ArrowLeftRight, Eye,
} from "lucide-react";
import type { Account, CashTx } from "../../dataCash";
import { fmtMoney } from "../../dataCash";
import { cls, downloadCSV, fmtDT, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, LineChart, Modal, PillTabs, Section, SlideOver } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const NET_LINE = [86, 94, 88, 103, 97, 112, 106].map((v) => v * 2400);
const NET_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Cashflow({ txs, accounts, notify, emit, qa, onConsume }: {
  txs: CashTx[];
  accounts: Account[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [accFilter, setAccFilter] = useState("all");
  const [detail, setDetail] = useState<CashTx | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (qa?.a === "exportLedger") {
      setExportOpen(true);
      onConsume?.();
    }
  }, [qa, onConsume]);

  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const list = useMemo(() => {
    let rows = txs;
    if (tab !== "all") rows = rows.filter((t) => t.type === tab);
    if (accFilter !== "all") rows = rows.filter((t) => t.accountId === accFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((t) => t.desc.toLowerCase().includes(s) || t.ref.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    return rows;
  }, [txs, tab, q, accFilter]);

  const totalIn = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const fees = txs.filter((t) => t.type === "fee").reduce((s, t) => s - t.amount, 0);
  const pending = txs.filter((t) => t.status === "pending").length;

  const doExport = () => {
    downloadCSV(`paymo-ledger-${todayISO()}.csv`,
      [["Date", "Description", "Category", "Account", "Reference", "Amount", "Status"], ...list.map((t) => [t.date, t.desc, t.category, accName(t.accountId), t.ref, t.amount, t.status])]);
    notify({ tone: "success", title: "Ledger exported", body: `${list.length} entries saved as CSV.` });
    setExportOpen(false);
  };

  return (
    <>
      <Section
        no="3.2" sub="Your Money · Live Ledger" id="sec-cashflow"
        title="Cash Flow Command Center"
        right={
          <button className="btn pm-btn-cyan" onClick={() => setExportOpen(true)}><Download size={15} /> Export Ledger</button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="Money in (30d)" value={fmtMoney(totalIn)} delta="▲ 9.2%" sub="collections across rails" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="Money out (30d)" value={fmtMoney(totalOut)} delta="▼ 6.1%" sub="suppliers + payroll" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Scale size={16} />} label="Net movement" value={fmtMoney(totalIn - totalOut)} delta="▲ 3.1 pts" sub="in/out ratio 1.19" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ArrowLeftRight size={16} />} label="Pending & fees" value={`${pending} pending`} delta={fmtMoney(fees)} sub="bank fees this month" deltaTone="down" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                <PillTabs
                  tabs={[
                    { id: "all", label: "All", count: txs.length },
                    { id: "collection", label: "Collections", count: txs.filter((t) => t.type === "collection").length },
                    { id: "payment", label: "Payments", count: txs.filter((t) => t.type === "payment").length },
                    { id: "transfer", label: "Transfers", count: txs.filter((t) => t.type === "transfer" || t.type === "reserve").length },
                    { id: "fx", label: "FX", count: txs.filter((t) => t.type === "fx").length },
                  ]}
                  active={tab}
                  onChange={setTab}
                />
                <div className="d-flex gap-2">
                  <div className="pm-search"><Search size={15} /><input placeholder="Search ledger…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                  <select className="form-select form-select-sm pm-input pm-w-150" value={accFilter} onChange={(e) => setAccFilter(e.target.value)}>
                    <option value="all">All accounts</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table pm-table align-middle mb-0">
                  <thead><tr><th>Description</th><th>Account</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {list.slice(0, 14).map((t) => (
                      <tr key={t.id} className="pm-click-row" onClick={() => setDetail(t)}>
                        <td>
                          <div className="fw-semibold pm-fs-13">{t.desc}</div>
                          <div className="pm-muted pm-fs-11">{fmtDT(t.date)} · {t.category} · <span className="pm-mono">{t.ref}</span></div>
                        </td>
                        <td className="pm-muted pm-fs-12">{accName(t.accountId)}</td>
                        <td className={cls("text-end fw-bold pm-fs-13", t.amount >= 0 ? "t-success" : "t-danger")}>
                          {t.amount >= 0 ? "+" : "−"}{fmtMoney(Math.abs(t.amount))}
                        </td>
                        <td>{t.status === "settled" ? <Badge tone="success">Settled</Badge> : <Badge tone="warning" dot>Pending</Badge>}</td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr><td colSpan={4}><div className="pm-empty"><div className="pm-empty-title">No ledger entries match</div><div className="pm-empty-body">Adjust the filter or search.</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pm-table-foot">
                <span className="pm-muted pm-fs-12">Showing {Math.min(list.length, 14)} of {list.length} · the full ledger lives here, bank-feed verified.</span>
                <button className="pm-link-btn pm-fs-12" onClick={() => setExportOpen(true)}>Export all →</button>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Net movement — last 7 days</div>
                <div className="pm-card-sub">in minus out, per day</div>
              </div>
              <LineChart data={NET_LINE} labels={NET_LABELS} format={(n) => fmtMoney(n)} h={180} color="#0e7490" />
              <div className="pm-note mt-2">Sunday's spike = rent deposits on Equity •••• 8812. Friday's dip = supplier batch run.</div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => emit({ a: "transfer", p: null })}><ArrowLeftRight size={14} /> Move money</button>
                <button className="btn pm-btn-ghost btn-sm" onClick={() => notify({ tone: "info", title: "Ledger verified", body: "All entries reconcile against the bank feed within 24h." })}><Eye size={14} /> Verify</button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── tx detail ── */}
      <SlideOver open={!!detail} onClose={() => setDetail(null)} kicker="Ledger Entry" title={detail?.desc ?? ""} width={480}
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setDetail(null)}>Done</button>}
      >
        {detail && (
          <>
            <div className="pm-detail-head">
              <div className={cls("pm-money-lg", detail.amount >= 0 ? "t-success" : "t-danger")}>
                {detail.amount >= 0 ? "+" : "−"}{fmtMoney(Math.abs(detail.amount))}
              </div>
              <div className="pm-muted pm-fs-12">{fmtDT(detail.date)} · {detail.status}</div>
            </div>
            <div className="pm-json">
              {[
                ["Description", detail.desc],
                ["Category", detail.category],
                ["Account", accName(detail.accountId)],
                ["Reference", detail.ref],
                ["Running balance", fmtMoney(detail.balance)],
                ["Bank feed", "verified ✓"],
              ].map(([k, v]) => (
                <div className="pm-json-row" key={k}><span>{k}</span><b>{v}</b></div>
              ))}
            </div>
          </>
        )}
      </SlideOver>

      {/* ── export ── */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} kicker="Ledger Export" title="Export ledger entries"
        footer={<><button className="btn pm-btn-ghost" onClick={() => setExportOpen(false)}>Cancel</button><button className="btn pm-btn-cyan" onClick={doExport}><Download size={15} /> Download CSV</button></>}
      >
        <Field label="Scope"><input className="form-control pm-input" defaultValue="Current filtered view" disabled /></Field>
        <div className="pm-note">{list.length} entries · columns: date, description, category, account, reference, amount, status.</div>
      </Modal>
    </>
  );
}
