/* ==================================================================
   PayMo Business — PAGE 7: DISPUTE MANAGEMENT & SUPPORT — data layer
================================================================== */

/* ================= Types ================= */
export type DisputeType = "M-Pesa Reversal Claim" | "Card Chargeback" | "PesaLink Dispute" | "Non-Delivery Claim" | "Quality / Damaged" | "Fraudulent Transaction";
export type DisputeStatus = "Needs Evidence" | "Under Arbitration" | "Won" | "Lost" | "Submitted" | "Pending Customer";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type SupportCategory = "Payment Reversal" | "eTIMS Receipt Error" | "KYB / Limits" | "Payout Delay" | "API / Webhook";
export type TicketStatus = "Open" | "In Progress" | "Pending Customer" | "Resolved" | "Escalated";

export interface Dispute {
  id: string;
  type: DisputeType;
  txnId: string;
  channel: "M-Pesa" | "Card" | "PesaLink" | "Payment Link";
  customerName: string;
  customerPhone: string;
  amount: number;
  feeAtRisk: number;
  reason: string;
  raisedDate: string;
  deadline: string;
  daysLeft: number;
  status: DisputeStatus;
  evidenceSubmitted: boolean;
  evidenceDocs: string[];
  arbitrator: string;
  notes: string;
  timeline: { time: string; title: string; note: string }[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: SupportCategory;
  priority: Priority;
  status: TicketStatus;
  created: string;
  lastUpdate: string;
  agent: string;
  messages: { sender: string; text: string; time: string; isAgent: boolean; attachment?: string }[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: "Waybill / Delivery Proof" | "eTIMS Fiscal Receipt" | "Customer WhatsApp Chat" | "Signature" | "Terms of Service";
  fileName: string;
  uploaded: string;
  verified: boolean;
  disputeId: string;
}

export interface ChargebackRisk {
  disputeRatio: number; // e.g. 0.35%
  cbkThreshold: number; // e.g. 0.90%
  totalDisputes30d: number;
  won30d: number;
  lost30d: number;
  pending30d: number;
  atRiskAmount: number;
  winRate: number; // e.g. 84%
}

export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Disputes ================= */
export const DISPUTES: Dispute[] = [
  {
    id: "DSP-2026-089",
    type: "M-Pesa Reversal Claim",
    txnId: "QK88123049",
    channel: "M-Pesa",
    customerName: "Dennis Otieno",
    customerPhone: "0728 663 441",
    amount: 14500,
    feeAtRisk: 450,
    reason: "Customer claims accidental payment via M-Pesa Paybill",
    raisedDate: "Yesterday 14:20",
    deadline: "In 2 days (18 Jan)",
    daysLeft: 2,
    status: "Needs Evidence",
    evidenceSubmitted: false,
    evidenceDocs: [],
    arbitrator: "Safaricom Reversal Desk",
    notes: "Goods delivered via Sendy waybill SK-88412. Need to upload waybill + signed delivery note.",
    timeline: [
      { time: "Yesterday 14:20", title: "Reversal claim initiated", note: "Customer lodged claim via Safaricom 234 customer care" },
      { time: "Yesterday 14:21", title: "Funds placed on hold", note: "KES 14,500 held in PayMo Dispute Reserve" },
      { time: "Yesterday 15:00", title: "Evidence requested", note: "Upload proof of delivery within 72 hours" },
    ],
  },
  {
    id: "DSP-2026-088",
    type: "Card Chargeback",
    txnId: "DPO-991204-C",
    channel: "Card",
    customerName: "Claire Miller",
    customerPhone: "0711 002 991",
    amount: 28000,
    feeAtRisk: 1200,
    reason: "Fraudulent / Unauthorized card transaction (Reason Code 10.4)",
    raisedDate: "12 Jan 2026",
    deadline: "In 5 days (21 Jan)",
    daysLeft: 5,
    status: "Under Arbitration",
    evidenceSubmitted: true,
    evidenceDocs: ["Sendy_Waybill_9912.pdf", "eTIMS_Receipt_P0512.pdf", "3DS_Authentication_Log.pdf"],
    arbitrator: "DPO Group / Visa Arbitration",
    notes: "3D-Secure 2.0 log proves buyer authenticated via OTP. Strong defence case.",
    timeline: [
      { time: "12 Jan 10:00", title: "Chargeback notice received", note: "Visa dispute raised through issuing bank" },
      { time: "13 Jan 09:30", title: "Evidence submitted", note: "3DS logs + waybill submitted via DPO portal" },
      { time: "14 Jan 11:00", title: "Under bank review", note: "Visa arbiter inspecting 3DS liability shift" },
    ],
  },
  {
    id: "DSP-2026-085",
    type: "Non-Delivery Claim",
    txnId: "QK88100231",
    channel: "Payment Link",
    customerName: "Amina Hassan",
    customerPhone: "0710 556 302",
    amount: 8500,
    feeAtRisk: 250,
    reason: "Customer claims parcel not received within promised 48 hours",
    raisedDate: "8 Jan 2026",
    deadline: "Resolved",
    daysLeft: 0,
    status: "Won",
    evidenceSubmitted: true,
    evidenceDocs: ["Mombasa_Courier_Receipt.pdf", "WhatsApp_Confirmation_Chat.png"],
    arbitrator: "PayMo Internal Arbitration",
    notes: "Recipient signed for parcel on 9 Jan 10:15am. Claim ruled in favor of merchant.",
    timeline: [
      { time: "8 Jan 16:00", title: "Dispute opened", note: "Buyer claimed non-delivery via payment link portal" },
      { time: "8 Jan 17:30", title: "Delivery proof uploaded", note: "Signed courier receipt submitted" },
      { time: "9 Jan 14:00", title: "Dispute resolved — WON", note: "Funds released back to merchant wallet" },
    ],
  },
  {
    id: "DSP-2026-082",
    type: "Quality / Damaged",
    txnId: "QK88019924",
    channel: "M-Pesa",
    customerName: "Brian Otieno",
    customerPhone: "0733 812 990",
    amount: 12500,
    feeAtRisk: 350,
    reason: "Glassware arrived cracked in transit",
    raisedDate: "5 Jan 2026",
    deadline: "Resolved",
    daysLeft: 0,
    status: "Lost",
    evidenceSubmitted: true,
    evidenceDocs: ["Packaging_Photos.png"],
    arbitrator: "PayMo Resolution Desk",
    notes: "Courier damage — merchant agreed to partial refund + replacement.",
    timeline: [
      { time: "5 Jan 11:20", title: "Claim filed", note: "Customer submitted photo of cracked mug" },
      { time: "5 Jan 14:00", title: "Pre-dispute settlement offered", note: "Merchant offered 50% refund + replacement" },
      { time: "6 Jan 09:00", title: "Settlement accepted", note: "Refund processed, dispute closed" },
    ],
  },
  {
    id: "DSP-2026-078",
    type: "PesaLink Dispute",
    txnId: "PLK-990123-X",
    channel: "PesaLink",
    customerName: "Jenga Developers",
    customerPhone: "0720 112 334",
    amount: 65000,
    feeAtRisk: 1500,
    reason: "Duplicate bank transfer execution claimed",
    raisedDate: "2 Jan 2026",
    deadline: "In 1 day (17 Jan)",
    daysLeft: 1,
    status: "Pending Customer",
    evidenceSubmitted: true,
    evidenceDocs: ["Bank_Statement_Reconciliation.pdf"],
    arbitrator: "IPSL PesaLink Arbitration Desk",
    notes: "Only 1 transfer credited to PayMo account. Awaiting customer bank statement.",
    timeline: [
      { time: "2 Jan 15:00", title: "Bank dispute initiated", note: "Customer's bank (NCBA) flagged duplicate credit" },
      { time: "3 Jan 10:00", title: "Reconciliation submitted", note: "PayMo bank statement sent to IPSL" },
    ],
  },
];

/* ================= Support Tickets ================= */
export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TCK-8812",
    subject: "eTIMS Receipt Failure for Invoice INV-0089",
    category: "eTIMS Receipt Error",
    priority: "High",
    status: "In Progress",
    created: "Today 08:30",
    lastUpdate: "Today 09:15",
    agent: "Kamau N. (KRA Integration Lead)",
    messages: [
      { sender: "Wanjiku Maina", text: "When issuing invoice INV-0089, eTIMS returned error code '502 Bad Gateway'. Need fiscal receipt generated before customer payment.", time: "Today 08:30", isAgent: false },
      { sender: "Kamau N. (Support)", text: "Habari Wanjiku! KRA iTax server had a 10-minute maintenance window at 8:30am. We are resending the payload now.", time: "Today 09:15", isAgent: true },
    ],
  },
  {
    id: "TCK-8790",
    subject: "Request for M-Pesa Daily Settlement Limit Increase to KES 10M",
    category: "KYB / Limits",
    priority: "Medium",
    status: "Pending Customer",
    created: "12 Jan 2026",
    lastUpdate: "14 Jan 2026",
    agent: "Achieng O. (Risk & Compliance)",
    messages: [
      { sender: "Wanjiku Maina", text: "Our December peak volume exceeded KES 5M/day. We need Level 3 limits unlocked.", time: "12 Jan 11:00", isAgent: false },
      { sender: "Achieng O.", text: "Hello! Please upload your Audited Financial Statements for 2024/2025 to complete Level 3 verification.", time: "14 Jan 10:00", isAgent: true },
    ],
  },
  {
    id: "TCK-8755",
    subject: "Delay in NCBA Bank Payout for 10 Jan Batch",
    category: "Payout Delay",
    priority: "Urgent",
    status: "Resolved",
    created: "11 Jan 2026",
    lastUpdate: "11 Jan 16:30",
    agent: "Brian M. (Settlements)",
    messages: [
      { sender: "Wanjiku Maina", text: "Payout #PO-9912 of KES 420,000 to NCBA account hasn't reflected.", time: "11 Jan 09:00", isAgent: false },
      { sender: "Brian M.", text: "PesaLink clearing cutoff was hit at 4pm. Payout processed successfully at 4:30pm.", time: "11 Jan 16:30", isAgent: true },
    ],
  },
];

