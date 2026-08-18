import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, ABTESTS, BUDGET, CALENDAR_ITEMS, CAMPAIGNS, INBOX, LOYALTY, NPS, NOTIFICATIONS,
  POSTS, REFERRAL, REVIEWS, SEGMENTS,
} from "./data";
import type {
  Activity, ABTest, Campaign, InboxMsg, Member, Notification, PostStatus, Review, ReviewStatus, Segment, SocialPost,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  campaigns: Campaign[];
  segments: Segment[];
  posts: SocialPost[];
  inbox: InboxMsg[];
  reviews: Review[];
  abtests: ABTest[];
  members: Member[];
  calendarItems: typeof CALENDAR_ITEMS;
  budget: typeof BUDGET;
  notifications: Notification[];
  activity: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  modal: ModalState | null;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, title?: string) => void;
  dismissToast: (id: number) => void;
  recordActivity: (text: string, icon?: string) => void;
  /* marketing actions */
  createCampaign: (c: Omit<Campaign, "id" | "date" | "sent" | "opened" | "clicks" | "conversions" | "revenue" | "cost"> & Partial<Campaign>) => string;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  pauseCampaign: (id: string) => void;
  launchCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => Campaign | null;
  addSegment: (s: Omit<Segment, "id" | "count">) => string;
  schedulePost: (p: Omit<SocialPost, "id" | "likes" | "comments" | "reach">) => string;
  updatePostStatus: (id: string, status: PostStatus) => void;
  markInboxRead: () => void;
  replyToMessage: (id: string, text: string) => void;
  replyToReview: (id: string, text: string) => void;
  approveReview: (id: string) => void;
  setReviewStatus: (id: string, status: ReviewStatus) => void;
  redeemPoints: (memberName: string, rewardId: string) => void;
  saveLoyalty: (patch: { pointsPerKes?: number; doublePointsDay?: string }) => void;
  startABTest: (name: string, variable: string, a: string, b: string) => void;
  endABTest: (id: string, winner: "A" | "B") => void;
  launchFlashSale: (name: string, products: string[], discount: number, code: string, channel: string) => void;
  updateBudget: (patch: Partial<typeof BUDGET>) => void;
  boostPost: (id: string, amount: number) => void;
  addCalendarItem: (day: number, item: { icon: string; label: string; tone: string }) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;
