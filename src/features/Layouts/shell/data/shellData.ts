/* ============================================================================
 * shellData.ts — Paymo BAAS App Shell (data + types)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html (1,627 LOC) — the BaaS shell had its nav
 * groups, notifications and accounts hardcoded as JS consts that were injected
 * via innerHTML. They are extracted here as `initialMockData` so the shell is
 * backend-ready: GET /api/shell-content returns this exact shape.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Query + Bootstrap 5
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; emerald theme;
 *                 fonts come from routes/__root.tsx; art served from /public.
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
export type ToastTone = "success" | "danger" | "warning" | "info";
export type AsideKind = "security" | "developers" | "securityTab" | "apiKeysTab";

export interface NavItem {
        key: string;
        label: string;
        icon: string; // bootstrap-icons class fragment, e.g. 'bi-house-door'
        badge?: string | number;
        /** When true, opens a right-aside panel instead of routing. */
        opensAside?: AsideKind;
}

export interface NavSubGroup {
        title: string;
        items: NavItem[];
}

export interface NavGroup {
        title: string;
        items: NavItem[];
        /** Optional background color for the section (e.g., 'blue' for light blue background) */
        bgColor?: "blue" | "default";
        /** Optional sub-groups for better organization */
        subGroups?: NavSubGroup[];
}

export interface NotificationItem {
        id: number;
        icon: string;
        tone: "primary" | "success" | "warning" | "danger";
        title: string;
        desc: string;
        time: string;
        unread: boolean;
}

export interface AccountItem {
        id: string;
        name: string;
        role: string;
        primary?: boolean;
}

export interface SessionRow {
        device: string;
        meta: string;
        status: "active" | "warning";
        statusText: string;
}

export interface ApiHealthRow {
        service: string;
        status: "active" | "warning";
        statusText: string;
}

export interface ModuleStat {
        label: string;
        value: string;
        delta?: string;
        up?: boolean;
}

export interface ModuleFeature {
        icon: string;
        text: string;
}

export interface ModuleAction {
        icon: string;
        label: string;
        tone?: "primary" | "ghost";
}

export interface ModuleDef {
        /** Used as the route param and the nav key. */
        key: string;
        label: string;
        icon: string;
        pill: string;
        titlePre: string;
        titleAccent: string;
        copy: string;
        c1: string; // accent gradient start
        c2: string; // accent gradient end
        stats: ModuleStat[];
        features: ModuleFeature[];
        actions: ModuleAction[];
}

export interface ShellContent {
        brand: { name: string; tag: string; initials: string };
        user: { name: string; role: string; email: string; initials: string };
        accountId: string;
        navGroups: NavGroup[];
        notifications: NotificationItem[];
        accounts: AccountItem[];
        security: { twoFactorOn: boolean; sessions: SessionRow[] };
        developers: { sandboxOn: boolean; health: ApiHealthRow[] };
        modules: ModuleDef[];
}

/* --------------------------------------------------------------------------
 * initialMockData — every repeating/hardcoded block from legacy layout.html.
 * GET /api/shell-content should return this same shape.
 * ------------------------------------------------------------------------ */
