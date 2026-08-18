/* ==================================================================
   PayMo Business — PAGE 12: MARKETING & GROWTH — data layer
================================================================== */

/* ================= Types ================= */
export type CampaignStatus = "Active" | "Scheduled" | "Draft" | "Ended" | "Paused";
export type PostStatus = "Published" | "Scheduled" | "Draft";
export type ReviewStatus = "Published" | "Pending review" | "Replied";
export type Tier = "Gold" | "Silver" | "Bronze";

export interface Campaign {
  id: string; name: string; channel: string; goal: string; emoji: string;
  audience: string; audienceCount: number; sent: number; opened: number; clicks: number;
  conversions: number; revenue: number; cost: number; status: CampaignStatus; date: string;
}
export interface Segment { id: string; name: string; emoji: string; count: number; desc: string; rules: string[] }
export interface SocialPost { id: string; platform: "Instagram" | "Facebook" | "TikTok"; content: string; emoji: string; time: string; status: PostStatus; likes: number; comments: number; reach: number }
export interface InboxMsg { id: string; channel: "WhatsApp" | "Instagram" | "Facebook"; from: string; text: string; time: string; unread: boolean; tag: "Order" | "Product" | "Feedback" | "Other" }
export interface Review { id: string; customer: string; product: string; stars: number; text: string; date: string; status: ReviewStatus; platform: string }
export interface Member { name: string; phone: string; points: number; tier: Tier; joined: string; visits: number }
export interface Reward { id: string; name: string; cost: number; desc: string; icon: string }
export interface ABTest { id: string; name: string; variable: string; a: string; b: string; winner: "A" | "B" | "—"; uplift: string; status: "Running" | "Completed"; date: string }
export interface FlashProduct { id: string; name: string; emoji: string; price: number; cost: number; stock: number; sold30: number; img: string }
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));
const IMG = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=160&w=240`;

/* ================= Campaigns ================= */
export const CAMPAIGNS: Campaign[] = [
  { id: "CMP-024", name: "Mashujaa Weekend Flash Sale", channel: "WhatsApp + SMS", goal: "Drive sales", emoji: "⚡", audience: "All customers", audienceCount: 4820, sent: 4820, opened: 3912, clicks: 1240, conversions: 186, revenue: 214500, cost: 8400, status: "Active", date: "Started 2d ago" },
  { id: "CMP-023", name: "July Newsletter — New Arrivals", channel: "Email", goal: "Announce products", emoji: "📧", audience: "Email subscribers", audienceCount: 1240, sent: 1240, opened: 410, clicks: 96, conversions: 14, revenue: 22500, cost: 120, status: "Ended", date: "Ended 1w ago" },
  { id: "CMP-022", name: "Kiondo Launch on Instagram", channel: "Instagram", goal: "Grow followers", emoji: "📸", audience: "Instagram followers", audienceCount: 3120, sent: 3120, opened: 2480, clicks: 640, conversions: 88, revenue: 96400, cost: 2500, status: "Active", date: "Started 1w ago" },
  { id: "CMP-021", name: "Customer Win-Back (60d dormant)", channel: "WhatsApp", goal: "Win back customers", emoji: "🔁", audience: "At-risk customers", audienceCount: 890, sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0, status: "Scheduled", date: "Sends Fri 17:00" },
  { id: "CMP-020", name: "Double Points Week", channel: "SMS + In-app", goal: "Loyalty", emoji: "⭐", audience: "Loyalty members", audienceCount: 1284, sent: 1284, opened: 1108, clicks: 520, conversions: 240, revenue: 182000, cost: 980, status: "Ended", date: "Ended 2w ago" },
  { id: "CMP-019", name: "Behind-the-Scenes TikTok Series", channel: "TikTok", goal: "Grow followers", emoji: "🎬", audience: "TikTok viewers", audienceCount: 0, sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0, status: "Draft", date: "Draft — needs review" },
  { id: "CMP-018", name: "Referral 2.0 Launch", channel: "Multi-channel", goal: "Referrals", emoji: "🤝", audience: "Active customers", audienceCount: 684, sent: 684, opened: 590, clicks: 310, conversions: 96, revenue: 118000, cost: 3400, status: "Active", date: "Started 1mo ago" },
];

/* ================= Segments ================= */
export const SEGMENTS: Segment[] = [
  { id: "s1", name: "VIP customers", emoji: "💎", count: 47, desc: "Top 10% by lifetime spend", rules: ["Spent > KES 50,000 lifetime", "≥ 5 orders", "Last purchase ≤ 45 days"] },
  { id: "s2", name: "New customers (30d)", emoji: "🌱", count: 132, desc: "First purchase in the last 30 days", rules: ["First order within 30 days", "Not in any other nurture campaign"] },
  { id: "s3", name: "At-risk (60d dormant)", emoji: "⏳", count: 89, desc: "Purchased before, quiet for 60+ days", rules: ["≥ 1 order ever", "No order in 60 days", "Not opted out"] },
  { id: "s4", name: "Instagram followers", emoji: "📸", count: 310, desc: "Purchased after clicking IG", rules: ["Attributed to Instagram", "Within 90 days"] },
  { id: "s5", name: "Wholesale accounts", emoji: "🏢", count: 12, desc: "B2B buyers with credit terms", rules: ["Order value > KES 20,000", "Has credit terms", "Business registered"] },
  { id: "s6", name: "WhatsApp opted-in", emoji: "💬", count: 1284, desc: "Consented to WhatsApp marketing", rules: ["WhatsApp consent = yes", "Valid phone number"] },
];

/* ================= Loyalty ================= */
export const LOYALTY = {
  pointsPerKes: 10,
  doublePointsDay: "Friday",
  pointsIssued: 186400,
  pointsRedeemed: 98400,
  enrolled: 1284,
  topEarners: [
    { name: "Grace Wanjiru", phone: "0722 445 118", points: 12480, tier: "Gold" as Tier, joined: "Mar 24", visits: 38 },
    { name: "Brian Otieno", phone: "0733 812 990", points: 8970, tier: "Gold" as Tier, joined: "May 24", visits: 29 },
    { name: "Amina Hassan", phone: "0710 556 302", points: 6540, tier: "Silver" as Tier, joined: "Aug 24", visits: 21 },
    { name: "David Kimani", phone: "0728 663 441", points: 4210, tier: "Silver" as Tier, joined: "Sep 24", visits: 17 },
    { name: "Lucy Muthoni", phone: "0798 441 226", points: 2150, tier: "Bronze" as Tier, joined: "Nov 24", visits: 9 },
  ],
  rewards: [
    { id: "r1", name: "KES 100 off next order", cost: 500, desc: "Auto-applied at till or checkout", icon: "bi-tag" },
    { id: "r2", name: "Free same-day delivery", cost: 400, desc: "Nairobi same-day · value KES 300", icon: "bi-truck" },
    { id: "r3", name: "KES 500 voucher", cost: 2000, desc: "Redeemable store-wide, 90 days", icon: "bi-gift" },
    { id: "r4", name: "VIP early access", cost: 3000, desc: "24h early access to every drop", icon: "bi-stars" },
  ] as Reward[],
};

/* ================= Social posts ================= */
export const POSTS: SocialPost[] = [
  { id: "PST-31", platform: "Instagram", content: "New kiondo colours just landed 🧺✨ Handwoven in Kitui. Shop the drop via link in bio.", emoji: "🧺", time: "2h ago", status: "Published", likes: 342, comments: 28, reach: 4120 },
  { id: "PST-32", platform: "TikTok", content: "POV: packing your order at 6am ☕ #smallbusiness #kenya #madeinkenya", emoji: "📦", time: "Yesterday", status: "Published", likes: 1280, comments: 96, reach: 18400 },
  { id: "PST-33", platform: "Instagram", content: "Flash sale this weekend — 20% off kiondo baskets. Code: MASHUJAA20", emoji: "⚡", time: "Tomorrow 09:00", status: "Scheduled", likes: 0, comments: 0, reach: 0 },
  { id: "PST-34", platform: "Facebook", content: "Meet the weavers: Kitui Weavers Sacco. 12 families, one craft. 🌿", emoji: "🤝", time: "3d ago", status: "Published", likes: 184, comments: 41, reach: 6200 },
  { id: "PST-35", platform: "Instagram", content: "Loyalty Friday — double points all day tomorrow!", emoji: "⭐", time: "Draft", status: "Draft", likes: 0, comments: 0, reach: 0 },
];

/* ================= Social inbox ================= */
export const INBOX: InboxMsg[] = [
  { id: "m1", channel: "WhatsApp", from: "Wanjiru K.", text: "Is the kiondo basket available in brown? I want it for a gift on Saturday 🙏", time: "12 min ago", unread: true, tag: "Product" },
  { id: "m2", channel: "Instagram", from: "@kevin.shares", text: "Hi! How long does delivery to Kakamega take?", time: "48 min ago", unread: true, tag: "Order" },
  { id: "m3", channel: "WhatsApp", from: "Naomi C.", text: "Received my order today — the mug is beautiful! Asante sana 😍", time: "3 hrs ago", unread: true, tag: "Feedback" },
  { id: "m4", channel: "Instagram", from: "@naomis_shop", text: "Do you offer wholesale for gift shops? We'd love to stock your pieces.", time: "Yesterday", unread: false, tag: "Other" },
  { id: "m5", channel: "Facebook", from: "Samuel Okello", text: "My order ORD-1093 was cancelled — when is the refund coming?", time: "2 days ago", unread: false, tag: "Order" },
];

/* ================= Reviews ================= */
export const REVIEWS: Review[] = [
  { id: "RV-118", customer: "Grace Wanjiru", product: "Handwoven Kiondo Basket", stars: 5, text: "The kiondo is even more beautiful in person. Delivery in two days — ni nzuri sana!", date: "Today", status: "Published", platform: "Store" },
  { id: "RV-117", customer: "Brian Otieno", product: "Kitui Wild Honey 500ml", stars: 5, text: "Real deal honey, not the supermarket mix. Will order again.", date: "Yesterday", status: "Published", platform: "Store" },
  { id: "RV-116", customer: "Amina Hassan", product: "Safari Blend Coffee 500g", stars: 4, text: "Great beans, roast could be a touch darker for my taste.", date: "Yesterday", status: "Replied", platform: "Instagram" },
  { id: "RV-115", customer: "Peter Njoroge", product: "Macadamia Gift Pack", stars: 5, text: "Bought as a gift — the packaging made it. They asked where to order!", date: "2d ago", status: "Published", platform: "Store" },
  { id: "RV-114", customer: "Fatuma Abdalla", product: "Beaded Bracelet Set", stars: 3, text: "Nice beads but one bracelet arrived loose. Checking if I can exchange.", date: "2d ago", status: "Pending review", platform: "Store" },
  { id: "RV-113", customer: "Kevin Barasa", product: "Spiced Chai Blend", stars: 5, text: "This chai takes me back home. Delivered to Kakamega in a day!", date: "3d ago", status: "Published", platform: "Store" },
];

/* ================= NPS ================= */
export const NPS = { score: 8.2, responses: 214, promoters: 62, passives: 28, detractors: 10, trend: [7.4, 7.6, 7.5, 7.8, 8.0, 7.9, 8.1, 8.2] };

/* ================= Referral ================= */
export const REFERRAL = { participants: 96, referrals: 148, converted: 61, reward: "100 points each", link: "paymo.app/r/tsretail", cta: "Share KES 200 off their first order" };

/* ================= Budget ================= */
export const BUDGET = { monthly: 35000, spent: 24300, autoOptimize: true, sms: 0.8, whatsapp: 0.55, email: 0.02, boost: 5000 };

/* ================= A/B tests ================= */
export const ABTESTS: ABTest[] = [
  { id: "AB-09", name: "Flash sale subject line", variable: "WhatsApp opener", a: "MASHUJAA20 — 20% off!", b: "We made you a special offer 👀", winner: "B", uplift: "+38% open rate", status: "Completed", date: "2w ago" },
  { id: "AB-10", name: "Win-back incentive", variable: "Offer", a: "10% off code", b: "Free delivery + 5% off", winner: "—", uplift: "Running — 2 days left", status: "Running", date: "Started 5d ago" },
];

/* ================= Flash products ================= */
export const FLASH_PRODUCTS: FlashProduct[] = [
  { id: "f1", name: "Handwoven Kiondo Basket", emoji: "🧺", price: 2450, cost: 1180, stock: 27, sold30: 142, img: IMG("31653080") },
  { id: "f2", name: "Safari Blend Coffee 500g", emoji: "☕", price: 1850, cost: 980, stock: 64, sold30: 214, img: IMG("37987695") },
  { id: "f3", name: "Kitui Wild Honey 500ml", emoji: "🍯", price: 1250, cost: 720, stock: 41, sold30: 168, img: IMG("9106164") },
  { id: "f4", name: "Maasai Beaded Bracelet Set", emoji: "📿", price: 1150, cost: 430, stock: 120, sold30: 188, img: IMG("32405949") },
  { id: "f5", name: "Cold-Pressed Coconut Oil", emoji: "🥥", price: 950, cost: 520, stock: 88, sold30: 121, img: IMG("725998") },
];

/* ================= Growth ideas ================= */
export const IDEAS = [
  { id: "i1", icon: "bi-whatsapp", tone: "green", title: "Broadcast to At-Risk segment", detail: "89 customers haven't bought in 60 days. Win-back offer 'FREEDELIVERY + 5%' historically re-activates 14%. Est. lift: KES 68,400.", act: "Create campaign" },
  { id: "i2", icon: "bi-stars", tone: "violet", title: "Turn the loose-bracelet review into a win", detail: "RV-114 has a product issue. Public 1-hour response + exchange boosts trust. Respond before 5pm today.", act: "Reply now" },
  { id: "i3", icon: "bi-clock-history", tone: "blue", title: "Your best send time is Fri 17:00", detail: "CMP-024 opened 81% at 17:00. The scheduled win-back (Fri 17:00) is perfectly timed — don't move it.", act: "View calendar" },
  { id: "i4", icon: "bi-graph-up-arrow", tone: "amber", title: "Boost the TikTok that's going viral", detail: "PST-32 has 18.4K organic reach — 6× your average. KES 2,000 boost could reach ~40K more.", act: "Boost post" },
];

/* ================= Attribution / charts ================= */
export const ATTRIBUTION = [
  { label: "Direct & repeat", v: 38, color: "#12b76a" },
  { label: "Instagram", v: 27, color: "#7a5af8" },
  { label: "WhatsApp campaigns", v: 14, color: "#25d366" },
  { label: "Google search", v: 12, color: "#2e90fa" },
  { label: "TikTok", v: 9, color: "#101828" },
];
export const CHANNEL_ROAS = [
  { channel: "WhatsApp", roas: 21.4, spend: 12400, revenue: 265400 },
  { channel: "Instagram", roas: 14.2, spend: 5800, revenue: 82360 },
  { channel: "SMS", roas: 8.9, spend: 2100, revenue: 18690 },
  { channel: "Email", roas: 5.1, spend: 620, revenue: 3162 },
  { channel: "TikTok", roas: 3.4, spend: 3380, revenue: 11492 },
];
export const SPEND_REV = { months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"], spend: [12, 14, 11, 16, 18, 15, 19], revenue: [80, 95, 88, 120, 140, 132, 168] };
export const NEW_CUSTOMERS = [12, 15, 18, 16, 21, 24, 22, 28, 31, 35, 38, 44];
export const FUNNEL = [
  { label: "Reached", v: 8430 },
  { label: "Opened / viewed", v: 5240 },
  { label: "Clicked", v: 1610 },
  { label: "Added to cart", v: 512 },
  { label: "Purchased", v: 328 },
];

/* ================= Calendar ================= */
export const CALENDAR_ITEMS: { day: number; items: { icon: string; label: string; tone: string }[] }[] = [
  { day: 15, items: [{ icon: "bi-whatsapp", label: "Win-back broadcast 17:00", tone: "green" }] },
  { day: 16, items: [{ icon: "bi-instagram", label: "Flash sale announcement", tone: "violet" }, { icon: "bi-stars", label: "Loyalty double points", tone: "amber" }] },
  { day: 17, items: [{ icon: "bi-tiktok", label: "BTS video drops", tone: "slate" }] },
  { day: 20, items: [{ icon: "bi-envelope", label: "January newsletter", tone: "blue" }] },
  { day: 25, items: [{ icon: "bi-graph-up", label: "Monthly ROI review", tone: "amber" }] },
];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-lightning-charge", text: "CMP-024 flash sale converted 186 orders so far — ROI 25.5×", time: "30 min ago", unread: true, action: "View" },
  { id: 2, icon: "bi-chat-left-dots", text: "3 unread messages in your social inbox (oldest: 12 min)", time: "48 min ago", unread: true, action: "Reply" },
  { id: 3, icon: "bi-star", text: "3-star review RV-114 needs your reply — loose bracelet", time: "2 hrs ago", unread: true, action: "Reply" },
  { id: 4, icon: "bi-calendar3", text: "Win-back campaign CMP-021 sends Friday 17:00", time: "5 hrs ago", unread: true, action: "Review" },
  { id: 5, icon: "bi-graph-up-arrow", text: "Referral 2.0: 61 new customers acquired — CAC down 23%", time: "Yesterday", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 12:10", icon: "bi-send", text: "CMP-024 SMS wave delivered to 2,140 contacts", by: "System" },
  { time: "Today 09:00", icon: "bi-instagram", text: "Post PST-33 scheduled (Tomorrow 09:00) — flash sale teaser", by: "You" },
  { time: "Today 08:30", icon: "bi-cash-stack", text: "Campaign revenue +KES 31,400 overnight (CMP-024)", by: "System" },
  { time: "Yesterday", icon: "bi-reply", text: "Replied to review RV-116 (Instagram, 4★)", by: "You" },
  { time: "Yesterday", icon: "bi-stars", text: "Loyalty: 48 new members enrolled this week (+3.9%)", by: "System" },
  { time: "2d ago", icon: "bi-sliders", text: "Budget auto-optimization moved KES 2,000 from email → TikTok boost", by: "System" },
  { time: "2d ago", icon: "bi-people", text: "Segment 'At-risk (60d dormant)' re-computed: 89 members", by: "System" },
  { time: "3d ago", icon: "bi-award", text: "A/B test AB-09 completed — variant B won (+38% opens)", by: "System" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];

export const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", icon: "bi-whatsapp", tone: "green", reach: 1284, price: 0.55, desc: "97% open rate — your best channel" },
  { id: "sms", name: "SMS", icon: "bi-chat-left-text", tone: "blue", reach: 2140, price: 0.8, desc: "Reaches feature phones too" },
  { id: "email", name: "Email", icon: "bi-envelope", tone: "slate", reach: 1240, price: 0.02, desc: "Cheapest per contact" },
  { id: "instagram", name: "Instagram", icon: "bi-instagram", tone: "violet", reach: 3120, price: 0, desc: "Shoppable posts & stories" },
  { id: "tiktok", name: "TikTok", icon: "bi-tiktok", tone: "slate", reach: 1840, price: 0, desc: "Organic + boost budget" },
];

export const TEMPLATES = [
  { id: "t1", icon: "⚡", name: "Flash sale announcement", channel: "WhatsApp + SMS", text: "⚡ {first_name}, MASHUJAA20 = 20% off everything this weekend only! Shop now: paymo.app/s/tsretail" },
  { id: "t2", icon: "🌱", name: "New arrivals", channel: "WhatsApp", text: "🌱 {first_name}, fresh stock just landed — new kiondo colours and more. See them first: paymo.app/s/new" },
  { id: "t3", icon: "🔁", name: "Win-back offer", channel: "WhatsApp + Email", text: "We miss you, {first_name}! 🧡 Here's FREEDELIVERY + 5% off to welcome you back. Valid 7 days." },
  { id: "t4", icon: "⭐", name: "Points balance reminder", channel: "SMS", text: "⭐ {first_name}, you have {points} points at Soko Sanaa. Redeem at the till or online: paymo.app/s/rewards" },
  { id: "t5", icon: "📦", name: "Back in stock", channel: "WhatsApp", text: "📦 {first_name}, {product} is back in stock! Limited run — order before it sells out again." },
  { id: "t6", icon: "💬", name: "Feedback request", channel: "Email", text: "Hi {first_name}, how was your {product}? Rate us in 10 seconds — it shapes what we make next." },
];

export const TEAM = ["Wanjiku Maina", "Mwangi Kamau", "Achieng Otieno", "Brian Kim"];
export const BUSINESS_PHONE = "0722 445 118";
