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
| Electrician | **VoltPro** | `voltpro.html` | 12 subpages | Yellow `#FACC15` + dark navy | (305) 555-0101 |
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

## Scroll Parallax System (Hero Animations)

Each template gets a **scroll-driven SVG parallax animation** as its hero section. The user scrolls to "build" something related to the trade, then it transitions to the hero CTA.

### Architecture
- **CSS:** `.scroll-sequence` (500vh tall) with `.sequence-sticky` (100vh, position: sticky)
- **SVG:** Dynamically built with vanilla JS using `document.createElementNS`
- **Animation:** `requestAnimationFrame` loop reads scroll progress (0→1) and updates SVG element opacity, transforms, stroke-dashoffset, and path `d` attributes
- **Mobile:** Same parallax runs on all screen sizes — SVG scales via `svgH = min(vh * 0.82, 650)` and `svgW = svgH * (viewBoxW / viewBoxH)`
- **No libraries** — pure vanilla JS + CSS + SVG

### Animation Pattern (reuse for all templates)
```
0-6%    Intro (brand logo + subtitle + scroll hint)
6-12%   Main object appears (enclosure/unit/fixture fades in + scales)
12-60%  Progressive build phases (parts appear in realistic order)
60-70%  Detail/finishing touches
70-80%  Key action (switches flip / system turns on / water flows)
80-86%  Cover/completion (panel slides, unit closes)
86-98%  Dramatic finale (brand name + overpowered glow + warm lights)
98-100% Hero CTA transition (headline, description, buttons, stats)
```

### Key Techniques
- **Stroke-dashoffset drawing:** Set `strokeDasharray = totalLength`, animate `strokeDashoffset` from `totalLength` → `0` to "draw" wires/pipes
- **Path morphing:** Store two `d` paths (start/end), interpolate control points with scroll progress
- **Staggered reveals:** `startTime = baseTime + index * 0.004` for cascading element appearance
- **Easing:** `easeOut3 = t => 1 - Math.pow(1-t, 3)` and `easeIn3 = t => t*t*t`
- **Z-ordering:** Use `svg.insertBefore(el, referenceEl)` for behind-layer elements, `svg.appendChild(el)` for front layers
- **SVG masks:** `<mask>` with white=visible, black=cutout for dead front panels / covers with windows
- **Phase labels:** Bottom-center text that fades between phase names (e.g., "PULLING WIRE", "SETTING BREAKERS")
- **Power-on finale:** Overpowered glow with dual box-shadows (120px + 200px), background color blast to warm amber, brand name at scale(1.05)
- **OG image:** Generate 1200×630 branded preview with Python Pillow for link sharing

### VoltPro Parallax (voltpro.html) — Breaker Panel Build
**Theme:** An OCD-perfect breaker panel being assembled step by step
**Reference:** TikTok by @electric6536 — methodical European-style panel wiring
**SVG viewBox:** 0 0 480 750

**Build sequence:**
1. Panel enclosure + romex + terminal strips (top and bottom)
2. 5 trunk wire bundles drop simultaneously (31 wires total, blue + red)
3. Wires tighten into organized bundles + colored cable clips appear
4. Cable trunking channels (tan/beige, vertical sides + 6 horizontal)
5. DIN rails + horizontal wire bundles
6. 3 rows of MCB breakers snap on (8, 8, 6)
7. Pigtail U-loop connections above and below each row (thick 3.8px, 65px deep)
8. Top-entry breaker wires + copper bus bar combs
9. Red ferrules + circuit labels (C1-C22)
10. Green toggle indicators flip ON (on open panel — visible for long stretch)
11. Dead front plate slides down (SVG mask cutouts for breaker toggles)
12. "VOLTPRO" glow blast + warm room lights + hero transition

**SVG element layers (bottom to top):**
Bottom terminal strip → trunk wires → cable clips → horizontal bundles → cable trunking → DIN rails → breakers → U-loops → bus bars → top-entry wires → ferrules → labels → dead front cover → toggle flip overlays

### Parallax Ideas for Other Templates
- **AirPro (HVAC):** Build an AC unit — compressor, coils, fan blades spin up, refrigerant lines fill with blue coolant, thermostat drops temperature
- **FlowPro (Plumber):** Assemble copper pipe system — pipes connect, solder joints glow, water flows through, faucet turns on
- **PestPro (Pest Control):** Build a shield/barrier around a house — house outline, barrier segments lock in, pests bounce off
- **LockPro (Locksmith):** Lock mechanism assembly — pins, springs, cylinder, key inserts and turns
- **GreenPro (Landscaping):** Garden/landscape builds — soil layers, irrigation pipes, plants grow, flowers bloom
- **RoofPro (Roofer):** Roof construction — trusses, decking, underlayment, shingles lay row by row

## Git Workflow
```bash
cd "/Users/luisballen/Desktop/WaaS Dashboard"
git add <files>
git commit -m "message"
git push origin main   # auto-deploys to webnari.io
```
