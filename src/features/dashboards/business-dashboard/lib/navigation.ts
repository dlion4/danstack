export type NavKind = "module" | "anchor" | "here" | "back" | "biz";

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  active?: boolean;
  kind: NavKind;
}

export interface NavZone {
  [key: string]: NavItem[];
}

export const ZONES: Record<string, string> = {
  "💰 Money In": "#0ea37f",
  "💸 Money Out": "#e11d48",
  "🏦 Your Money": "#0e7490",
  "📦 Your Business": "#7c3aed",
  "🚀 Grow": "#f59e0b",
  "⚙️ Run": "#64748b",
};

export const NAVIGATION: NavZone = {
  "💰 Money In": [
    { id: "dashboard", label: "Dashboard", iconName: "LayoutGrid", active: false, kind: "module" },
    { id: "getpaid", label: "Get Paid", iconName: "Wallet", active: false, kind: "module" },
    { id: "customers", label: "Customers & CRM", iconName: "User", active: false, kind: "module" },
  ],
  "💸 Money Out": [
    { id: "paysuppliers", label: "Pay Suppliers", iconName: "Building2", active: false, kind: "module" },
    { id: "payroll", label: "Payroll", iconName: "User", active: false, kind: "anchor" },
    { id: "expenses", label: "Expense Claims", iconName: "Wallet", active: false, kind: "anchor" },
  ],
  "🏦 Your Money": [
    { id: "cash", label: "Cash & Accounts", iconName: "Wallet", active: false, kind: "module" },
    { id: "funding", label: "Funding & Credit", iconName: "Zap", active: false, kind: "module" },
  ],
  "📦 Your Business": [
    { id: "books", label: "Bookkeeping & Taxes", iconName: "Wallet", active: false, kind: "module" },
    { id: "productstore", label: "Products & Store", iconName: "LayoutGrid", active: false, kind: "module" },
    { id: "inventory", label: "Inventory & Stock", iconName: "Package", active: false, kind: "module" },
  ],
  "🚀 Grow": [
    { id: "insurance", label: "Insurance & Protection", iconName: "Sparkles", active: false, kind: "module" },
    { id: "marketing", label: "Marketing & Growth", iconName: "Zap", active: false, kind: "module" },
    { id: "integrations", label: "Apps & Integrations", iconName: "Puzzle", active: false, kind: "module" },
  ],
  "⚙️ Run": [
    { id: "portfolio", label: "Multi-Business", iconName: "Building2", active: false, kind: "biz" },
    { id: "profile", label: "Business Profile", iconName: "Building2", active: false, kind: "module" },
    { id: "team", label: "Team & Roles", iconName: "Users", active: false, kind: "module" },
    { id: "disputes", label: "Disputes & Support", iconName: "Shield", active: false, kind: "module" },
    { id: "notifications", label: "Notifications", iconName: "Bell", active: false, kind: "module" },
    { id: "data", label: "Data & Privacy", iconName: "Database", active: false, kind: "module" },
  ],
};
