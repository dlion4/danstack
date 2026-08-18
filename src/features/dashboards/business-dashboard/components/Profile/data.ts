/* ==================================================================
   PayMo Business — PAGE 5: BUSINESS PROFILE, KYB & PORTFOLIO SETTINGS
================================================================== */

/* ================= Types ================= */
export type DocStatus = "Verified" | "Under Review" | "Missing" | "Expiring soon";
export type ComplianceLevel = "Level 1" | "Level 2" | "Level 3";
export type EntityType = "Sole Proprietorship" | "Limited Company" | "Partnership" | "NGO" | "SACCO" | "Trust";
export type EntityStatus = "Active" | "Inactive" | "Suspended";

export interface KYBDoc {
  id: string; label: string; desc: string; status: DocStatus;
  uploaded?: string; expires?: string; fileName?: string; required: boolean;
}
export interface Director {
  id: string; name: string; role: string; kraPin: string;
  idNumber: string; idUploaded: boolean; pinUploaded: boolean;
  beneficialOwner: boolean; ownershipPct: number;
}
export interface TaxReg {
  id: string; name: string; short: string; registered: boolean;
  certNumber?: string; effectiveDate?: string; note: string;
}
export interface SectorPreset {
  id: string; name: string; emoji: string; desc: string;
  changes: string[]; industries: string[];
}
export interface BusinessProfile {
  legalName: string; tradingName: string; regNumber: string; kraPin: string;
  kraVerified: boolean; entityType: EntityType; regDate: string;
  address: string; county: string; email: string; phone: string;
  logoEmoji: string; primaryColor: string; secondaryColor: string;
  website: string; instagram: string; facebook: string;
  industry: string; subSector: string; fyEnd: string;
  contactName: string; contactPhone: string; contactEmail: string;
  altContactName: string; altContactPhone: string;
  defaultTerms: string; defaultTemplate: string; invoiceNotes: string; paymentInstructions: string;
}
export interface PortfolioBusiness {
  id: string; name: string; emoji: string; color: string; entityType: EntityType;
  status: EntityStatus; folder: string; cash: number; revenueMTD: number; expensesMTD: number;
  lastActivity: string; kybLevel: ComplianceLevel; units?: number; kraPin: string;
}
export interface Folder { id: string; name: string; emoji: string; color: string }
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Default profile ================= */
export const DEFAULT_PROFILE: BusinessProfile = {
  legalName: "TechSolutions Limited",
  tradingName: "TechSol",
  regNumber: "PPT/2024/123456",
  kraPin: "P051239991Y",
  kraVerified: true,
  entityType: "Limited Company",
  regDate: "12 Mar 2022",
  address: "Chandaria Business Centre, 2nd Floor, Waiyaki Way",
  county: "Nairobi · Westlands",
  email: "hello@techsol.co.ke",
  phone: "0722 445 118",
  logoEmoji: "💻",
  primaryColor: "#12b76a",
  secondaryColor: "#0b1322",
  website: "www.techsol.co.ke",
  instagram: "@techsol_ke",
  facebook: "techsol.kenya",
  industry: "Technology",
  subSector: "IT services & software",
  fyEnd: "December",
  contactName: "Wanjiku Maina",
  contactPhone: "0722 445 118",
  contactEmail: "wanjiku@techsol.co.ke",
  altContactName: "Mwangi Kamau",
  altContactPhone: "0733 812 990",
  defaultTerms: "30 days",
  defaultTemplate: "Professional",
  invoiceNotes: "Thank you for your business! We appreciate your prompt payment.",
  paymentInstructions: "Please pay via M-Pesa Paybill 247247, account reference [invoice number]. Bank: NCBA A/C 5834229001.",
};