export const initialMockData: ShellContent = {
        brand: { name: "Paymo", tag: "BaaS", initials: "PM" },

        user: {
                name: "Jeckonia K.",
                role: "Account Holder",
                email: "Jeckonia.k@paymo.co",
                initials: "JK",
        },

        accountId: "ACC-8X29-KL4",

        navGroups: [
                {
                        title: "Payments & Transfers",
                        subGroups: [
                                {
                                        title: "Overview",
                                        items: [
                                                {
                                                        key: "transfer-overview",
                                                        label: "Overview",
                                                        icon: "bi-speedometer2",
                                                },
                                        ],
                                },
                                {
                                        title: "Transfer Operations",
                                        items: [
                                                {
                                                        key: "initiate-transfer",
                                                        label: "New Transfer",
                                                        icon: "bi-send",
                                                },
                                                {
                                                        key: "transfer-management",
                                                        label: "Manage Transfers",
                                                        icon: "bi-list-task",
                                                },
                                        ],
                                },
                                {
                                        title: "Payment Infrastructure",
                                        items: [
                                                {
                                                        key: "payment-rails",
                                                        label: "Rails & Routing",
                                                        icon: "bi-signpost-split",
                                                },
                                                {
                                                        key: "mobile-money",
                                                        label: "Mobile Money",
                                                        icon: "bi-phone",
                                                },
                                        ],
                                },
                        ],
                        items: [],
                },
                
                {
                        title: "Business Operations",
                        bgColor: "blue",
                        subGroups: [
                                {
                                        title: "Business Setup",
                                        items: [
                                                {
                                                        key: "onboarding",
                                                        label: "Onboarding & KYC",
                                                        icon: "bi-rocket-takeoff",
                                                },
                                        ],
                                },
                                {
                                        title: "Customer Management",
                                        items: [
                                                { key: "customers", label: "Customers", icon: "bi-people" },
                                        ],
                                },
                                {
                                        title: "Financial Operations",
                                        items: [
                                                { key: "liquidity", label: "Liquidity & Float", icon: "bi-droplet" },
                                                {
                                                        key: "reconciliation",
                                                        label: "Reconciliation",
                                                        icon: "bi-clipboard-check",
                                                },
                                                { key: "settlement", label: "Settlement", icon: "bi-bank" },
                                                {
                                                        key: "fx",
                                                        label: "FX & Currencies",
                                                        icon: "bi-currency-exchange",
                                                },
                                                { key: "fees", label: "Fees & Profit", icon: "bi-receipt" },
                                        ],
                                },
                                {
                                        title: "Compliance & Risk",
                                        items: [
                                                {
                                                        key: "compliance",
                                                        label: "AML & Compliance",
                                                        icon: "bi-shield-check",
                                                },
                                                {
                                                        key: "disputes",
                                                        label: "Disputes",
                                                        icon: "bi-exclamation-triangle",
                                                },
                                                {
                                                        key: "kra-government",
                                                        label: "Tax & Gov",
                                                        icon: "bi-building-check",
                                                },
                                        ],
                                },
                                {
                                        title: "Operations & Analytics",
                                        items: [
                                                {
                                                        key: "analytics",
                                                        label: "Analytics",
                                                        icon: "bi-graph-up-arrow",
                                                },
                                                {
                                                        key: "ops-health",
                                                        label: "System Health",
                                                        icon: "bi-cpu",
                                                },
                                        ],
                                },
                        ],
                        items: [],
                },
                
        ],
        modules: [],

        notifications: [
                {
                        id: 1,
                        icon: "bi-cpu",
                        tone: "primary",
                        title: "Developer API key rotated",
                        desc: "Production key was refreshed 2 min ago.",
                        time: "2m",
                        unread: true,
                },
                {
                        id: 2,
                        icon: "bi-currency-dollar",
                        tone: "success",
                        title: "Incoming settlement received",
                        desc: "KES 2.84M settled to operating wallet.",
                        time: "15m",
                        unread: true,
                },
                {
                        id: 3,
                        icon: "bi-shield-check",
                        tone: "warning",
                        title: "New login from Safari · Nairobi",
                        desc: "If this wasn't you, review active sessions.",
                        time: "1h",
                        unread: true,
                },
                {
                        id: 4,
                        icon: "bi-arrow-left-right",
                        tone: "danger",
                        title: "Bulk transfer partially failed",
                        desc: "12 of 340 transactions need retry.",
                        time: "3h",
                        unread: false,
                },
        ],

        accounts: [
                {
                        id: "ACC-8X29-KL4",
                        name: "Operating Account",
                        role: "Primary",
                        primary: true,
                },
                { id: "ACC-2P91-MNQ", name: "Developer Sandbox", role: "Test" },
                { id: "ACC-7L44-XYZ", name: "Treasury Reserve", role: "Restricted" },
        ],

        security: {
                twoFactorOn: true,
                sessions: [
                        {
                                device: "Chrome · Windows",
                                meta: "Nairobi, KE",
                                status: "active",
                                statusText: "Now",
                        },
                        {
                                device: "Safari · iPhone",
                                meta: "Mombasa, KE",
                                status: "active",
                                statusText: "Now",
                        },
                        {
                                device: "Firefox · macOS",
                                meta: "New York, US",
                                status: "warning",
                                statusText: "2h ago",
                        },
                ],
        },

        developers: {
                sandboxOn: false,
                health: [
                        { service: "Transfers API", status: "active", statusText: "Operational" },
                        { service: "Webhooks", status: "warning", statusText: "Degraded" },
                        { service: "Payouts API", status: "active", statusText: "Operational" },
                ],
        },
};

