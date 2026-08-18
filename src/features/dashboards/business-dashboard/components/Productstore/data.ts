/* ================= Types ================= */
export type PStatus = "Active" | "Draft" | "Archived";
export type OrderStatus = "New" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  compareAt: number | null;
  cost: number;
  stock: number;
  reorderAt: number;
  vat: string;
  status: PStatus;
  listed: boolean;
  featured: boolean;
  img: string;
  emoji: string;
  sold30: number;
  rating: number;
  reviews: number;
  supplier: string;
  eTims: string;
  updated: string;
  tags: string[];
  onOrder?: number;
}

export interface OrderItem { name: string; qty: number; price: number; emoji: string; sku: string }
export interface OrderEvent { time: string; title: string; note?: string }
export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  channel: "Online Store" | "Instagram" | "WhatsApp" | "In Person";
  items: OrderItem[];
  total: number;
  payment: "M-Pesa" | "Card" | "PesaLink" | "Cash on Delivery";
  status: OrderStatus;
  date: string;
  location: string;
  events: OrderEvent[];
  deliveryFee: number;
}

export interface Discount { code: string; label: string; type: "percent" | "fixed" | "freeship"; value: number; status: "Active" | "Scheduled" | "Ended"; uses: number; cap: number }
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

export interface ThemeDef {
  id: string; name: string; emoji: string; desc: string;
  vars: { bg: string; ink: string; accent: string; card: string; soft: string };
}

