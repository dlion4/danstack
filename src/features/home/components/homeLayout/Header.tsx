"use client";



import {
  ArrowRight,
  ArrowLeftRight,
  BookOpen,
  Building2,
  CalendarDays,
  ChartLine,
  ChevronDown,
  CircleHelp,
  CircleCheck,
  Code2,
  Coins,
  type LucideIcon,
  RotateCw,
  Eye,
  EyeOff,
  HandCoins,
  Landmark,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Search,
  ShoppingCart,
  Terminal,
  Users,
  Wallet,
  X,
  Zap,
  LogIn,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import styles from "./Header.module.css";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type IconColor = "green" | "teal" | "emerald" | "mint";

interface MenuCard {
  icon: LucideIcon;
  color: IconColor;
  title: string;
  desc: string;
}

interface MenuSection {
  id: "product" | "solutions" | "developers" | "resources";
  label: string;
  layout: "grid" | "stack";
  width: number;
  cards: MenuCard[];
  footerLink?: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data — extracted from the HTML prototype                           */
/* -------------------------------------------------------------------------- */

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "product",
    label: "Product",
    layout: "grid",
    width: 580,
    cards: [
      { icon: ArrowLeftRight, color: "green", title: "Payments", desc: "Multi-currency payment processing across Africa" },
      { icon: Wallet, color: "teal", title: "Wallets", desc: "Digital wallet infrastructure with KYC built-in" },
      { icon: RotateCw, color: "emerald", title: "FX Exchange", desc: "Real-time foreign exchange at competitive rates" },
      { icon: Building2, color: "mint", title: "Banking as a Service", desc: "Full-stack banking APIs for your platform" },
    ],
    footerLink: "View all products",
  },
  {
    id: "solutions",
    label: "Solutions",
    layout: "stack",
    width: 520,
    cards: [
      { icon: ShoppingCart, color: "green", title: "E-Commerce", desc: "Integrate payments into online stores and marketplaces" },
      { icon: HandCoins, color: "teal", title: "Lending", desc: "Disburse loans and collect repayments seamlessly" },
      { icon: Users, color: "emerald", title: "Fintech Startups", desc: "Launch financial products faster with our APIs" },
      { icon: Landmark, color: "mint", title: "Enterprise", desc: "Custom solutions for large-scale operations" },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    layout: "stack",
    width: 480,
    cards: [
      { icon: BookOpen, color: "green", title: "Documentation", desc: "Comprehensive guides and API references" },
      { icon: Code2, color: "teal", title: "API Reference", desc: "Interactive API explorer with real endpoints" },
      { icon: Terminal, color: "emerald", title: "SDKs & Libraries", desc: "Official SDKs for Python, Node.js, Java, Go" },
      { icon: RotateCw, color: "mint", title: "Changelog", desc: "Latest updates, features, and deprecations" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    layout: "stack",
    width: 480,
    cards: [
      { icon: Newspaper, color: "green", title: "Blog", desc: "Insights on fintech, payments, and Africa's economy" },
      { icon: ChartLine, color: "teal", title: "Case Studies", desc: "See how businesses grow with Paymo" },
      { icon: CircleHelp, color: "emerald", title: "Help Center", desc: "FAQs, troubleshooting, and support channels" },
      { icon: CalendarDays, color: "mint", title: "Events & Webinars", desc: "Upcoming sessions and recorded webinars" },
    ],
  },
];

interface FxTickerItem {
  label?: string;
  pair: string;
  delta: number;
}

const FX_TICKER: FxTickerItem[] = [
  { label: "LIVE FX", pair: "GN 1,520.50", delta: 0.2 },
  { pair: "USD/KES 128.75", delta: 0.5 },
  { pair: "USD/GHS 15.20", delta: -0.1 },
  { pair: "USD/NGN 1,585.30", delta: 0.3 },
  { pair: "EUR/USD 1.0845", delta: 0.1 },
  { pair: "GBP/USD 1.2630", delta: -0.05 },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const iconBoxClass: Record<IconColor, string> = {
  green: styles.iconBoxGreen,
  teal: styles.iconBoxTeal,
  emerald: styles.iconBoxEmerald,
  mint: styles.iconBoxMint,
};

function IconBox({
  icon: Icon,
  color,
  size = 18,
  className,
}: {
  icon: LucideIcon;
  color: IconColor;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={[styles.iconBox, iconBoxClass[color], className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon size={size} strokeWidth={1.75} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function FxTicker() {
  // Duplicate the list so the translateX(-50%) ticker loops seamlessly.
  const items = [...FX_TICKER, ...FX_TICKER];
  return (
    <div className={styles.tickerBar} role="marquee" aria-label="Live FX rates">
      <div className={styles.tickerTrack}>
        {items.map((item, i) => (
          <span className={styles.tickerItem} key={i}>
            {item.label ? (
              <span className={styles.tickerLabel}>{item.label}</span>
            ) : null}
            <span className={styles.tickerValue}>{item.pair}</span>
            <span className={item.delta >= 0 ? styles.tickerUp : styles.tickerDown}>
              {item.delta >= 0 ? "+" : ""}
              {item.delta.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <div className={styles.statusWrap}>
        <span className={styles.statusBadge}>
          <span className={styles.statusDot} />
          Systems 100% Operational
        </span>
      </div>
    </div>
  );
}

interface DropdownPanelProps {
  section: MenuSection;
  isOpen: boolean;
  onCardClick: (title: string) => void;
}

function DropdownPanel({ section, isOpen, onCardClick }: DropdownPanelProps) {
  return (
    <div
      className={[
        styles.dropdownPanel,
        isOpen ? styles.dropdownPanelActive : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: section.width }}
      role="menu"
      aria-hidden={!isOpen}
    >
      <div className={styles.dropdownInner}>
        <div className={section.layout === "grid" ? styles.dropdownGrid : styles.dropdownStack}>
          {section.cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                className={styles.dropdownCard}
                role="menuitem"
                onClick={() => onCardClick(card.title)}
              >
                <IconBox icon={Icon} color={card.color} />
                <span>
                  <span className={styles.cardTitle}>{card.title}</span>
                  <span className={styles.cardDesc}>{card.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        {section.footerLink ? (
          <div className={styles.dropdownFooter}>
            <ArrowRight size={11} color="#38c27a" />
            <a href="#" className={styles.dropdownFooterLink}>
              {section.footerLink}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Header component                                                     */
/* -------------------------------------------------------------------------- */

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<MenuSection["id"] | null>(
    null,
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<MenuSection["id"] | null>(null);

  const [loginOpen, setLoginOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const navItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const loginAriaId = useId();

  /* ----- toast ----- */
  const showToast = useCallback((msg: string) => {
    setToast({ show: true, msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, msg });
    }, 3000);
  }, []);

  /* ----- desktop dropdown open/close ----- */
  const openDropdown = useCallback((id: MenuSection["id"]) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(id);
  }, []);

  const closeDropdown = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleTriggerClick = (
    e: ReactMouseEvent<HTMLButtonElement>,
    id: MenuSection["id"],
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const handleTriggerKeyDown = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
    id: MenuSection["id"],
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveDropdown((prev) => (prev === id ? null : id));
    }
    if (e.key === "Escape") {
      setActiveDropdown(null);
      navItemRefs.current[id]?.focus();
    }
  };

  /* ----- mobile menu ----- */
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleSubmenu = (id: MenuSection["id"]) => {
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };

  /* ----- login modal ----- */
  const openLogin = useCallback(() => {
    setMobileOpen(false);
    setLoginOpen(true);
    setTimeout(() => emailInputRef.current?.focus(), 300);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setEmailError("");
    setPasswordError("");
  }, []);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      if (typeof window !== "undefined") {
        const newUrl = window.location.pathname + "#/dashboard";
        window.history.pushState({}, "", newUrl);
      }
      closeLogin();
      showToast("Signed in successfully — redirecting to dashboard");
      setEmail("");
      setPassword("");
    }
  };

  /* ----- global listeners ----- */
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(`.${styles.navItem}`)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
        setLoginOpen(false);
      }
      // "/" focuses search box (when not typing in an input)
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        )
          return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ----- body scroll lock when mobile drawer or login open ----- */
  useEffect(() => {
    const lock = mobileOpen || loginOpen;
    if (typeof document === "undefined") return;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, loginOpen]);

  /* ----- card click toast ----- */
  const handleCardClick = (title: string) => {
    showToast(`Navigating to ${title}...`);
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  const handleTalkSales = () => {
    showToast(
      "Opening sales conversation — a representative will be with you shortly",
    );
  };

  const handleForgotPw = () => {
    closeLogin();
    showToast("Password reset link sent to your email");
  };

  const handleSignup = () => {
    closeLogin();
    if (typeof window !== "undefined") {
      const newUrl = window.location.pathname + "#/signup";
      window.history.pushState({}, "", newUrl);
    }
    showToast("Redirecting to sign up page...");
  };

  /* ----- render ----- */
  return (
    <div className={styles.root}>
      {/* Toast */}
      <div
        className={[styles.toast, toast.show ? styles.toastShow : ""]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
      >
        <CircleCheck size={16} color="#38c27a" />
        <span className={styles.toastMsg}>{toast.msg}</span>
      </div>

      <FxTicker />

      {/* Sticky header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <a href="#" className={styles.logo} aria-label="Paymo BaaS Home">
            <span className={styles.logoMark}>
              <Zap size={15} color="#ffffff" fill="#ffffff" />
            </span>
            <span>
              <span className={`${styles.fontDisplay} ${styles.logoTextPrimary}`}>
                Paymo
              </span>
              <span
                className={`${styles.fontDisplay} ${styles.logoTextSecondary}`}
              >
                BaaS PLATFORM
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav
            className={styles.desktopNav}
            aria-label="Main navigation"
            onMouseLeave={closeDropdown}
          >
            {MENU_SECTIONS.map((section) => {
              const isOpen = activeDropdown === section.id;
              return (
                <div
                  className={styles.navItem}
                  key={section.id}
                  onMouseEnter={() => openDropdown(section.id)}
                  onMouseLeave={closeDropdown}
                >
                  <button
                    type="button"
                    ref={(el) => {
                      navItemRefs.current[section.id] = el;
                    }}
                    className={[
                      styles.navLink,
                      isOpen ? styles.navLinkOpen : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={(e) => handleTriggerClick(e, section.id)}
                    onKeyDown={(e) => handleTriggerKeyDown(e, section.id)}
                  >
                    {section.label}
                    <ChevronDown
                      size={10}
                      className={[styles.chevron, isOpen ? styles.chevronOpen : ""]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </button>
                  <DropdownPanel
                    section={section}
                    isOpen={isOpen}
                    onCardClick={handleCardClick}
                  />
                </div>
              );
            })}
            <a href="#pricing" className={styles.navLink}>
              Pricing
            </a>
          </nav>

          {/* Desktop actions */}
          <div className={styles.desktopActions}>
            <div className={styles.searchBox}>
              <Search size={13} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                aria-label="Search"
                className={styles.searchInput}
              />
              <kbd className={styles.searchKbd}>/</kbd>
            </div>
            <div className={styles.dividerV} />
            <button
              type="button"
              className={styles.btnText}
              aria-label="Sign in"
              onClick={openLogin}
            >
              <LogIn size={13} color="#6dda9f" />
              Sign In
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleTalkSales}
            >
              <MessageSquare size={12} />
              Talk to Sales
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={styles.mobileToggle}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={openMobile}
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={[
          styles.mobileOverlay,
          mobileOpen ? styles.mobileOverlayActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
      />

      {/* Mobile drawer */}
      <aside
        className={[
          styles.mobileDrawer,
          mobileOpen ? styles.mobileDrawerActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className={styles.mobileDrawerHeader}>
          <a href="#" className={styles.logo}>
            <span
              className={styles.logoMark}
              style={{ width: 30, height: 30, borderRadius: 7 }}
            >
              <Zap size={13} color="#ffffff" fill="#ffffff" />
            </span>
            <span
              className={`${styles.fontDisplay}`}
              style={{ fontWeight: 700, fontSize: 15, color: "#ffffff" }}
            >
              Paymo
            </span>
          </a>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            aria-label="Close menu"
            onClick={closeMobile}
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.mobileSearchWrap}>
          <div className={styles.searchBox}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.mobileNavList}>
          {MENU_SECTIONS.map((section) => {
            const isOpen = openSubmenu === section.id;
            return (
              <div key={section.id}>
                <button
                  type="button"
                  className={[
                    styles.mobileNavItem,
                    isOpen ? styles.mobileNavItemOpen : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleSubmenu(section.id)}
                  aria-expanded={isOpen}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    size={11}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  />
                </button>
                <div
                  className={[
                    styles.mobileSubmenu,
                    isOpen ? styles.mobileSubmenuOpen : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {section.cards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        type="button"
                        key={card.title}
                        className={styles.mobileCard}
                        onClick={() => handleCardClick(card.title)}
                      >
                        <IconBox
                          icon={Icon}
                          color={card.color}
                          size={13}
                          className={styles.mobileCardIcon}
                        />
                        <span>
                          <span className={styles.cardTitle}>{card.title}</span>
                          <span className={styles.cardDesc}>{card.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <a
            href="#pricing"
            className={styles.mobileNavItem}
            style={{ borderBottom: "none" }}
          >
            <span>Pricing</span>
          </a>
        </div>

        <div className={styles.mobileFooter}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={openLogin}
          >
            <LogIn size={13} color="#6dda9f" />
            Sign In
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              closeMobile();
              handleTalkSales();
            }}
          >
            <MessageSquare size={12} />
            Talk to Sales
          </button>
        </div>
      </aside>

      {/* Login modal */}
      <div
        className={[
          styles.loginOverlay,
          loginOpen ? styles.loginOverlayActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-label="Sign in"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLogin();
        }}
      >
        <div className={styles.loginModal}>
          <div className={styles.loginHeader}>
            <div>
              <h2
                className={`${styles.fontDisplay} ${styles.loginTitle}`}
              >
                Welcome back
              </h2>
              <p className={styles.loginSubtitle}>
                Sign in to your Paymo account
              </p>
            </div>
            <button
              type="button"
              className={styles.loginCloseBtn}
              aria-label="Close sign in"
              onClick={closeLogin}
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate>
            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor={`${loginAriaId}-email`}>
                Email Address
              </label>
              <div className={styles.loginInputWrap}>
                <Mail size={13} className={styles.loginInputIcon} />
                <input
                  ref={emailInputRef}
                  id={`${loginAriaId}-email`}
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className={styles.loginInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError ? (
                <p
                  className={[
                    styles.fieldError,
                    styles.fieldErrorVisible,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className={styles.loginField} style={{ marginBottom: 20 }}>
              <label
                className={styles.loginLabel}
                htmlFor={`${loginAriaId}-password`}
              >
                Password
              </label>
              <div className={styles.loginInputWrap}>
                <Lock size={13} className={styles.loginInputIcon} />
                <input
                  id={`${loginAriaId}-password`}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className={styles.loginInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.loginPasswordToggle}
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {passwordError ? (
                <p
                  className={[
                    styles.fieldError,
                    styles.fieldErrorVisible,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className={styles.loginRow}>
              <label className={styles.loginRemember}>
                <input type="checkbox" />
                Remember me
              </label>
              <button
                type="button"
                className={styles.loginForgot}
                onClick={handleForgotPw}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`${styles.btnPrimary} ${styles.loginSubmit}`}
            >
              Sign In
            </button>
          </form>

          <div className={styles.loginFooter}>
            <span className={styles.loginFooterText}>
              Don&apos;t have an account?
            </span>
            <button
              type="button"
              className={styles.loginFooterLink}
              onClick={handleSignup}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
