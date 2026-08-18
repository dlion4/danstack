import { useEffect, useState } from "react";
import {
  FileText, Download, Send, Receipt, ArrowRightLeft, CheckCircle2, Wallet,
} from "lucide-react";
import type { CrmCustomer } from "../../dataCrm";
import { invoicesSeed } from "../../dataGetpaid";
import { cls, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Avatar, Badge, Field, Kpi, Modal, Section } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Ledger({ customers, notify, qa, onConsume }: {
  customers: CrmCustomer[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [cust, setCust] = useState("c1");
  const [statement, setStatement] = useState<CrmCustomer | null>(null);
  const [statementResult, setStatementResult] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "statementFor") {
      const c = customers.find((x) => x.id === qa.p);
      if (c) setStatement(c);
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const c = customers.find((x) => x.id === cust) ?? customers[0];
  const invs = invoicesSeed.filter((i) => i.customerId === c.id);
  const paid = invs.filter((i) => i.status === "paid").reduce((s, i) => s + i.paid, 0);
  const outstanding = invs.filter((i) => ["sent", "partial", "overdue"].includes(i.status)).reduce((s, i) => s + (i.amount - i.paid), 0);
  const payments = invs.flatMap((i) => i.payments.map((p) => ({ ...p, inv: i.number })));

  return (
    <>
      <Section
        no="6.3" sub="Money In · Per-Customer Ledger" id="sec-crm-ledger"
        title="Invoices, Balances & Payment History"
        right={
          <button className="btn pm-btn-primary" onClick={() => setStatement(c)}><Download size={15} /> Generate Statement</button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<FileText size={16} />} label="Invoices on file" value={`${invs.length} invoices`} delta={`${c.totalInvoices} lifetime`} sub="for this customer" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Collected (all time)" value={fmt(paid)} delta={`${payments.length} payments`} sub="matched to invoices" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Receipt size={16} />} label="Outstanding" value={fmt(outstanding)} delta={`${c.openInvoices} open`} sub="per aging buckets" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Payment methods" value={`${new Set(payments.map((p) => p.method)).size} rails`} delta={new Set(payments.map((p) => p.method)).size ? "M-Pesa · PesaLink · Card" : "—"} sub="last 90 days" /></div>
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <div className="d-flex align-items-center gap-2">
              <Avatar name={c.name} size={34} />
              <div>
                <div className="fw-bold pm-fs-14">{c.name} — {c.business}</div>
                <div className="pm-muted pm-fs-11">{c.phone} · {c.pin}</div>
              </div>
            </div>
            <select className="form-select form-select-sm pm-input pm-w-220" value={cust} onChange={(e) => setCust(e.target.value)}>
              {customers.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.business}</option>)}
            </select>
          </div>

          <div className="table-responsive mt-2">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Invoice #</th><th>Issued</th><th>Due</th><th className="text-end">Amount</th><th className="text-end">Paid</th><th className="text-end">Balance</th><th>Status</th></tr></thead>
              <tbody>
                {invs.length === 0 && (
                  <tr><td colSpan={7}><div className="pm-empty"><div className="pm-empty-title">No invoices yet</div><div className="pm-empty-body">Create the first invoice for this customer.</div></div></td></tr>
                )}
                {invs.map((i) => {
                  const bal = i.amount - i.paid;
                  return (
                    <tr key={i.id}>
                      <td className="pm-mono pm-fs-13 fw-bold">{i.number}</td>
                      <td className="pm-muted pm-fs-12">{fmtDate(i.issue)}</td>
                      <td className="pm-muted pm-fs-12">{fmtDate(i.due)}</td>
                      <td className="text-end pm-fs-13">{fmt(i.amount)}</td>
                      <td className="text-end pm-fs-13 t-success">{i.paid ? fmt(i.paid) : "—"}</td>
                      <td className={cls("text-end pm-fs-13 fw-bold", bal > 0 && "t-warning")}>{bal ? fmt(bal) : "—"}</td>
                      <td><Badge tone={i.status === "paid" ? "success" : i.status === "overdue" ? "danger" : i.status === "partial" ? "warning" : "muted"} dot={i.status === "partial"}>{i.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="pm-tot-row">
                  <td colSpan={3}>Totals</td>
                  <td className="text-end fw-bold">{fmt(invs.reduce((s, i) => s + i.amount, 0))}</td>
                  <td className="text-end fw-bold t-success">{fmt(invs.reduce((s, i) => s + i.paid, 0))}</td>
                  <td className="text-end fw-bold t-warning">{fmt(invs.reduce((s, i) => s + (i.amount - i.paid), 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pm-preview-label mt-3">Payment history ({payments.length} receipts)</div>
          {payments.length === 0 && <div className="pm-muted pm-fs-13">No payments recorded yet.</div>}
          {payments.map((p) => (
            <div className="pm-line-view" key={p.id}>
              <span className="pm-acc-ic pm-acc-ic-mpesa"><ArrowRightLeft size={15} /></span>
              <div className="flex-grow-1">
                <div className="fw-semibold pm-fs-13">{p.method} · {p.inv}</div>
                <div className="pm-muted pm-fs-11">{fmtDate(p.t)} · ref {p.ref}</div>
              </div>
              <div className="text-end">
                <b className="pm-fs-13 t-success">+{fmt(p.amount)}</b>
                <div><Badge tone={p.status === "settled" ? "success" : "warning"}>{p.status}</Badge></div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ statement generator ════ */}
      <StatementModal c={statement} onClose={() => { setStatement(null); setStatementResult(null); }} notify={notify}
        result={statementResult} setResult={setStatementResult}
        invs={statement ? invoicesSeed.filter((i) => i.customerId === statement.id) : []} />
    </>
  );
}

function StatementModal({ c, onClose, notify, result, setResult, invs }: {
  c: CrmCustomer | null; onClose: () => void; notify: Notify;
  result: string | null; setResult: (r: string | null) => void;
  invs: typeof invoicesSeed;
}) {
  const [period, setPeriod] = useState("This year");
  const [fmtSel, setFmtSel] = useState("csv");
  const [channel, setChannel] = useState("whatsapp");
  if (!c) return null;
  const gen = () => {
    const fn = `statement-${c.name.toLowerCase().replace(/\W+/g, "-")}-${todayISO()}`;
    if (fmtSel === "csv") {
      downloadCSV(`${fn}.csv`,
        [["STATEMENT OF ACCOUNT", c.name, c.business],
        ["Period", period, "KRA PIN " + c.pin],
        ["Invoice #", "Issued", "Due", "Amount", "Paid", "Balance", "Status"],
        ...invs.map((i) => [i.number, i.issue, i.due, i.amount, i.paid, i.amount - i.paid, i.status]),
        ["", "", "", "TOTAL", invs.reduce((s, i) => s + i.amount, 0), invs.reduce((s, i) => s + i.paid, 0), invs.reduce((s, i) => s + (i.amount - i.paid), 0)]]);
      notify({ tone: "success", title: "Statement downloaded", body: `${c.name} · ${invs.length} invoice(s) included.` });
      setResult(`${fn}.csv downloaded`);
    } else {
      const w = window.open("", "_blank", "width=860,height=900");
      if (!w) { notify({ tone: "warning", title: "Pop-up blocked", body: "Allow pop-ups to print the statement." }); return; }
      w.document.write(`<html><head><title>Statement — ${c.name}</title><style>body{font-family:Arial;padding:40px}h1{font-size:20px;margin-bottom:2px}p{font-size:12px;color:#555}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}.r{text-align:right}.tot{font-weight:bold;border-top:2px solid #000}.f{margin-top:24px;font-size:11px;color:#777;border-top:1px solid #ddd;padding-top:10px}</style></head><body>
      <h1>TechSol Ltd — Statement of Account</h1><p>${c.name} · ${c.business} · KRA PIN ${c.pin} · ${period}</p>
      <table><tr><th>Invoice</th><th>Issued</th><th>Due</th><th class="r">Amount</th><th class="r">Paid</th><th class="r">Balance</th></tr>
      ${invs.map((i) => `<tr><td>${i.number}</td><td>${i.issue}</td><td>${i.due}</td><td class="r">${i.amount.toLocaleString()}</td><td class="r">${i.paid.toLocaleString()}</td><td class="r">${(i.amount - i.paid).toLocaleString()}</td></tr>`).join("")}
      <tr class="tot"><td colspan="3">TOTAL</td><td class="r">${invs.reduce((s, i) => s + i.amount, 0).toLocaleString()}</td><td class="r">${invs.reduce((s, i) => s + i.paid, 0).toLocaleString()}</td><td class="r">${invs.reduce((s, i) => s + (i.amount - i.paid), 0).toLocaleString()}</td></tr></table>
      <div class="f">Pay via M-Pesa Paybill 880321, account reference your invoice number · questions? billing@techsol.co.ke</div>
      <script>window.onload=()=>window.print()</script></body></html>`);
      w.document.close();
      setResult("PDF sent to printer");
    }
  };
  return (
    <Modal open={!!c} onClose={onClose} kicker="Statement of Account" title={`Statement — ${c.name}`} subtitle={`${c.business} · ${invs.length} invoice(s) on record`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        {result && <button className="btn pm-btn-soft" onClick={() => { notify({ tone: "info", title: "Sent via " + channel, body: `${c.name} · ${c.phone}` }); }}><Send size={15} /> Send to customer</button>}
        <button className="btn pm-btn-primary" onClick={gen}><Download size={15} /> Generate</button></>}
    >
      <Field label="Period"><div className="pm-mode-tabs">{["This year", "Last 12 months", "All time"].map((p) => <button key={p} className={cls("pm-mode-tab", period === p && "pm-mode-on")} onClick={() => setPeriod(p)}>{p}</button>)}</div></Field>
      <Field label="Format"><div className="pm-radio-grid">
        <button className={cls("pm-radio-card", fmtSel === "csv" && "pm-radio-on")} onClick={() => setFmtSel("csv")}><b>CSV</b><span>Excel-ready statement</span></button>
        <button className={cls("pm-radio-card", fmtSel === "pdf" && "pm-radio-on")} onClick={() => setFmtSel("pdf")}><b>Print PDF</b><span>Bank-grade layout</span></button>
      </div></Field>
      <Field label="Delivery channel (after generate)">
        <div className="pm-mode-tabs">
          <button className={cls("pm-mode-tab", channel === "whatsapp" && "pm-mode-on")} onClick={() => setChannel("whatsapp")}>WhatsApp</button>
          <button className={cls("pm-mode-tab", channel === "email" && "pm-mode-on")} onClick={() => setChannel("email")}>Email</button>
          <button className={cls("pm-mode-tab", channel === "sms" && "pm-mode-on")} onClick={() => setChannel("sms")}>SMS link</button>
        </div>
      </Field>
      {result && <div className="pm-cyan-note">✓ {result} — use "Send to customer" to deliver it via {channel}.</div>}
    </Modal>
  );
}
