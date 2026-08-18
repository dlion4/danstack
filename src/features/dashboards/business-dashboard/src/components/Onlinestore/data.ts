/* ==================================================================
   PayMo Business — PAGE 8: INVENTORY & STOCK — data layer
================================================================== */

/* ================= Types ================= */
export type LocType = "Warehouse" | "Shop floor" | "Quarantine" | "In transit";
export type MoveType = "Purchase" | "Sale" | "Adjustment" | "Transfer in" | "Transfer out" | "Return" | "Count" | "Write-off";
export type POStatus = "Draft" | "Sent" | "Partial" | "Received" | "Closed";
export type CountStatus = "Counting" | "Completed";
export type ReturnStatus = "Pending inspection" | "Approved" | "Quarantined" | "Restocked" | "Refunded" | "Destroyed";

export interface Product {
  id: string; name: string; sku: string; category: string;
  cost: number; price: number; emoji: string; img: string; supplier: string;
  reorderAt: number; reorderQty: number; autoPO: boolean;
  stockByLoc: Record<string, number>; onOrder: number; sold30: number;
  status: "Active" | "Draft" | "Archived"; serialized: boolean; updated: string;
}
export interface Location { id: string; name: string; type: LocType; desc: string; isDefault?: boolean }
export interface Movement {
  id: string; time: string; type: MoveType; productId: string;
  qty: number; locId: string; balance: number; value: number; ref: string; by: string;
}
export interface Adjustment {
  id: string; date: string; type: string; locId: string; by: string;
  items: { productId: string; qty: number; reason: string }[]; value: number; note: string;
}
export interface CountItem { productId: string; expected: number; counted: number | null; variance: number | null }
export interface StockCount {
  id: string; name: string; scopeLabel: string; locId: string; assignedTo: string;
  status: CountStatus; started: string; items: CountItem[];
}
export interface POItem { productId: string; qty: number; received: number }
export interface PO {
  id: string; supplier: string; date: string; expected: string; note: string;
  status: POStatus; items: POItem[];
}
export interface Batch { id: string; productId: string; batchNo: string; expiry: string; daysLeft: number; qty: number; locId: string }
export interface ReturnItem {
  id: string; orderId: string; productId: string; qty: number; reason: string;
  status: ReturnStatus; date: string; value: number; condition: string;
}
export interface Supplier { name: string; leadDays: number; onTime: number; openPOs: number; category: string }
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