/* ================= Evidence Vault ================= */
export const EVIDENCE_VAULT: EvidenceItem[] = [
  { id: "EV-01", title: "Sendy Delivery Waybill SK-88412", type: "Waybill / Delivery Proof", fileName: "Sendy_Waybill_SK88412.pdf", uploaded: "Yesterday 15:30", verified: true, disputeId: "DSP-2026-089" },
  { id: "EV-02", title: "Signed Recipient Note — Dennis Otieno", type: "Signature", fileName: "Signed_Delivery_Note_Otieno.png", uploaded: "Yesterday 15:32", verified: true, disputeId: "DSP-2026-089" },
  { id: "EV-03", title: "Visa 3D-Secure 2.0 Auth Log", type: "Terms of Service", fileName: "Visa_3DS2_Log_DPO.pdf", uploaded: "13 Jan 09:30", verified: true, disputeId: "DSP-2026-088" },
  { id: "EV-04", title: "KRA eTIMS Fiscal Hash Receipt", type: "eTIMS Fiscal Receipt", fileName: "eTIMS_Receipt_P0512.pdf", uploaded: "13 Jan 09:35", verified: true, disputeId: "DSP-2026-088" },
  { id: "EV-05", title: "WhatsApp Customer Order Chat Log", type: "Customer WhatsApp Chat", fileName: "WhatsApp_Chat_Claire.png", uploaded: "13 Jan 09:40", verified: false, disputeId: "DSP-2026-088" },
];