/* ================= KYB documents ================= */
export const KYB_DOCS: KYBDoc[] = [
  { id: "kd1", label: "Certificate of Incorporation", desc: "Issued by the Registrar of Companies", status: "Verified", uploaded: "12 Mar 2022", fileName: "CoI-PPT-2024-123456.pdf", required: true },
  { id: "kd2", label: "KRA PIN Certificate", desc: "Company KRA PIN (P05...Y)", status: "Verified", uploaded: "12 Mar 2022", fileName: "KRA-Cert-TechSol.pdf", required: true },
  { id: "kd3", label: "CR12 — Business Registration Summary", desc: "Must be less than 6 months old", status: "Expiring soon", uploaded: "22 Aug 2025", expires: "22 Feb 2026", fileName: "CR12-2025-08.pdf", required: true },
  { id: "kd4", label: "Memorandum & Articles of Association", desc: "For Ltd companies; Partnership Deed for partnerships", status: "Verified", uploaded: "12 Mar 2022", fileName: "M&A-TechSol.pdf", required: true },
  { id: "kd5", label: "Directors' KRA PIN Certificates", desc: "All directors must submit", status: "Verified", uploaded: "12 Mar 2022", required: true },
  { id: "kd6", label: "Directors' ID Copies", desc: "Both sides · matched to IPRS", status: "Verified", uploaded: "12 Mar 2022", required: true },
  { id: "kd7", label: "Beneficial Ownership Declaration", desc: "CBK requirement — who actually controls the business", status: "Under Review", uploaded: "8 Jan 2026", fileName: "BO-Declaration-2026.pdf", required: true },
  { id: "kd8", label: "Business premises proof", desc: "Lease agreement, title deed, or utility bill", status: "Missing", required: true },
  { id: "kd9", label: "Bank account verification", desc: "Micro-deposit sent to NCBA A/C — confirm 2 amounts", status: "Missing", required: true },
];

/* ================= Directors ================= */
export const DIRECTORS: Director[] = [
  { id: "dir1", name: "Wanjiku Maina", role: "Founder & CEO", kraPin: "A004321001X", idNumber: "23456789", idUploaded: true, pinUploaded: true, beneficialOwner: true, ownershipPct: 60 },
  { id: "dir2", name: "Mwangi Kamau", role: "Co-founder & CTO", kraPin: "A004322001Y", idNumber: "24567890", idUploaded: true, pinUploaded: true, beneficialOwner: true, ownershipPct: 30 },
  { id: "dir3", name: "Achieng Otieno", role: "Head of Finance", kraPin: "A004323001Z", idNumber: "25678901", idUploaded: true, pinUploaded: true, beneficialOwner: false, ownershipPct: 10 },
];

/* ================= Tax registrations ================= */
export const TAX_REGISTRATIONS: TaxReg[] = [
  { id: "tr1", name: "VAT (Value Added Tax)", short: "VAT", registered: true, certNumber: "VAT-2023-88412", effectiveDate: "1 Apr 2023", note: "16% standard rate · monthly filing due 20th" },
  { id: "tr2", name: "PAYE (Pay As You Earn)", short: "PAYE", registered: true, certNumber: "PAYE-2022-11220", effectiveDate: "1 Apr 2022", note: "Monthly filing due 9th · 4 employees on payroll" },
  { id: "tr3", name: "NSSF Employer Registration", short: "NSSF", registered: true, certNumber: "NSSF-KE-77621", effectiveDate: "1 Apr 2022", note: "Tier I & II · monthly submission by 9th" },
  { id: "tr4", name: "SHIF (Social Health Insurance Fund)", short: "SHIF", registered: true, certNumber: "SHIF-EMP-33218", effectiveDate: "1 Oct 2024", note: "Replaced NHIF · monthly submission by 9th" },
  { id: "tr5", name: "Turnover Tax", short: "TOT", registered: false, note: "Not applicable — VAT-registered business above KES 5M threshold" },
  { id: "tr6", name: "Withholding Tax", short: "WHT", registered: true, certNumber: "WHT-2023-12045", effectiveDate: "1 Apr 2023", note: "Applies on consulting fees paid to non-residents" },
];