const IMG = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=160&w=240`;

/* ================= Locations ================= */
export const LOCS: Location[] = [
  { id: "l1", name: "Main Warehouse", type: "Warehouse", desc: "Nairobi · Industrial Area", isDefault: true },
  { id: "l2", name: "Shop Floor", type: "Shop floor", desc: "Lavington storefront", isDefault: false },
  { id: "l3", name: "Quarantine", type: "Quarantine", desc: "Returns & damaged — inspection", isDefault: false },
  { id: "l4", name: "In Transit", type: "In transit", desc: "With couriers & suppliers", isDefault: false },
];

/* ================= Products (SKU master) ================= */
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Safari Blend Coffee Beans 500g", sku: "PRD-001", category: "Food & Beverage", cost: 980, price: 1850, emoji: "☕", img: IMG("37987695"), supplier: "Kirinyaga Farmers Co-op", reorderAt: 15, reorderQty: 30, autoPO: true, stockByLoc: { l1: 48, l2: 16 }, onOrder: 0, sold30: 214, status: "Active", serialized: false, updated: "Today 09:12" },
  { id: "p2", name: "Kitui Wild Honey 500ml", sku: "PRD-002", category: "Food & Beverage", cost: 720, price: 1250, emoji: "🍯", img: IMG("9106164"), supplier: "Kitui Honey Group", reorderAt: 10, reorderQty: 24, autoPO: true, stockByLoc: { l1: 29, l2: 12 }, onOrder: 0, sold30: 168, status: "Active", serialized: false, updated: "Today 08:40" },
  { id: "p3", name: "Cold-Pressed Coconut Oil 250ml", sku: "PRD-003", category: "Beauty & Wellness", cost: 520, price: 950, emoji: "🥥", img: IMG("725998"), supplier: "Coast Naturals Ltd", reorderAt: 20, reorderQty: 40, autoPO: false, stockByLoc: { l1: 70, l2: 18 }, onOrder: 0, sold30: 121, status: "Active", serialized: false, updated: "Yesterday" },
  { id: "p4", name: "Handwoven Kiondo Basket", sku: "PRD-004", category: "Crafts & Art", cost: 1180, price: 2450, emoji: "🧺", img: IMG("31653080"), supplier: "Kitui Weavers Sacco", reorderAt: 8, reorderQty: 25, autoPO: true, stockByLoc: { l1: 20, l2: 7 }, onOrder: 15, sold30: 142, status: "Active", serialized: false, updated: "Yesterday" },
  { id: "p5", name: "Maasai Beaded Bracelet Set", sku: "PRD-005", category: "Crafts & Art", cost: 430, price: 1150, emoji: "📿", img: IMG("32405949"), supplier: "Maasai Women's Collective", reorderAt: 25, reorderQty: 60, autoPO: true, stockByLoc: { l1: 90, l2: 30 }, onOrder: 0, sold30: 188, status: "Active", serialized: false, updated: "2d ago" },
  { id: "p6", name: "Beaded Statement Necklace", sku: "PRD-006", category: "Crafts & Art", cost: 750, price: 1800, emoji: "💎", img: IMG("32568146"), supplier: "Maasai Women's Collective", reorderAt: 10, reorderQty: 20, autoPO: false, stockByLoc: { l1: 34 }, onOrder: 0, sold30: 0, status: "Draft", serialized: false, updated: "3d ago" },
  { id: "p7", name: "Kikoy Beach Wrap", sku: "PRD-007", category: "Fashion & Apparel", cost: 640, price: 1600, emoji: "👗", img: IMG("33337878"), supplier: "Mombasa Textiles", reorderAt: 12, reorderQty: 30, autoPO: false, stockByLoc: { l1: 40, l2: 15 }, onOrder: 0, sold30: 96, status: "Active", serialized: false, updated: "4d ago" },
  { id: "p8", name: "Macadamia Gift Pack 300g", sku: "PRD-008", category: "Food & Beverage", cost: 1400, price: 2200, emoji: "🥜", img: IMG("4834307"), supplier: "Embu Nuts Ltd", reorderAt: 8, reorderQty: 15, autoPO: false, stockByLoc: { l1: 14, l2: 5 }, onOrder: 0, sold30: 87, status: "Active", serialized: false, updated: "5d ago" },
  { id: "p9", name: "Batik Cushion Cover", sku: "PRD-009", category: "Home & Living", cost: 520, price: 1400, emoji: "🛋️", img: IMG("20164063"), supplier: "Nairobi Print Studio", reorderAt: 10, reorderQty: 20, autoPO: false, stockByLoc: { l1: 36, l2: 10 }, onOrder: 0, sold30: 64, status: "Active", serialized: false, updated: "6d ago" },
  { id: "p10", name: "Ankole Cow-Horn Mug", sku: "PRD-010", category: "Home & Living", cost: 1450, price: 2800, emoji: "🏆", img: IMG("32405948"), supplier: "Ankole Crafts Co-op", reorderAt: 10, reorderQty: 20, autoPO: true, stockByLoc: { l1: 4, l2: 2 }, onOrder: 0, sold30: 52, status: "Active", serialized: true, updated: "6d ago" },
  { id: "p11", name: "Mt. Kenya Ceramic Mug", sku: "PRD-011", category: "Home & Living", cost: 480, price: 1100, emoji: "🍵", img: IMG("7796223"), supplier: "Nyeri Pottery Works", reorderAt: 10, reorderQty: 40, autoPO: true, stockByLoc: { l1: 0 }, onOrder: 40, sold30: 44, status: "Active", serialized: false, updated: "1w ago" },
  { id: "p12", name: "Spiced Chai Blend 250g", sku: "PRD-012", category: "Food & Beverage", cost: 320, price: 780, emoji: "🫖", img: IMG("18751139"), supplier: "Kericho Tea Estate", reorderAt: 12, reorderQty: 24, autoPO: true, stockByLoc: { l1: 5, l2: 2 }, onOrder: 0, sold30: 109, status: "Active", serialized: false, updated: "1w ago" },
  { id: "p13", name: "Shea Butter Body Balm", sku: "PRD-013", category: "Beauty & Wellness", cost: 610, price: 1350, emoji: "🧴", img: IMG("7795662"), supplier: "Nairobi Naturals", reorderAt: 15, reorderQty: 36, autoPO: false, stockByLoc: { l1: 58, l3: 2 }, onOrder: 0, sold30: 0, status: "Draft", serialized: false, updated: "2w ago" },
  { id: "p14", name: "Sisal Serving Tray", sku: "PRD-014", category: "Home & Living", cost: 900, price: 2150, emoji: "🍽️", img: IMG("34667136"), supplier: "Kitui Weavers Sacco", reorderAt: 5, reorderQty: 10, autoPO: false, stockByLoc: { l1: 15 }, onOrder: 0, sold30: 0, status: "Archived", serialized: false, updated: "3w ago" },
];

export const stockOf = (p: Product) => Object.values(p.stockByLoc).reduce((a, b) => a + b, 0);
export const valueOf = (p: Product) => stockOf(p) * p.cost;
export const coverOf = (p: Product) => {
  const daily = p.sold30 / 30;
  if (daily <= 0) return stockOf(p) > 0 ? Infinity : 0;
  return Math.round((stockOf(p) / daily) * 10) / 10;
};

/* ================= Movements ================= */
export const MOVEMENTS: Movement[] = [
  { id: "mv-1", time: "Today 09:12", type: "Sale", productId: "p2", qty: -2, locId: "l2", balance: 41, value: -1440, ref: "ORD-1102", by: "System" },
  { id: "mv-2", time: "Today 08:40", type: "Purchase", productId: "p2", qty: 12, locId: "l1", balance: 43, value: 8640, ref: "PO-1039", by: "Mwangi K." },
  { id: "mv-3", time: "Today 08:06", type: "Transfer in", productId: "p5", qty: 10, locId: "l2", balance: 30, value: 4300, ref: "TRF-2210", by: "Mwangi K." },
  { id: "mv-4", time: "Today 08:05", type: "Transfer out", productId: "p5", qty: -10, locId: "l1", balance: 90, value: -4300, ref: "TRF-2210", by: "Mwangi K." },
  { id: "mv-5", time: "Yesterday", type: "Sale", productId: "p1", qty: -3, locId: "l2", balance: 64, value: -2940, ref: "ORD-1100", by: "System" },
  { id: "mv-6", time: "Yesterday", type: "Adjustment", productId: "p9", qty: -2, locId: "l1", balance: 46, value: -1040, ref: "ADJ-019", by: "Achieng O." },
  { id: "mv-7", time: "Yesterday", type: "Return", productId: "p11", qty: 1, locId: "l3", balance: 1, value: 480, ref: "RTN-034", by: "Achieng O." },
  { id: "mv-8", time: "2d ago", type: "Purchase", productId: "p3", qty: 24, locId: "l1", balance: 88, value: 12480, ref: "PO-1038", by: "Mwangi K." },
  { id: "mv-9", time: "2d ago", type: "Write-off", productId: "p12", qty: -2, locId: "l1", balance: 7, value: -640, ref: "EXP-009", by: "Achieng O." },
  { id: "mv-10", time: "3d ago", type: "Count", productId: "p4", qty: -1, locId: "l1", balance: 27, value: -1180, ref: "CNT-112", by: "Achieng O." },
  { id: "mv-11", time: "3d ago", type: "Sale", productId: "p10", qty: -1, locId: "l2", balance: 6, value: -1450, ref: "ORD-1095", by: "System" },
  { id: "mv-12", time: "4d ago", type: "Transfer out", productId: "p3", qty: -6, locId: "l1", balance: 64, value: -3120, ref: "TRF-2209", by: "Mwangi K." },
  { id: "mv-13", time: "4d ago", type: "Transfer in", productId: "p3", qty: 6, locId: "l2", balance: 24, value: 3120, ref: "TRF-2209", by: "Mwangi K." },
  { id: "mv-14", time: "5d ago", type: "Purchase", productId: "p1", qty: 30, locId: "l1", balance: 67, value: 29400, ref: "PO-1040", by: "Mwangi K." },
  { id: "mv-15", time: "6d ago", type: "Adjustment", productId: "p11", qty: -3, locId: "l1", balance: 0, value: -1440, ref: "ADJ-015", by: "Wanjiku M." },
];

/* ================= Adjustments ================= */
export const ADJUSTMENTS: Adjustment[] = [
  { id: "ADJ-019", date: "Yesterday 14:20", type: "Damage", locId: "l1", by: "Achieng O.", items: [{ productId: "p9", qty: -2, reason: "Torn seam — unsaleable" }], value: -1040, note: "Found during pack out. Photos attached." },
  { id: "ADJ-018", date: "2d ago", type: "Theft", locId: "l1", by: "Mwangi K.", items: [{ productId: "p5", qty: -5, reason: "Shoplifting (floor stock)" }], value: -2150, note: "CCTV reviewed — police OB filed." },
  { id: "ADJ-017", date: "3d ago", type: "Cycle count", locId: "l1", by: "Achieng O.", items: [{ productId: "p4", qty: -1, reason: "Count variance" }], value: -1180, note: "CNT-112 reconciliation." },
  { id: "ADJ-016", date: "4d ago", type: "Expired", locId: "l1", by: "Achieng O.", items: [{ productId: "p12", qty: -2, reason: "Batch B-2310 past best-before" }], value: -640, note: "Write-off EXP-009." },
  { id: "ADJ-015", date: "6d ago", type: "Return to supplier", locId: "l1", by: "Wanjiku M.", items: [{ productId: "p11", qty: -3, reason: "Glaze defects — supplier credit issued" }], value: -1440, note: "Replaced under supplier warranty." },
  { id: "ADJ-014", date: "2w ago", type: "Initial count", locId: "l1", by: "Wanjiku M.", items: [{ productId: "p13", qty: 60, reason: "Opening balance — new SKU" }], value: 36600, note: "Opening stock after CSV import." },
];

/* ================= Stock counts ================= */
export const COUNTS: StockCount[] = [
  {
    id: "CNT-113", name: "Quarterly full count — Main Warehouse", scopeLabel: "Main Warehouse", locId: "l1",
    assignedTo: "Achieng O.", status: "Counting", started: "Today 07:30",
    items: [
      { productId: "p1", expected: 48, counted: 48, variance: 0 },
      { productId: "p2", expected: 29, counted: 29, variance: 0 },
      { productId: "p4", expected: 20, counted: 20, variance: 0 },
      { productId: "p10", expected: 4, counted: 4, variance: 0 },
      { productId: "p12", expected: 5, counted: 4, variance: -1 },
      { productId: "p3", expected: 70, counted: null, variance: null },
      { productId: "p5", expected: 90, counted: null, variance: null },
      { productId: "p7", expected: 40, counted: null, variance: null },
    ],
  },
  {
    id: "CNT-112", name: "Shop floor spot count", scopeLabel: "Shop Floor", locId: "l2",
    assignedTo: "Achieng O.", status: "Completed", started: "1w ago",
    items: [
      { productId: "p1", expected: 16, counted: 16, variance: 0 },
      { productId: "p4", expected: 8, counted: 7, variance: -1 },
      { productId: "p7", expected: 15, counted: 15, variance: 0 },
      { productId: "p10", expected: 2, counted: 2, variance: 0 },
    ],
  },
];

/* ================= Purchase orders ================= */
export const POS: PO[] = [
  { id: "PO-1042", supplier: "Nyeri Pottery Works", date: "5d ago", expected: "In 4 days", note: "Restock after stockout — customer backorders piling up.", status: "Sent", items: [{ productId: "p11", qty: 40, received: 0 }] },
  { id: "PO-1041", supplier: "Kitui Weavers Sacco", date: "1w ago", expected: "Tomorrow", note: "Seasonal demand — kiondo baskets.", status: "Partial", items: [{ productId: "p4", qty: 25, received: 10 }] },
  { id: "PO-1040", supplier: "Kirinyaga Farmers Co-op", date: "1w ago", expected: "Delivered", note: "", status: "Received", items: [{ productId: "p1", qty: 30, received: 30 }] },
  { id: "PO-1039", supplier: "Kitui Honey Group", date: "2w ago", expected: "Delivered", note: "", status: "Received", items: [{ productId: "p2", qty: 12, received: 12 }] },
  { id: "PO-1038", supplier: "Coast Naturals Ltd", date: "2w ago", expected: "Delivered", note: "", status: "Received", items: [{ productId: "p3", qty: 24, received: 24 }] },
  { id: "PO-1037", supplier: "Embu Nuts Ltd", date: "3d ago", expected: "—", note: "Save for next week's price list.", status: "Draft", items: [{ productId: "p8", qty: 15, received: 0 }] },
];

/* ================= Batches ================= */
export const BATCHES: Batch[] = [
  { id: "b1", productId: "p2", batchNo: "B-2302", expiry: "7 Aug 2026", daysLeft: 6, qty: 3, locId: "l1" },
  { id: "b2", productId: "p12", batchNo: "B-2315", expiry: "15 Aug 2026", daysLeft: 14, qty: 5, locId: "l2" },
  { id: "b3", productId: "p2", batchNo: "B-2401", expiry: "15 Sep 2026", daysLeft: 45, qty: 14, locId: "l1" },
  { id: "b4", productId: "p3", batchNo: "B-2309", expiry: "30 Oct 2026", daysLeft: 90, qty: 18, locId: "l1" },
  { id: "b5", productId: "p13", batchNo: "B-2311", expiry: "29 Nov 2026", daysLeft: 120, qty: 22, locId: "l1" },
  { id: "b6", productId: "p2", batchNo: "B-2402", expiry: "29 Jan 2027", daysLeft: 181, qty: 9, locId: "l1" },
];

/* ================= Returns ================= */
export const RETURNS: ReturnItem[] = [
  { id: "RTN-035", orderId: "ORD-1094", productId: "p7", qty: 1, reason: "Wrong size requested", status: "Pending inspection", date: "Today 09:50", value: 1600, condition: "Awaiting courier drop-off" },
  { id: "RTN-034", orderId: "ORD-1092", productId: "p11", qty: 1, reason: "Arrived cracked", status: "Destroyed", date: "6d ago", value: 1100, condition: "Unusable — refund issued via M-Pesa" },
  { id: "RTN-033", orderId: "ORD-1091", productId: "p1", qty: 1, reason: "Damaged seal", status: "Quarantined", date: "6d ago", value: 1850, condition: "Held in Quarantine — awaiting supplier pickup" },
  { id: "RTN-032", orderId: "ORD-1088", productId: "p10", qty: 1, reason: "Customer changed mind (unopened)", status: "Restocked", date: "1w ago", value: 2800, condition: "Like new — back on shelf" },
  { id: "RTN-031", orderId: "ORD-1086", productId: "p5", qty: 2, reason: "Sizing issue", status: "Refunded", date: "1w ago", value: 2300, condition: "Refund only — customer kept items" },
];

/* ================= Suppliers ================= */
export const SUPPLIERS: Supplier[] = [
  { name: "Kirinyaga Farmers Co-op", leadDays: 3, onTime: 96, openPOs: 0, category: "Coffee" },
  { name: "Coast Naturals Ltd", leadDays: 4, onTime: 92, openPOs: 0, category: "Wellness" },
  { name: "Kitui Honey Group", leadDays: 5, onTime: 88, openPOs: 0, category: "Food" },
  { name: "Kitui Weavers Sacco", leadDays: 6, onTime: 90, openPOs: 1, category: "Crafts" },
  { name: "Nyeri Pottery Works", leadDays: 7, onTime: 74, openPOs: 1, category: "Home" },
];

/* ================= Analytics ================= */
export const VALUE_TREND = [368, 372, 365, 381, 378, 390, 396, 388, 401, 398, 405, 412, 409, 418, 415, 428, 424, 432, 438, 435, 441, 448, 445, 452, 458, 455, 462, 468, 465, 471];
export const MOVE_COUNTS_30D = [12, 18, 9, 22, 17, 15, 21, 19, 16, 14, 24, 20, 18, 22, 17, 19, 23, 21, 15, 18, 26, 22, 19, 24, 21, 23, 20, 25, 22, 27];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-exclamation-triangle", text: "3 SKUs below reorder point — KES 18,900 to restock", time: "12 min ago", unread: true, action: "Reorder" },
  { id: 2, icon: "bi-clock-history", text: "PO-1041 partially received — 15 kiondo due tomorrow", time: "1 hr ago", unread: true, action: "View PO" },
  { id: 3, icon: "bi-clipboard-check", text: "Stock count CNT-113 at 62% — variance of 1 on Chai Blend", time: "2 hrs ago", unread: true, action: "Resume" },
  { id: 4, icon: "bi-hourglass-split", text: "Batch B-2302 (Kitui Honey) expires in 6 days", time: "3 hrs ago", unread: true, action: "Write off" },
  { id: 5, icon: "bi-box-arrow-in-right", text: "RTN-035 return awaiting inspection from ORD-1094", time: "Yesterday", unread: false },
  { id: 6, icon: "bi-graph-down-arrow", text: "Stock value down 1.2% this week (KES 4,780)", time: "2 days ago", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 09:12", icon: "bi-bag-check", text: "Sale posted: 2× Kitui Wild Honey (ORD-1102) — stock auto-decremented", by: "System" },
  { time: "Today 08:40", icon: "bi-box-arrow-in-down", text: "PO-1039 received: 12× Kitui Honey into Main Warehouse", by: "Mwangi K." },
  { time: "Today 08:05", icon: "bi-arrow-left-right", text: "Transfer TRF-2210: 10× Beaded Bracelet → Shop Floor", by: "Mwangi K." },
  { time: "Yesterday", icon: "bi-clipboard-x", text: "Adjustment ADJ-019 posted: −2 Batik Cushion (damage)", by: "Achieng O." },
  { time: "Yesterday", icon: "bi-arrow-counterclockwise", text: "Return RTN-034 processed: cracked mug destroyed, refund issued", by: "Achieng O." },
  { time: "2 days ago", icon: "bi-trash", text: "Write-off EXP-009: −2 Spiced Chai (expired batch B-2310)", by: "Achieng O." },
  { time: "3 days ago", icon: "bi-sliders", text: "Reorder points recalculated from 30-day velocity", by: "System" },
  { time: "1 week ago", icon: "bi-clipboard-check", text: "Spot count CNT-112 completed — accuracy 98.7%", by: "Achieng O." },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];

export const TEAM = ["Wanjiku Maina", "Mwangi Kamau", "Achieng Otieno", "Brian Kim"];
