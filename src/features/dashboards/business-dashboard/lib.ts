/* ── Shared helpers for PayMo Get Paid ─────────────────────────────── */

export const cls = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

export const fmt = (n: number) =>
  `KES ${Math.round(n).toLocaleString("en-KE")}`;

export const fmtN = (n: number) => Math.round(n).toLocaleString("en-KE");

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, days: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const fmtDate = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDT = (iso: string) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${h}:${m}`;
};

export const daysAgo = (iso: string) =>
  Math.max(0, Math.round((Date.now() - new Date(iso + "T00:00:00").getTime()) / 86400000));

export const daysUntil = (iso: string) =>
  Math.round((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86400000);

let seq = 0;
export const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${++seq}`;

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const hueFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};

export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const downloadCSV = (filename: string, rows: Array<Array<string | number>>) => {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return true;
  }
};

/* Deterministic pseudo-QR grid from a string (21×21 modules) */
export const qrGrid = (value: string): boolean[][] => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  const N = 21;
  const g: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const on = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
        if (r + i < N && c + j < N) g[r + i][c + j] = on;
      }
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (i < 8 && j < 8) continue;
      if (i < 8 && j > N - 9) continue;
      if (i > N - 9 && j < 8) continue;
      g[i][j] = rand() > 0.52;
    }
  return g;
};

export const statusMeta: Record<string, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "muted" },
  sent: { label: "Sent", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  partial: { label: "Partially Paid", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "dark" },
};

export type QAction = { a: string; p?: unknown } | null;