export interface StoreConfig {
  name: string; tagline: string; logoEmoji: string; domain: string; customDomain: string | null;
  live: boolean; theme: string;
  sections: Record<string, boolean>;
  payments: { mpesa: boolean; card: boolean; pesalink: boolean; cod: boolean };
  paybill: string; till: string;
  zones: { name: string; price: number; eta: string }[];
  freeOver: number;
  vatRegistered: boolean; vatRate: string;
  announcement: string; returnsPolicy: boolean; sellWhenOOS: boolean;
  guestCheckout: boolean; abandonedCart: boolean;
}

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + n.toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Product images ================= */
const IMG = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=160&w=240`;

export const IMG_LIBRARY = [
  { url: IMG("37987695"), label: "Coffee" },
  { url: IMG("9106164"), label: "Honey" },
  { url: IMG("725998"), label: "Coconut oil" },
  { url: IMG("31653080"), label: "Baskets" },
  { url: IMG("32405949"), label: "Beadwork" },
  { url: IMG("32568146"), label: "Necklaces" },
  { url: IMG("33337878"), label: "Market" },
  { url: IMG("10825677"), label: "Wellness" },
  { url: IMG("20164063"), label: "Trays" },
  { url: IMG("32405948"), label: "Craft" },
  { url: IMG("7796223"), label: "Jars" },
  { url: IMG("18751139"), label: "Honey set" },
  { url: IMG("7795662"), label: "Skincare" },
  { url: IMG("4834307"), label: "Rustic" },
  { url: IMG("34667136"), label: "Woven" },
  { url: IMG("33337889"), label: "Weaving" },
];

/* ================= Products ================= */
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Safari Blend Coffee Beans 500g", sku: "PRD-001", category: "Food & Beverage", price: 1850, compareAt: 2100, cost: 980, stock: 64, reorderAt: 15, vat: "16%", status: "Active", listed: true, featured: true, img: IMG("37987695"), emoji: "☕", sold30: 214, rating: 4.8, reviews: 132, supplier: "Kirinyaga Farmers Co-op", eTims: "0901.21.00", updated: "Today 09:12", tags: ["Bestseller", "Export-ready"] },
  { id: "p2", name: "Kitui Wild Honey 500ml", sku: "PRD-002", category: "Food & Beverage", price: 1250, compareAt: null, cost: 720, stock: 41, reorderAt: 10, vat: "16%", status: "Active", listed: true, featured: true, img: IMG("9106164"), emoji: "🍯", sold30: 168, rating: 4.9, reviews: 97, supplier: "Kitui Honey Group", eTims: "0409.00.00", updated: "Today 08:40", tags: ["Organic", "Bestseller"] },
  { id: "p3", name: "Cold-Pressed Coconut Oil 250ml", sku: "PRD-003", category: "Beauty & Wellness", price: 950, compareAt: 1200, cost: 520, stock: 88, reorderAt: 20, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("725998"), emoji: "🥥", sold30: 121, rating: 4.7, reviews: 84, supplier: "Coast Naturals Ltd", eTims: "1513.19.00", updated: "Yesterday", tags: ["Wellness"] },
  { id: "p4", name: "Handwoven Kiondo Basket", sku: "PRD-004", category: "Crafts & Art", price: 2450, compareAt: 2900, cost: 1180, stock: 27, reorderAt: 8, vat: "16%", status: "Active", listed: true, featured: true, img: IMG("31653080"), emoji: "🧺", sold30: 142, rating: 4.9, reviews: 210, supplier: "Kitui Weavers Sacco", eTims: "4602.19.00", updated: "Yesterday", tags: ["Handmade", "Featured"] },
  { id: "p5", name: "Maasai Beaded Bracelet Set", sku: "PRD-005", category: "Crafts & Art", price: 1150, compareAt: null, cost: 430, stock: 120, reorderAt: 25, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("32405949"), emoji: "📿", sold30: 188, rating: 4.8, reviews: 156, supplier: "Maasai Women's Collective", eTims: "7117.19.00", updated: "2d ago", tags: ["Handmade"] },
  { id: "p6", name: "Beaded Statement Necklace", sku: "PRD-006", category: "Crafts & Art", price: 1800, compareAt: 2100, cost: 750, stock: 34, reorderAt: 10, vat: "16%", status: "Draft", listed: false, featured: false, img: IMG("32568146"), emoji: "💎", sold30: 0, rating: 0, reviews: 0, supplier: "Maasai Women's Collective", eTims: "7117.19.00", updated: "3d ago", tags: ["New"] },
  { id: "p7", name: "Kikoy Beach Wrap", sku: "PRD-007", category: "Fashion & Apparel", price: 1600, compareAt: 1900, cost: 640, stock: 55, reorderAt: 12, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("33337878"), emoji: "👗", sold30: 96, rating: 4.6, reviews: 61, supplier: "Mombasa Textiles", eTims: "6203.19.00", updated: "4d ago", tags: ["Beach season"] },
  { id: "p8", name: "Macadamia Gift Pack 300g", sku: "PRD-008", category: "Food & Beverage", price: 2200, compareAt: 2500, cost: 1400, stock: 19, reorderAt: 8, vat: "16%", status: "Active", listed: true, featured: true, img: IMG("4834307"), emoji: "🥜", sold30: 87, rating: 4.8, reviews: 74, supplier: "Embu Nuts Ltd", eTims: "0802.60.00", updated: "5d ago", tags: ["Gift", "Featured"] },
  { id: "p9", name: "Batik Cushion Cover", sku: "PRD-009", category: "Home & Living", price: 1400, compareAt: null, cost: 520, stock: 46, reorderAt: 10, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("20164063"), emoji: "🛋️", sold30: 64, rating: 4.5, reviews: 38, supplier: "Nairobi Print Studio", eTims: "6304.19.00", updated: "6d ago", tags: ["Home"] },
  { id: "p10", name: "Ankole Cow-Horn Mug", sku: "PRD-010", category: "Home & Living", price: 2800, compareAt: 3200, cost: 1450, stock: 6, reorderAt: 10, vat: "16%", status: "Active", listed: true, featured: true, img: IMG("32405948"), emoji: "🏆", sold30: 52, rating: 4.9, reviews: 67, supplier: "Ankole Crafts Co-op", eTims: "9601.90.00", updated: "6d ago", tags: ["Low stock", "Featured"] },
  { id: "p11", name: "Mt. Kenya Ceramic Mug", sku: "PRD-011", category: "Home & Living", price: 1100, compareAt: null, cost: 480, stock: 0, reorderAt: 10, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("7796223"), emoji: "🍵", sold30: 44, rating: 4.4, reviews: 29, supplier: "Nyeri Pottery Works", eTims: "6912.00.00", updated: "1w ago", tags: ["Out of stock"], onOrder: 40 },
  { id: "p12", name: "Spiced Chai Blend 250g", sku: "PRD-012", category: "Food & Beverage", price: 780, compareAt: null, cost: 320, stock: 7, reorderAt: 12, vat: "16%", status: "Active", listed: true, featured: false, img: IMG("18751139"), emoji: "🫖", sold30: 109, rating: 4.7, reviews: 88, supplier: "Kericho Tea Estate", eTims: "0902.30.00", updated: "1w ago", tags: ["Low stock"] },
  { id: "p13", name: "Shea Butter Body Balm", sku: "PRD-013", category: "Beauty & Wellness", price: 1350, compareAt: 1500, cost: 610, stock: 60, reorderAt: 15, vat: "16%", status: "Draft", listed: false, featured: false, img: IMG("7795662"), emoji: "🧴", sold30: 0, rating: 0, reviews: 0, supplier: "Nairobi Naturals", eTims: "3304.99.00", updated: "2w ago", tags: ["New"] },
  { id: "p14", name: "Sisal Serving Tray", sku: "PRD-014", category: "Home & Living", price: 2150, compareAt: null, cost: 900, stock: 15, reorderAt: 5, vat: "16%", status: "Archived", listed: false, featured: false, img: IMG("34667136"), emoji: "🍽️", sold30: 0, rating: 4.3, reviews: 17, supplier: "Kitui Weavers Sacco", eTims: "4602.19.00", updated: "3w ago", tags: [] },
];

/* ================= Orders ================= */
const ev = (time: string, title: string, note?: string): OrderEvent => ({ time, title, note });

export const ORDERS: Order[] = [
  { id: "ORD-1102", customer: "Grace Wanjiru", email: "grace.w@gmail.com", phone: "0722 445 118", channel: "Online Store", items: [
    { name: "Handwoven Kiondo Basket", qty: 1, price: 2450, emoji: "🧺", sku: "PRD-004" },
    { name: "Maasai Beaded Bracelet Set", qty: 2, price: 1150, emoji: "📿", sku: "PRD-005" }],
    total: 4750, payment: "M-Pesa", status: "New", date: "Today 10:24", location: "Nairobi, Lavington", deliveryFee: 300,
    events: [ev("Today 10:24", "Order placed", "Via online store checkout"), ev("Today 10:24", "Payment received", "M-Pesa Express · KES 5,050"), ev("—", "Packed"), ev("—", "Shipped"), ev("—", "Delivered")] },
  { id: "ORD-1101", customer: "Brian Otieno", email: "brian.otieno@gmail.com", phone: "0733 812 990", channel: "Instagram", items: [
    { name: "Kitui Wild Honey 500ml", qty: 1, price: 1250, emoji: "🍯", sku: "PRD-002" },
    { name: "Spiced Chai Blend 250g", qty: 1, price: 780, emoji: "🫖", sku: "PRD-012" }],
    total: 2030, payment: "Card", status: "New", date: "Today 09:41", location: "Kisumu", deliveryFee: 450,
    events: [ev("Today 09:41", "Order placed", "Via Instagram DM checkout"), ev("Today 09:41", "Payment received", "Card (DPO) · KES 2,480"), ev("—", "Packed"), ev("—", "Shipped"), ev("—", "Delivered")] },
  { id: "ORD-1100", customer: "Amina Hassan", email: "amina.h@outlook.com", phone: "0710 556 302", channel: "Online Store", items: [
    { name: "Safari Blend Coffee Beans 500g", qty: 2, price: 1850, emoji: "☕", sku: "PRD-001" }],
    total: 3700, payment: "M-Pesa", status: "Processing", date: "Yesterday 18:02", location: "Mombasa", deliveryFee: 450,
    events: [ev("Yesterday 18:02", "Order placed", "Via online store checkout"), ev("Yesterday 18:02", "Payment received", "M-Pesa Express · KES 4,150"), ev("Yesterday 18:40", "Packed", "By Mwangi K. — Dispatch bin A"), ev("—", "Shipped"), ev("—", "Delivered")] },
  { id: "ORD-1099", customer: "Peter Njoroge", email: "pnjoroge@yahoo.com", phone: "0721 220 774", channel: "WhatsApp", items: [
    { name: "Macadamia Gift Pack 300g", qty: 1, price: 2200, emoji: "🥜", sku: "PRD-008" }],
    total: 2200, payment: "Cash on Delivery", status: "Processing", date: "Yesterday 18:02", location: "Nairobi, Kilimani", deliveryFee: 300,
    events: [ev("Yesterday 18:02", "Order placed", "Via WhatsApp catalogue"), ev("—", "Payment due on delivery", "KES 2,500 cash"), ev("—", "Packed"), ev("—", "Shipped"), ev("—", "Delivered")] },
  { id: "ORD-1098", customer: "Lucy Muthoni", email: "lucy.m@gmail.com", phone: "0798 441 226", channel: "Online Store", items: [
    { name: "Cold-Pressed Coconut Oil 250ml", qty: 1, price: 950, emoji: "🥥", sku: "PRD-003" },
    { name: "Shea Butter Body Balm", qty: 1, price: 1350, emoji: "🧴", sku: "PRD-013" }],
    total: 2300, payment: "Card", status: "Shipped", date: "Yesterday 14:37", location: "Nyeri", deliveryFee: 450,
    events: [ev("Yesterday 14:37", "Order placed", "Via online store checkout"), ev("Yesterday 14:37", "Payment received", "Card (DPO) · KES 2,750"), ev("Yesterday 15:20", "Packed", "By Achieng O."), ev("Yesterday 16:05", "Shipped", "Sendy — tracking SK-88412"), ev("—", "Delivered")] },
  { id: "ORD-1097", customer: "David Kimani", email: "dkimani@gmail.com", phone: "0728 663 441", channel: "Online Store", items: [
    { name: "Handwoven Kiondo Basket", qty: 1, price: 2450, emoji: "🧺", sku: "PRD-004" }],
    total: 2450, payment: "M-Pesa", status: "Shipped", date: "2 days ago", location: "Nakuru", deliveryFee: 450,
    events: [ev("Mon 11:20", "Order placed", "Via online store checkout"), ev("Mon 11:20", "Payment received", "M-Pesa Express · KES 2,900"), ev("Mon 12:00", "Packed", "By Mwangi K."), ev("Mon 13:15", "Shipped", "Sendy — tracking SK-88371"), ev("—", "Delivered")] },
  { id: "ORD-1096", customer: "Fatuma Abdalla", email: "fatuma.a@gmail.com", phone: "0739 204 885", channel: "Instagram", items: [
    { name: "Maasai Beaded Bracelet Set", qty: 3, price: 1150, emoji: "📿", sku: "PRD-005" }],
    total: 3450, payment: "M-Pesa", status: "Delivered", date: "2 days ago", location: "Malindi", deliveryFee: 450,
    events: [ev("Mon 09:10", "Order placed", "Via Instagram DM checkout"), ev("Mon 09:10", "Payment received", "M-Pesa Express · KES 3,900"), ev("Mon 09:40", "Packed", "By Achieng O."), ev("Mon 10:30", "Shipped", "Courier — CC-2210"), ev("Tue 11:05", "Delivered", "Signed by recipient")] },
  { id: "ORD-1095", customer: "James Mutua", email: "jmutua@gmail.com", phone: "0701 884 532", channel: "Online Store", items: [
    { name: "Ankole Cow-Horn Mug", qty: 1, price: 2800, emoji: "🏆", sku: "PRD-010" }],
    total: 2800, payment: "Card", status: "Delivered", date: "3 days ago", location: "Nairobi, Westlands", deliveryFee: 300,
    events: [ev("Sun 15:02", "Order placed", "Via online store checkout"), ev("Sun 15:02", "Payment received", "Card (DPO) · KES 3,100"), ev("Sun 15:30", "Packed", "By Mwangi K."), ev("Sun 16:10", "Shipped", "Sendy — SK-88204"), ev("Mon 09:22", "Delivered", "Left at reception")] },
  { id: "ORD-1094", customer: "Wanjiru Karanja", email: "wkaranja@gmail.com", phone: "0725 119 084", channel: "WhatsApp", items: [
    { name: "Safari Blend Coffee Beans 500g", qty: 1, price: 1850, emoji: "☕", sku: "PRD-001" },
    { name: "Kikoy Beach Wrap", qty: 1, price: 1600, emoji: "👗", sku: "PRD-007" }],
    total: 3450, payment: "M-Pesa", status: "Delivered", date: "4 days ago", location: "Eldoret", deliveryFee: 450,
    events: [ev("Sat 10:44", "Order placed", "Via WhatsApp catalogue"), ev("Sat 10:45", "Payment received", "M-Pesa Express · KES 3,900"), ev("Sat 11:20", "Packed", "By Achieng O."), ev("Sat 12:00", "Shipped", "Courier — CC-2198"), ev("Sun 14:30", "Delivered", "Signed by recipient")] },
  { id: "ORD-1093", customer: "Samuel Okello", email: "sokello@yahoo.com", phone: "0742 335 771", channel: "Online Store", items: [
    { name: "Batik Cushion Cover", qty: 2, price: 1400, emoji: "🛋️", sku: "PRD-009" }],
    total: 2800, payment: "PesaLink", status: "Cancelled", date: "5 days ago", location: "Kisii", deliveryFee: 450,
    events: [ev("Fri 08:12", "Order placed", "Via online store checkout"), ev("Fri 08:13", "Payment received", "PesaLink · KES 3,250"), ev("Fri 09:00", "Cancelled", "Customer changed mind — payment reversed")] },
  { id: "ORD-1092", customer: "Naomi Chemtai", email: "nchemtai@gmail.com", phone: "0712 990 213", channel: "Online Store", items: [
    { name: "Mt. Kenya Ceramic Mug", qty: 1, price: 1100, emoji: "🍵", sku: "PRD-011" }],
    total: 1100, payment: "M-Pesa", status: "Refunded", date: "6 days ago", location: "Kitale", deliveryFee: 450,
    events: [ev("Thu 19:20", "Order placed", "Via online store checkout"), ev("Thu 19:20", "Payment received", "M-Pesa Express · KES 1,550"), ev("Thu 20:02", "Refunded", "Item arrived cracked — full refund via M-Pesa reversal")] },
  { id: "ORD-1091", customer: "Kevin Barasa", email: "kbarasa@gmail.com", phone: "0790 118 447", channel: "Online Store", items: [
    { name: "Safari Blend Coffee Beans 500g", qty: 1, price: 1850, emoji: "☕", sku: "PRD-001" },
    { name: "Spiced Chai Blend 250g", qty: 1, price: 780, emoji: "🫖", sku: "PRD-012" },
    { name: "Kitui Wild Honey 500ml", qty: 1, price: 1250, emoji: "🍯", sku: "PRD-002" }],
    total: 3880, payment: "M-Pesa", status: "Delivered", date: "6 days ago", location: "Kakamega", deliveryFee: 0,
    events: [ev("Thu 11:30", "Order placed", "Via online store checkout"), ev("Thu 11:30", "Payment received", "M-Pesa Express · KES 3,880"), ev("Thu 12:10", "Packed", "By Mwangi K."), ev("Thu 13:00", "Shipped", "Courier — CC-2180"), ev("Fri 10:15", "Delivered", "Signed by recipient")] },
];

/* ================= Store config ================= */
export const DEFAULT_CONFIG: StoreConfig = {
  name: "Soko Sanaa by TS Retail",
  tagline: "Handcrafted Kenya — delivered to your door",
  logoEmoji: "🛍️",
  domain: "tsretail.paymo.store",
  customDomain: null,
  live: true,
  theme: "savanna",
  sections: { hero: true, announcement: true, featured: true, categories: true, testimonials: true, newsletter: true, blog: false },
  payments: { mpesa: true, card: true, pesalink: true, cod: true },
  paybill: "247247",
  till: "904412",
  zones: [
    { name: "Nairobi — same day", price: 300, eta: "Same day" },
    { name: "Rest of Kenya", price: 450, eta: "1–3 days" },
  ],
  freeOver: 5000,
  vatRegistered: true,
  vatRate: "16%",
  announcement: "🚚 Free delivery on orders over KES 5,000 — this week only",
  returnsPolicy: true,
  sellWhenOOS: false,
  guestCheckout: true,
  abandonedCart: true,
};

export const THEMES: ThemeDef[] = [
  { id: "savanna", name: "Savanna", emoji: "🌅", desc: "Warm, artisanal & earthy", vars: { bg: "#F7F1E5", ink: "#3E2F1C", accent: "#C2571B", card: "#FFFFFF", soft: "#EFE3CC" } },
  { id: "baobab", name: "Baobab Green", emoji: "🌿", desc: "Fresh, clean & minimal", vars: { bg: "#F2F7F3", ink: "#17301F", accent: "#12B76A", card: "#FFFFFF", soft: "#DCF0E4" } },
  { id: "sunset", name: "Sunset Market", emoji: "🌇", desc: "Bold, loud & festival", vars: { bg: "#16121F", ink: "#F4ECFF", accent: "#FF7A3D", card: "#221C30", soft: "#2A2338" } },
];

/* ================= Analytics ================= */
export const REVENUE_30D = [9.2, 11.4, 10.8, 13.6, 12.1, 14.9, 16.2, 15.4, 17.8, 16.9, 18.4, 19.6, 18.1, 20.3, 19.8, 22.4, 21.1, 23.6, 22.8, 24.9, 23.4, 25.6, 24.2, 26.8, 25.9, 27.4, 26.3, 28.1, 27.2, 29.4];
export const ORDERS_30D = [3, 5, 4, 6, 5, 7, 8, 6, 9, 8, 7, 10, 9, 8, 11, 9, 10, 12, 11, 9, 10, 8, 11, 12, 10, 9, 11, 10, 12, 14];
export const TRAFFIC = [
  { label: "Direct link", v: 38, color: "#12b76a" },
  { label: "Instagram", v: 27, color: "#7a5af8" },
  { label: "WhatsApp", v: 14, color: "#25d366" },
  { label: "Google search", v: 12, color: "#2e90fa" },
  { label: "Other", v: 9, color: "#98a2b3" },
];
export const FUNNEL = [
  { label: "Store visits", v: 6310 },
  { label: "Product views", v: 2840 },
  { label: "Added to cart", v: 512 },
  { label: "Checkout started", v: 312 },
  { label: "Orders paid", v: 214 },
];

export const DISCOUNTS: Discount[] = [
  { code: "JULY15", label: "15% off orders above KES 5,000", type: "percent", value: 15, status: "Active", uses: 34, cap: 100 },
  { code: "FREEDELIVERY", label: "Free delivery within Nairobi", type: "freeship", value: 300, status: "Active", uses: 61, cap: 200 },
  { code: "HOLIDAY10", label: "10% off all Crafts & Art", type: "percent", value: 10, status: "Scheduled", uses: 0, cap: 150 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-exclamation-triangle", text: "Ankole Cow-Horn Mug is below reorder level (6 left)", time: "12 min ago", unread: true, action: "Reorder" },
  { id: 2, icon: "bi-bag-check", text: "New order ORD-1102 from Grace Wanjiru — KES 5,050", time: "48 min ago", unread: true, action: "View" },
  { id: 3, icon: "bi-file-earmark-spreadsheet", text: "eTIMS product validation complete — 14 SKUs synced", time: "3 hrs ago", unread: true },
  { id: 4, icon: "bi-star", text: "New 5★ review on Handwoven Kiondo Basket", time: "Yesterday", unread: false },
  { id: 5, icon: "bi-cash-stack", text: "Store payout of KES 48,250 settled to your Till", time: "2 days ago", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 10:24", icon: "bi-bag-check", text: "Order ORD-1102 placed via online store", by: "System" },
  { time: "Today 09:12", icon: "bi-pencil", text: "Price updated on Safari Blend Coffee Beans (KES 2,100 → 1,850)", by: "Wanjiku M." },
  { time: "Today 08:40", icon: "bi-box-seam", text: "Stock adjusted on Kitui Wild Honey +12 (received PO-1039)", by: "Mwangi K." },
  { time: "Yesterday", icon: "bi-palette", text: "Theme switched to Savanna on storefront", by: "Wanjiku M." },
  { time: "Yesterday", icon: "bi-file-earmark-arrow-up", text: "CSV import: 24 products mapped and imported", by: "Wanjiku M." },
  { time: "2 days ago", icon: "bi-shield-check", text: "SSL certificate renewed for tsretail.paymo.store", by: "System" },
  { time: "2 days ago", icon: "bi-ticket-perforated", text: "Discount JULY15 created (15% off above KES 5,000)", by: "Wanjiku M." },
  { time: "3 days ago", icon: "bi-arrow-counterclockwise", text: "Refund issued on ORD-1092 (KES 1,550, M-Pesa reversal)", by: "Mwangi K." },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];