/* ================= Chargeback Risk ================= */
export const CHARGEBACK_RISK: ChargebackRisk = {
  disputeRatio: 0.28, // 0.28%
  cbkThreshold: 0.90, // 0.90%
  totalDisputes30d: 5,
  won30d: 3,
  lost30d: 1,
  pending30d: 1,
  atRiskAmount: 42500,
  winRate: 75,
};

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-file-earmark-arrow-up", text: "Action required: DSP-2026-089 needs evidence within 48 hours", time: "15 min ago", unread: true, action: "Upload Evidence" },
  { id: 2, icon: "bi-bank2", text: "Card dispute DSP-2026-088 is under Visa arbitration — decision in 5 days", time: "2 hrs ago", unread: true, action: "View Dispute" },
  { id: 3, icon: "bi-check-circle-fill", text: "Dispute DSP-2026-085 WON — KES 8,500 released back to main wallet", time: "Yesterday", unread: false, action: "View Result" },
  { id: 4, icon: "bi-headset", text: "Support ticket TCK-8812 updated by KRA Integration Lead", time: "3 hrs ago", unread: true, action: "Open Ticket" },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 09:15", icon: "bi-chat-left-dots", text: "Support ticket TCK-8812 updated by Kamau N. (Support)", by: "PayMo Support" },
  { time: "Yesterday 15:32", icon: "bi-file-earmark-arrow-up", text: "Evidence EV-02 uploaded for dispute DSP-2026-089", by: "Wanjiku Maina" },
  { time: "Yesterday 14:20", icon: "bi-exclamation-triangle", text: "M-Pesa reversal claim DSP-2026-089 lodged by customer Dennis Otieno", by: "Safaricom System" },
  { time: "13 Jan 09:40", icon: "bi-shield-check", text: "Chargeback defence submitted for DSP-2026-088 (KES 28,000)", by: "Wanjiku Maina" },
  { time: "9 Jan 14:00", icon: "bi-trophy", text: "Dispute DSP-2026-085 WON — KES 8,500 credited to wallet", by: "Arbitration Desk" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];
