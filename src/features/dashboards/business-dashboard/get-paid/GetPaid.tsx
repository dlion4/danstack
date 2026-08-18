/* ============================================================================\n * GetPaid.tsx — /business-dashboard/get-paid (Money In).
 * ----------------------------------------------------------------------------
 * There is no separate BAAS "Get Paid" HTML module in the designed set —
 * inbound money (PayBill, Till, Card, PesaLink) lives on Collections &
 * Merchant Services. Re-export that designed page so the nav item is a real
 * routed workspace inside BusinessShell, theme and functionality intact.
 * ========================================================================== */

export { default } from "../collections-merchant/pages/CollectionsMerchant";