/* ================= Sector presets ================= */
export const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: "sp1", name: "Retail & Trading", emoji: "🛍️", desc: "Physical shop or online store with inventory",
    industries: ["Retail", "Wholesale", "E-commerce"],
    changes: ["Adds 'Cost of Goods Sold' to Chart of Accounts", "Enables Inventory & Stock module by default", "Sets invoice template to 'Retail'", "Default payment terms: On receipt", "Adds barcode field to product entry"],
  },
  {
    id: "sp2", name: "Real Estate / Rental", emoji: "🏠", desc: "Property management, rental income, tenants",
    industries: ["Real Estate"],
    changes: ["Changes default invoice terms to 'Due on 1st of month'", "Adds 'Rent Income' & 'Property Maintenance' to CoA", "Activates 'Security Deposits' tracking", "Suggests 'Rent Collections' Virtual Account", "Adds property-specific fields to profile"],
  },
  {
    id: "sp3", name: "Professional Services", emoji: "💼", desc: "Consulting, agencies, freelancers",
    industries: ["Services", "Consulting", "Legal", "Accounting"],
    changes: ["Adds 'Consulting Revenue' & 'Sub-contractor' to CoA", "Sets invoice template to 'Professional'", "Enables time-tracking & billable hours", "Default payment terms: 30 days", "Adds project fields to invoices"],
  },
  {
    id: "sp4", name: "Restaurant & Hospitality", emoji: "🍽️", desc: "Cafes, restaurants, hotels, catering",
    industries: ["Hospitality", "Food & Beverage"],
    changes: ["Adds 'Food Cost' & 'Beverage Cost' lines", "Activates split-bill & tips on receipts", "Suggests connecting a POS via Apps & Integrations", "Adds staff tip pool tracking", "Enables shift-based reporting"],
  },
  {
    id: "sp5", name: "NGO & Donor-funded", emoji: "🤝", desc: "Restricted funds, donor reporting",
    industries: ["NGO", "Non-profit"],
    changes: ["Adds 'Restricted' / 'Unrestricted' fund tracking", "Enables donor-specific expense tagging", "Adds Grant Reporting templates", "Suggests connecting Zoho Books for board reports", "Removes VAT (typically exempt) from invoice defaults"],
  },
  {
    id: "sp6", name: "Agriculture", emoji: "🌾", desc: "Farms, agri-processing, cooperatives",
    industries: ["Agriculture"],
    changes: ["Adds 'Seed & Inputs' & 'Harvest Revenue' lines", "Activates seasonal cashflow projections", "Adds farmer/cooperative member directory", "Suggests M-Pesa Kilimo integration", "Enables commodity price alerts"],
  },
];

/* ================= Portfolio folders & businesses ================= */
export const FOLDERS: Folder[] = [
  { id: "fol1", name: "My Businesses", emoji: "🏢", color: "#12b76a" },
  { id: "fol2", name: "Rental Properties", emoji: "🏠", color: "#f79009" },
  { id: "fol3", name: "Side Projects", emoji: "🚀", color: "#7a5af8" },
];