let campSeq = 25;
let postSeq = 36;
let segSeq = 7;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [segments, setSegments] = useState<Segment[]>(SEGMENTS);
  const [posts, setPosts] = useState<SocialPost[]>(POSTS);
  const [inbox, setInbox] = useState<InboxMsg[]>(INBOX);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [abtests, setAbtests] = useState<ABTest[]>(ABTESTS);
  const [members, setMembers] = useState<Member[]>(LOYALTY.topEarners);
  const [calendarItems, setCalendarItems] = useState(CALENDAR_ITEMS);
  const [budget, setBudget] = useState(BUDGET);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  void NPS; void REFERRAL;

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: ToastType = "success", title?: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-4), { id, msg, type, title }]);
    window.setTimeout(() => dismissToast(id), 4600);
  }, [dismissToast]);
  const openModal = useCallback((name: string, payload: Record<string, unknown> = {}) => setModal({ name, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const recordActivity = useCallback((text: string, icon = "bi-pencil") => {
    setActivity((a) => [{ time: "Just now", icon, text, by: "You" }, ...a].slice(0, 40));
  }, []);

  /* ---------- campaigns ---------- */
  const createCampaign = useCallback((c: Omit<Campaign, "id" | "date" | "sent" | "opened" | "clicks" | "conversions" | "revenue" | "cost"> & Partial<Campaign>) => {
    const id = `CMP-${campSeq++}`;
    setCampaigns((prev) => [{
      id, name: c.name, channel: c.channel, goal: c.goal, emoji: c.emoji ?? "📣",
      audience: c.audience, audienceCount: c.audienceCount ?? 0,
      sent: c.sent ?? 0, opened: c.opened ?? 0, clicks: c.clicks ?? 0, conversions: c.conversions ?? 0,
      revenue: c.revenue ?? 0, cost: c.cost ?? 0, status: c.status ?? "Draft", date: "Just now",
    }, ...prev]);
    recordActivity(`${id} created — ${c.name} (${c.channel})`, "bi-megaphone");
    return id;
  }, [recordActivity]);

  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const pauseCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id && c.status === "Active" ? { ...c, status: "Paused" as const } : c)));
    recordActivity(`${id} paused`, "bi-pause");
    toast(`${id} paused — scheduled sends are held.`, "warning", "Campaign paused");
  }, [recordActivity, toast]);

  const launchCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Active" as const, date: "Launched just now" } : c)));
    recordActivity(`${id} launched`, "bi-rocket-takeoff");
    toast(`${id} is LIVE — first wave goes out in the next 15 minutes.`, "success", "Campaign launched");
  }, [recordActivity, toast]);

  const duplicateCampaign = useCallback((id: string): Campaign | null => {
    const src = campaigns.find((c) => c.id === id);
    if (!src) return null;
    const copy: Campaign = {
      ...src, id: `CMP-${campSeq++}`, name: src.name + " (Copy)", status: "Draft",
      sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0, date: "Draft — just duplicated",
    };
    setCampaigns((prev) => [copy, ...prev]);
    return copy;
  }, [campaigns]);

  /* ---------- segments ---------- */
  const addSegment = useCallback((s: Omit<Segment, "id" | "count">) => {
    const id = `s${segSeq++}`;
    setSegments((prev) => [{ ...s, id, count: 0 }, ...prev]);
    recordActivity(`Segment "${s.name}" created`, "bi-people");
    return id;
  }, [recordActivity]);

  /* ---------- social ---------- */
  const schedulePost = useCallback((p: Omit<SocialPost, "id" | "likes" | "comments" | "reach">) => {
    const id = `PST-${postSeq++}`;
    setPosts((prev) => [{ ...p, id, likes: 0, comments: 0, reach: 0 }, ...prev]);
    recordActivity(`Post ${id} scheduled on ${p.platform} (${p.time})`, "bi-instagram");
    return id;
  }, [recordActivity]);

  const updatePostStatus = useCallback((id: string, status: PostStatus) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const markInboxRead = useCallback(() => setInbox((m) => m.map((x) => ({ ...x, unread: false }))), []);

  const replyToMessage = useCallback((id: string, text: string) => {
    setInbox((m) => m.map((x) => (x.id === id ? { ...x, unread: false } : x)));
    recordActivity(`Replied to ${inbox.find((x) => x.id === id)?.from ?? "customer"}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`, "bi-chat-dots");
    toast("Reply sent — customer notified via their channel.", "success", "Message sent");
  }, [inbox, recordActivity, toast]);

  /* ---------- reviews ---------- */
  const replyToReview = useCallback((id: string, text: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Replied" as const } : r)));
    recordActivity(`Replied to review ${id}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`, "bi-reply");
    toast("Reply published under the review — the customer gets a ping.", "success", "Review replied");
  }, [recordActivity, toast]);

  const approveReview = useCallback((id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Published" as const } : r)));
    recordActivity(`Review ${id} approved & published`, "bi-check2-circle");
    toast(`${id} published to the storefront.`, "success", "Review approved");
  }, [recordActivity, toast]);

  const setReviewStatus = useCallback((id: string, status: ReviewStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  /* ---------- loyalty ---------- */
  const redeemPoints = useCallback((memberName: string, rewardId: string) => {
    const reward = LOYALTY.rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    setMembers((prev) => prev.map((m) => (m.name === memberName ? { ...m, points: Math.max(0, m.points - reward.cost) } : m)));
    recordActivity(`${memberName} redeemed "${reward.name}" (−${reward.cost} pts)`, "bi-gift");
    toast(`"${reward.name}" issued to ${memberName} — ${reward.cost} points deducted. Voucher sent via WhatsApp.`, "success", "Reward redeemed");
  }, [recordActivity, toast]);

  const saveLoyalty = useCallback((patch: { pointsPerKes?: number; doublePointsDay?: string }) => {
    LOYALTY.pointsPerKes = patch.pointsPerKes ?? LOYALTY.pointsPerKes;
    LOYALTY.doublePointsDay = patch.doublePointsDay ?? LOYALTY.doublePointsDay;
  }, []);

  /* ---------- A/B tests ---------- */
  const startABTest = useCallback((name: string, variable: string, a: string, b: string) => {
    setAbtests((prev) => [{ id: `AB-${11 + Math.floor(Math.random() * 20)}`, name, variable, a, b, winner: "—", uplift: "Running — 5 days left", status: "Running", date: "Just now" }, ...prev]);
    recordActivity(`A/B test started — ${name}`, "bi-award");
  }, [recordActivity]);

  const endABTest = useCallback((id: string, winner: "A" | "B") => {
    setAbtests((prev) => prev.map((t) => (t.id === id ? { ...t, winner, status: "Completed" as const, uplift: winner === "A" ? "+22% clicks" : "+38% open rate" } : t)));
    recordActivity(`A/B test ${id} completed — winner ${winner}`, "bi-award");
    toast(`Winner variant ${winner} rolled out to the remaining 80% of the audience.`, "success", "Test completed");
  }, [recordActivity, toast]);

  /* ---------- flash sales ---------- */
  const launchFlashSale = useCallback((name: string, products: string[], discount: number, code: string, channel: string) => {
    const id = `CMP-${campSeq++}`;
    setCampaigns((prev) => [{
      id, name, channel, goal: "Drive sales", emoji: "⚡",
      audience: "All customers", audienceCount: 4820,
      sent: 4820, opened: 0, clicks: 0, conversions: 0, revenue: 0, cost: 8400,
      status: "Active", date: "Just now",
    }, ...prev]);
    recordActivity(`Flash sale ${code} launched (${products.length} products, ${discount}% off)`, "bi-lightning-charge");
    toast(`Flash sale LIVE — code ${code} for ${discount}% off ${products.length} product(s), announced via ${channel}.`, "success", "Sale launched");
  }, [recordActivity, toast]);

  /* ---------- budget & boosts ---------- */
  const updateBudget = useCallback((patch: Partial<typeof BUDGET>) => {
    setBudget((b) => ({ ...b, ...patch }));
  }, []);

  const boostPost = useCallback((id: string, amount: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, reach: p.reach + amount * 7, likes: p.likes + Math.round(amount / 100) } : p)));
    setBudget((b) => ({ ...b, spent: b.spent + amount }));
    recordActivity(`Post ${id} boosted (KES ${amount.toLocaleString()})`, "bi-graph-up-arrow");
    toast(`KES ${amount.toLocaleString()} boost live on ${id} — estimated +${(amount * 7).toLocaleString()} reach.`, "success", "Post boosted");
  }, [recordActivity, toast]);

  const addCalendarItem = useCallback((day: number, item: { icon: string; label: string; tone: string }) => {
    setCalendarItems((prev) => {
      const existing = prev.find((c) => c.day === day);
      if (existing) return prev.map((c) => (c.day === day ? { ...c, items: [...c.items, item] } : c));
      return [...prev, { day, items: [item] }].sort((a, b) => a.day - b.day);
    });
    recordActivity(`Added to calendar: day ${day} — ${item.label}`, "bi-calendar3");
  }, [recordActivity]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, campaigns, segments, posts, inbox, reviews, abtests, members, calendarItems, budget,
    notifications, activity, searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast,
    recordActivity, createCampaign, updateCampaign, pauseCampaign, launchCampaign, duplicateCampaign, addSegment,
    schedulePost, updatePostStatus, markInboxRead, replyToMessage, replyToReview, approveReview, setReviewStatus,
    redeemPoints, saveLoyalty, startABTest, endABTest, launchFlashSale, updateBudget, boostPost, addCalendarItem,
    markNotifsRead, dismissNotif,
  }), [business, campaigns, segments, posts, inbox, reviews, abtests, members, calendarItems, budget, notifications,
    activity, searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, createCampaign,
    updateCampaign, pauseCampaign, launchCampaign, duplicateCampaign, addSegment, schedulePost, updatePostStatus,
    markInboxRead, replyToMessage, replyToReview, approveReview, setReviewStatus, redeemPoints, saveLoyalty,
    startABTest, endABTest, launchFlashSale, updateBudget, boostPost, addCalendarItem, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