/* --------------------------------------------------------------------------
 * Left drawer data — session info, auth items, policy links.
 * ------------------------------------------------------------------------ */
export interface SessionInfo {
        ip: string;
        location: string;
        device: string;
        lastLogin: string;
}

export interface AuthItem {
        key: string;
        label: string;
        icon: string;
        status: "set" | "not-set";
        action: string;
        statusLabel: string;
}

export interface PolicyLink {
        key: string;
        label: string;
        icon: string;
}

export interface LinkedAccount {
	key: string;
	label: string;
	icon: string;
	linked: boolean;
	id?: string;
}

export interface LeftDrawerData {
        session: SessionInfo;
        authItems: AuthItem[];
        policies: PolicyLink[];
}

export const leftDrawerData: LeftDrawerData = {
        session: {
                ip: "192.168.1.42",
                location: "Nairobi, Kenya",
                device: "Chrome on macOS",
                lastLogin: "2 Aug 2026, 09:14 EAT",
        },
        authItems: [
                {
                        key: "2fa",
                        label: "Two-Factor Authentication",
                        icon: "bi-shield-lock",
                        status: "not-set",
                        action: "Set Now",
                        statusLabel: "Not set",
                },
                {
                        key: "password",
                        label: "Password",
                        icon: "bi-key",
                        status: "set",
                        action: "Change",
                        statusLabel: "Last changed 14d ago",
                },
                {
                        key: "pin",
                        label: "PIN",
                        icon: "bi-pin-angle",
                        status: "set",
                        action: "Manage",
                        statusLabel: "Active",
                },
                {
                        key: "passkeys",
                        label: "Passkeys",
                        icon: "bi-fingerprint",
                        status: "not-set",
                        action: "Add",
                        statusLabel: "Not set",
                },
        ],
        policies: [
                { key: "privacy", label: "Privacy Policy", icon: "bi-shield-check" },
                { key: "aml", label: "AML Policy", icon: "bi-file-earmark-text" },
                { key: "terms", label: "Terms of Service", icon: "bi-journal-text" },
                { key: "cookies", label: "Cookie Policy", icon: "bi-cookie" },
        ],
};

/* --------------------------------------------------------------------------
 * Linked Accounts — for the header Accounts dropdown.
 * ------------------------------------------------------------------------ */
export const linkedAccounts: LinkedAccount[] = [
	{ key: "primary", label: "Primary Account", icon: "bi-person-circle", linked: true, id: "ACC-2942-019" },
	{ key: "business", label: "Business Account", icon: "bi-briefcase", linked: false },
	{ key: "utility", label: "Utility Account", icon: "bi-lightning-charge", linked: false },
	{ key: "developer", label: "Developer Account", icon: "bi-code-slash", linked: true, id: "DEV-8818-042" },
	{ key: "savings", label: "Savings Account", icon: "bi-piggy-bank", linked: false },
];

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
export async function fetchShellContent(): Promise<ShellContent> {
        const response = await fetch("/api/shell-content", {
                headers: { Accept: "application/json" },
        });
        if (!response.ok)
                throw new Error(`Shell content API responded HTTP ${response.status}`);
        return response.json() as Promise<ShellContent>;
}

/* --------------------------------------------------------------------------
 * Helpers shared across shell components.
 * ------------------------------------------------------------------------ */

/** Classnames join (same convention used across all danstack feature pages). */
export const cx = (
        ...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(" ");

/** Fallback shown when a section has no dedicated page yet (e.g. /pm/app/cash-flow). */
export const placeholderModule: ModuleDef = {
        key: "placeholder",
        label: "Module",
        icon: "bi-box",
        pill: "Coming soon",
        titlePre: "This section is ",
        titleAccent: "under construction",
        copy: "The dedicated page for this module isn't wired up yet. Check back soon, or ask your developer to point this sidebar entry at a real route.",
        c1: "#0d6efd",
        c2: "#6610f2",
        stats: [],
        features: [],
        actions: [],
};

/** Resolve a module by key, falling back to a safe placeholder for unbuilt sections. */
export function findModule(content: ShellContent, key: string): ModuleDef {
        return (content.modules ?? []).find((m) => m.key === key) ?? placeholderModule;
}