export const PORTFOLIO: PortfolioBusiness[] = [
  { id: "b1", name: "TechSolutions Ltd", emoji: "💻", color: "#2e90fa", entityType: "Limited Company", status: "Active", folder: "fol1", cash: 890000, revenueMTD: 720000, expensesMTD: 480000, lastActivity: "2 hours ago", kybLevel: "Level 2", kraPin: "P051239991Y" },
  { id: "b2", name: "TS Retail Ltd", emoji: "🛍️", color: "#12b76a", entityType: "Limited Company", status: "Active", folder: "fol1", cash: 1240000, revenueMTD: 486250, expensesMTD: 301400, lastActivity: "12 min ago", kybLevel: "Level 2", kraPin: "P051234567X" },
  { id: "b3", name: "Kilimani House 1", emoji: "🏠", color: "#f79009", entityType: "Sole Proprietorship", status: "Active", folder: "fol2", cash: 1420000, revenueMTD: 150000, expensesMTD: 42000, lastActivity: "1 day ago", kybLevel: "Level 1", units: 6, kraPin: "A004321001X" },
  { id: "b4", name: "Kilimani House 2", emoji: "🏡", color: "#f79009", entityType: "Sole Proprietorship", status: "Active", folder: "fol2", cash: 520000, revenueMTD: 90000, expensesMTD: 68000, lastActivity: "5 days ago", kybLevel: "Level 1", units: 4, kraPin: "A004321001X" },
  { id: "b5", name: "Westlands Apartment", emoji: "🏢", color: "#f79009", entityType: "Sole Proprietorship", status: "Inactive", folder: "fol2", cash: 12000, revenueMTD: 0, expensesMTD: 0, lastActivity: "42 days ago", kybLevel: "Level 1", units: 2, kraPin: "A004321001X" },
  { id: "b6", name: "Sanaa Side Hustle", emoji: "🎨", color: "#e11d48", entityType: "Sole Proprietorship", status: "Active", folder: "fol3", cash: 142000, revenueMTD: 80000, expensesMTD: 33000, lastActivity: "3 days ago", kybLevel: "Level 1", kraPin: "A004321001X" },
  { id: "b7", name: "Personal Car Hire", emoji: "🚗", color: "#7a5af8", entityType: "Sole Proprietorship", status: "Suspended", folder: "fol3", cash: 4200, revenueMTD: 0, expensesMTD: 8000, lastActivity: "1 hour ago", kybLevel: "Level 1", kraPin: "A004321001X" },
];

export const COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu (Eldoret)", "Kiambu", "Machakos", "Kajiado",
  "Kilifi", "Kakamega", "Meru", "Nyeri", "Kirinyaga", "Kericho", "Bomet", "Bungoma", "Busia",
  "Kisii", "Nyamira", "Homa Bay", "Migori", "Trans Nzoia", "Turkana", "Marsabit", "Isiolo",
];
export const INDUSTRIES = [
  "Retail / Trading", "Technology", "Agriculture", "Services / Consulting", "Manufacturing",
  "Real Estate", "NGO / Non-profit", "Hospitality", "Financial services", "Healthcare",
  "Education", "Transport & Logistics", "Construction", "Media & Entertainment", "Other",
];
export const FY_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-exclamation-triangle", text: "CR12 expires in 34 days — upload a new one to keep Level 2 compliance", time: "9 min ago", unread: true, action: "Upload" },
  { id: 2, icon: "bi-shield-check", text: "Beneficial Ownership Declaration is under review by PayMo compliance", time: "1 hr ago", unread: true, action: "Status" },
  { id: 3, icon: "bi-buildings", text: "Westlands Apartment inactive for 42 days — consider deactivating", time: "Yesterday", unread: true, action: "Review" },
  { id: 4, icon: "bi-cash-stack", text: "Personal Car Hire suspended — compliance issue needs attention", time: "1 hr ago", unread: true, action: "Fix" },
  { id: 5, icon: "bi-file-earmark-check", text: "KRA PIN verified successfully via iTax API", time: "2 days ago", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 08:56", icon: "bi-cloud-upload", text: "Beneficial Ownership Declaration uploaded — submitted for review", by: "You" },
  { time: "Today 08:12", icon: "bi-shield-check", text: "KRA PIN P051239991Y verified via iTax API", by: "System" },
  { time: "Yesterday", icon: "bi-palette", text: "Brand primary colour updated to #12b76a", by: "You" },
  { time: "Yesterday", icon: "bi-buildings", text: "Sanaa Side Hustle profile updated — new logo & tagline", by: "You" },
  { time: "3 days ago", icon: "bi-shield-lock", text: "Multi-Business Portfolio access matrix updated for Achieng O.", by: "You" },
  { time: "1 week ago", icon: "bi-magic", text: "Real Estate preset applied to Kilimani House 1", by: "You" },
  { time: "1 week ago", icon: "bi-plus-circle", text: "New business added: Sanaa Side Hustle", by: "You" },
  { time: "2 weeks ago", icon: "bi-file-earmark-arrow-up", text: "CR12 (Aug 2025) uploaded and verified", by: "You" },
];
