/* ============================================================================
 * Card Dashboard — icon registry
 * ----------------------------------------------------------------------------
 * Maps the dashboard's semantic `IconName` keys to bootstrap-icons classes.
 * `icons.tsx` renders these as `<i class="bi bi-*">` elements. The map is the
 * single source of truth so data files (MODULES, seed datasets) can reference
 * icons by name without importing React.
 * ========================================================================== */

export const ICON_MAP = {
  menu: "bi-list",
  x: "bi-x-lg",
  search: "bi-search",
  bell: "bi-bell",
  chevDown: "bi-chevron-down",
  chevRight: "bi-chevron-right",
  chevLeft: "bi-chevron-left",
  card: "bi-credit-card-2-front",
  snow: "bi-snow",
  lock: "bi-lock",
  alertTri: "bi-exclamation-triangle-fill",
  shield: "bi-shield",
  shieldCheck: "bi-shield-fill-check",
  chart: "bi-bar-chart-line",
  sliders: "bi-sliders",
  globe: "bi-globe2",
  zap: "bi-lightning-charge",
  plus: "bi-plus-lg",
  check: "bi-check2",
  checkCircle: "bi-check-circle-fill",
  info: "bi-info-circle",
  phone: "bi-telephone",
  sms: "bi-chat-dots",
  mail: "bi-envelope",
  upRight: "bi-arrow-up-right",
  downRight: "bi-arrow-down-right",
  download: "bi-download",
  filter: "bi-funnel",
  refresh: "bi-arrow-repeat",
  eye: "bi-eye",
  eyeOff: "bi-eye-slash",
  wallet: "bi-wallet2",
  users: "bi-people",
  help: "bi-question-circle",
  send: "bi-send",
  spark: "bi-stars",
  clock: "bi-clock-history",
  wave: "bi-activity",
  logout: "bi-box-arrow-right",
  building: "bi-buildings",
  pie: "bi-pie-chart",
  key: "bi-key",
  copy: "bi-copy",
  flag: "bi-flag",
  arrowRight: "bi-arrow-right",
  dots: "bi-three-dots-vertical",
  inbox: "bi-inbox",
  headset: "bi-headset",
  gauge: "bi-speedometer2",
  pencil: "bi-pencil",
} as const;

export type IconName = keyof typeof ICON_MAP;

/** Resolve a semantic icon name to its bootstrap-icons class (with fallback). */
export function iconClass(name: IconName | (string & {})): string {
  return ICON_MAP[name as IconName] ?? "bi-circle";
}
