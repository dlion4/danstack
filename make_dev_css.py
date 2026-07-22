#!/usr/bin/env python3
"""Transform the uploaded standalone dev shell CSS into a scoped CSS module."""
import re, sys, pathlib

src = pathlib.Path("/home/user/uploads/dashboard-dev-main.css").read_text()

# 1) Scope the design tokens: :root  ->  .devRoot
assert src.count(":root {") == 1, "expected exactly one :root block"
src = src.replace(":root {", ".devRoot {", 1)

# 2) Extract the .devRoot token block (no nested braces), drop the global
#    element/universal/scrollbar rules that follow it, and replace the
#    .app-shell layout block with a position:relative root (cards-style).
tok_start = src.index(".devRoot {")
tok_end = src.index("\n}", tok_start) + 2          # include the closing brace
token_block = src[:tok_end]
rest = src[tok_end:]

app_idx = rest.index(".app-shell {")
app_end = rest.index("\n}", app_idx) + 2            # drop the .app-shell block too
after_app = rest[app_end:]

root_layout = (
    "\n.devRoot {\n"
    "  position: relative;\n"
    "  min-height: 100vh;\n"
    "  overflow-x: clip;\n"
    "  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n"
    "  background: var(--bg);\n"
    "  color: var(--text);\n"
    "  -webkit-font-smoothing: antialiased;\n"
    "  -moz-osx-font-smoothing: grayscale;\n"
    "  /* tokens required by the shared shell/dashboard.module.css home visuals */\n"
    "  --sh-ink-0: #1d1a2e;\n"
    "  --sh-ink-1: #1d1a2e;\n"
    "  --sh-ink-2: #5a5668;\n"
    "  --sh-ink-3: #8b8796;\n"
    "  --sh-accent: #10b981;\n"
    "  --sh-accent-2: #3b82f6;\n"
    "  --sh-warning: #f59e0b;\n"
    "  --sh-glass-bg: rgba(255, 255, 255, 0.04);\n"
    "  --sh-glass-border: rgba(255, 255, 255, 0.08);\n"
    "}\n"
)

out = token_block + root_layout + after_app

# 3) Append shared button/badge helpers (re-themed to dev tokens) + pulse anim.
out += """
/* ===== shared helpers reused by DevHome / DevModulePage / dropdowns ===== */
.btnPrimary { font-weight: 600; border-radius: var(--radius-sm); padding: 0.7rem 1.3rem; transition: all 0.25s ease; letter-spacing: -0.01em; border: none; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, var(--paymo-primary), var(--paymo-primary-600)); color: #fff; box-shadow: 0 6px 18px rgba(91, 77, 219, 0.25); cursor: pointer; }
.btnPrimary:hover { filter: brightness(1.05); transform: translateY(-1px); }
.btnGhost { font-weight: 600; border-radius: var(--radius-sm); padding: 0.7rem 1.3rem; transition: all 0.25s ease; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer; }
.btnGhost:hover { background: #fff; border-color: var(--paymo-primary-light); color: var(--paymo-primary); }
.btnLink { background: none; border: 0; color: var(--text-secondary); cursor: pointer; padding: 0; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; transition: color var(--transition-fast); }
.btnLink:hover { color: var(--paymo-primary); }
.btnLinkPrimary { color: var(--paymo-primary); font-weight: 600; }
.btnDanger { font-weight: 600; border-radius: var(--radius-sm); padding: 0.7rem 1.3rem; transition: all 0.25s ease; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: transparent; color: var(--paymo-danger); border: 1px solid rgba(239, 68, 68, 0.45); cursor: pointer; }
.btnDanger:hover { background: rgba(239, 68, 68, 0.08); }
.textGradient { background: linear-gradient(135deg, var(--paymo-accent), var(--paymo-info)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.badgeMini { font-size: 0.68rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 999px; background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--border); white-space: nowrap; }
.badgeSoft { background: rgba(91, 77, 219, 0.08); color: var(--paymo-primary); border-color: rgba(91, 77, 219, 0.18); }
.menuItem { display: flex; align-items: center; gap: 0.7rem; width: 100%; border: 0; background: transparent; color: var(--text); text-align: left; padding: 0.6rem 1rem; font-size: 0.88rem; cursor: pointer; transition: background var(--transition-fast), color var(--transition-fast); }
.menuItem:hover { background: var(--surface-2); color: var(--paymo-primary); }
.pulseDot { animation: pulseDot 1.5s ease-in-out infinite; }
@keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
"""

# sanity: real top-level global element rules must be gone (line-anchored so we
# don't false-match things like `.panel-body {`).
for pat in [r'(?m)^\s*\*\s*\{', r'(?m)^\s*body\s*\{', r'(?m)^html', r'(?m)^\s*::-webkit-scrollbar']:
    assert not re.search(pat, out), f"global rule leaked: {pat!r}"
assert not re.search(r'(?m)^\.app-shell\s*\{', out), ".app-shell should have been replaced"

dest = pathlib.Path("/home/user/danstack/src/features/Layouts/dashboard-dev-layout/styles/devLayout.module.css")
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(out)
print("wrote", dest, len(out.splitlines()), "lines")
