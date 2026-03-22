# WaaS Dashboard — Project Memory

## What This Project Is
A **Website-as-a-Service (WaaS)** platform called **Webnari**. The agency landing page is `index.html` (live at `webnari.io`). Clients get professional multi-page website templates deployed to `webnari.io/<template>.html`.

## Deployment
- **Domain:** `webnari.io` (registered on Porkbun, nameservers pointed to Cloudflare)
- **Hosting:** Cloudflare Workers (`webnari` worker)
- **GitHub repo:** `https://github.com/coding1017/webnari`
- **Push to deploy:** `git push origin main` → Cloudflare auto-deploys via GitHub integration
- **Dashboard:** `webnari.io/dashboard.html`

## Templates Built

| Template | Brand | Main File | Subpages | Color Scheme | Phone |
|---|---|---|---|---|---|
| Electrician | **VoltPro** | `electrician.html` | 12 subpages | Yellow `#FACC15` + dark navy | (305) 555-0101 |
| HVAC | **AirPro** | `hvac.html` | 6 subpages | Ice blue `#38BDF8` + navy | (305) 555-0150 |
| Plumber | **FlowPro** | `FlowPro.html` | 6 subpages | Water blue `#0EA5E9` + deep navy | (786) 555-0200 |
| Pest Control | **PestPro** | `pestpro.html` | standalone | Green + dark | — |

### VoltPro Subpages (electrician)
`panel-upgrades.html`, `ev-charger.html`, `home-rewiring.html`, `smart-home.html`, `commercial.html`, `emergency-service.html`, `about.html`, `team.html`, `blog.html`, `reviews.html`, `privacy.html`, `contact.html`

### AirPro Subpages (hvac)
`ac-repair.html`, `ac-installation.html`, `heating.html`, `air-quality.html`, `commercial-hvac.html`, `emergency-hvac.html`

### FlowPro Subpages (plumber)
`drain-cleaning.html`, `water-heaters.html`, `leak-detection.html`, `repiping.html`, `bathroom-remodeling.html`, `emergency-plumbing.html`

## Templates Planned (not yet built)
- **LockPro** — Locksmith — purple/gold palette
- **GreenPro** — Landscaping — green palette
- **RoofPro** — Roofer — slate/red palette

## Design System Rules (apply to ALL templates)
- **Fonts:** Barlow Condensed (headings, 900 weight) + Barlow (body) — always from Google Fonts
- **No emojis anywhere** — inline SVG icons only throughout
- **Nav structure:** Logo → Services dropdown (6 items w/ SVG icons) → Company dropdown (6 items) → pulsing 24/7 live badge → "Call Now" CTA
- **Footer:** 4 columns — brand + license, services links, company links, contact w/ SVG icons
- **Animations:** Intersection Observer scroll reveals with staggered delays (`reveal`, `reveal-delay-1` etc.)
- **Mobile:** Hamburger nav with full mobile menu
- **Forms:** Client-side validation (blur + submit)
- **No external JS libraries** — vanilla JS only
- Logo always links to its own main template page (e.g. `FlowPro.html`, not `index.html`)

## AirPro Design Tokens (hvac.html reference)
```css
--black: #070711; --dark: #0D1A2E; --surface: #111827;
--border: #1E293B; --ice: #38BDF8; --ice2: #7DD3FC;
--cyan: #06B6D4; --white: #F0F9FF;
```

## FlowPro Design Tokens (FlowPro.html reference)
```css
--black: #06080F; --dark: #0A1020; --surface: #0F1A30;
--surface2: #162040; --border: #1E3050;
--blue: #0EA5E9; --blue2: #38BDF8; --blue3: #7DD3FC;
--cyan: #06B6D4; --white: #F0F8FF; --muted: #6080A0; --text: #B0C8E0;
```

## Licenses Used in Templates
- VoltPro: Electrical License `#EC13008450`
- AirPro: HVAC License `#CAC1818191`
- FlowPro: Plumbing License `#CFC1430009`

## Service Area (all templates — South Florida)
Miami, Coral Gables, Doral, Hialeah, Kendall, Miami Beach, Brickell, Westchester, South Miami, Homestead, Miami Gardens, North Miami

## Key Files
- `index.html` — Webnari agency landing page
- `dashboard.html` — Internal WaaS client dashboard
- `CLAUDE.md` — This file (project memory)

## Git Workflow
```bash
cd "/Users/luisballen/Desktop/WaaS Dashboard"
git add <files>
git commit -m "message"
git push origin main   # auto-deploys to webnari.io
```
