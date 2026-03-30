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
| Roofing | **RoofPro** | `roofpro.html` | standalone | Slate/Red `#E63946` + dark navy | (305) 555-0300 |
| E-commerce | **Wook Wear** | `wookwear.html` | 3 subpages | Gradient pink/purple/cyan + deep purple-black | — |
| Meal Prep | **Jade's Spice** | `jades-spice.html` | standalone | Warm red `#D94040` + gold `#F0A830` + dark brown | — |
| Cleaning | **PristineClean** | `pristineclean.html` | 6 subpages | Royal Blue `#2563EB` + Silver on light `#FAFBFD` / dark `#06080C` | (305) 555-0400 |
| Cleaning (Alt) | **Blanc Cleaning Co.** | `blanc.html` | standalone | Electric Blue `#3B82F6` + monochrome black `#08080A` / cream `#FAFAF9` | (305) 555-0500 |

### VoltPro Subpages (electrician)
`panel-upgrades.html`, `ev-charger.html`, `home-rewiring.html`, `smart-home.html`, `commercial.html`, `emergency-service.html`, `about.html`, `team.html`, `blog.html`, `reviews.html`, `privacy.html`, `contact.html`

### AirPro Subpages (hvac)
`ac-repair.html`, `ac-installation.html`, `heating.html`, `air-quality.html`, `commercial-hvac.html`, `emergency-hvac.html`

### FlowPro Subpages (plumber)
`drain-cleaning.html`, `water-heaters.html`, `leak-detection.html`, `repiping.html`, `bathroom-remodeling.html`, `emergency-plumbing.html`

### Wook Wear Subpages (e-commerce)
`wookwear-shop.html`, `wookwear-about.html`, `wookwear-contact.html`

### PristineClean Subpages (cleaning)
`commercial-cleaning.html`, `deep-cleaning.html`, `post-construction.html`, `industrial-cleaning.html`, `move-cleaning.html`, `maintenance-plans.html`

## Wook Wear Design Tokens (wookwear.html reference)
```css
--black: #0A0514; --dark: #120B20; --surface: #1A1030;
--surface2: #221840; --border: #3A2860;
--pink: #FF2D9B; --pink2: #FF6BBF;
--purple: #A855F7; --purple2: #C084FC;
--neon: #39FF14; --cyan: #00F0FF; --orange: #FF6B2B;
--yellow: #FACC15; --tiedye: #FF6B2B;
--white: #F8F0FF; --muted: #9A7ABB; --text: #D4C0E8;
--gradient: linear-gradient(135deg, #FF2D9B, #A855F7, #00F0FF);
--gradient-warm: linear-gradient(135deg, #FF6B2B, #FF2D9B, #A855F7);
--gradient-trippy: linear-gradient(135deg, #39FF14, #00F0FF, #A855F7, #FF2D9B);
--checker: repeating-conic-gradient(rgba(255,45,155,0.06) 0% 25%, transparent 0% 50%) 0 0 / 40px 40px;
```

## Wook Wear Notes
- **Brand:** Wook Wear by Meesh (@wook.wear on Instagram, 6.8k followers)
- **Products:** Handmade pouches, crossbody bags, display mats, buddy pouches
- **Aesthetic:** Psychedelic, maximalist, festival/wook culture, checkerboard patterns, tie-dye
- **E-commerce:** Full cart system using localStorage + vanilla JS. Stripe Payment Links for checkout (no backend).
- **Nav:** E-commerce style (Shop, About, Drops, Contact, cart icon) — NO service dropdowns or 24/7 badge
- **Sales model:** Drop-based (#wookwearwednesday), one-of-a-kind pieces
- **Existing domain:** wookwearshop.com (currently GoDaddy placeholder, can point to Webnari later)
- **Hero placeholder:** `.hero-placeholder` wrapper on wookwear.html ready for future parallax swap
- **Parallax concept (future):** Sewing machine stitching a pouch together, thread pulling, button eyes snapping on, psychedelic glow finale

## Blanc Cleaning Co. Design Tokens (blanc.html reference)
```css
--black: #08080A; --dark: #101012; --surface: #18181B;
--surface2: #1E1E22; --border: #27272A; --border2: #3F3F46;
--cream: #FAFAF9; --cream2: #E8E8E4; --muted: #71717A;
--text: #A1A1AA; --heading: #FAFAF9;
--blue: #3B82F6; --blue2: #60A5FA; --blue3: #93C5FD;
```

## Blanc Cleaning Co. Notes
- **Brand:** Blanc Cleaning Co. — premium residential/commercial cleaning, editorial aesthetic
- **Design:** April Ford-inspired bold monochrome. Does NOT follow standard Webnari design system (custom fonts, nav, layout). Only Webnari badge required.
- **Fonts:** DM Serif Display (headings, italic accents) + Inter (body) — NOT Barlow
- **Nav:** Minimal — serif logo left, centered text links (Services, Results, Process, Reviews, Contact), 24/7 badge + outlined "Get a Quote" CTA, hamburger on mobile with full-screen serif overlay
- **Hero:** Full-height dark, giant serif headline "Stop cleaning. / *Start living.*" (italic blue), asymmetric layout with description left + CTA right, 4-column stats bar at bottom
- **Sections:** Loader → Hero → Marquee → Services (3-col grid, numbered 01-06) → Results (3 big stats) → Process (4-step timeline) → Transformations (3 case studies) → Service Areas (4-col grid) → Reviews (3 cards) → FAQ (accordion) → Contact (split: info + form) → CTA Banner → Footer
- **Loader:** Serif "Blanc" + progress bar, sessionStorage-based (shows once per session)
- **Marquee:** Continuous horizontal scroll of service types with blue dot separators
- **Phone:** (305) 555-0500
- **License:** #CLN2025-0112
- **Form:** formsubmit.co, client-side validation (blur + submit)

## PristineClean Design Tokens (pristineclean.html reference)
```css
--bg: #FAFBFD; --bg2: #F1F3F8; --dark: #06080C; --dark2: #0C1018;
--surface: #FFFFFF; --border: #E2E6EF; --border2: #D0D6E2;
--blue: #2563EB; --blue2: #3B82F6; --blue3: #60A5FA;
--indigo: #4F46E5; --violet: #7C3AED;
--slate: #64748B; --slate2: #94A3B8;
--text: #334155; --text2: #475569; --heading: #0F172A; --white: #FFFFFF;
```

## PristineClean Notes
- **Brand:** PristineClean — enterprise-grade commercial/industrial cleaning
- **Design:** Modern agency-style (NOT the standard WaaS dark template). Uses Inter + Space Mono fonts, light/dark alternating sections, glassmorphism, bento grids, pill-shaped buttons, gradient accents (blue→violet)
- **Nav:** Frosted-glass light nav with gradient logo mark, pill-shaped CTA, green pulse dot for 24/7
- **Hero:** Dark section with grid background overlay, gradient text, bento stats cards (not standard hero split)
- **Sections:** Hero → Services (bento grid with featured card) → Why Us (dark, glassmorphic cards) → How It Works (numbered timeline) → Booking (date picker + time slots) → Service Areas → Reviews (dark) → FAQ (sticky sidebar layout) → Contact → CTA Banner → Footer
- **Booking:** Custom vanilla JS date/time picker with calendar widget, time slot pills, formsubmit.co
- **License:** #CLN2024-0088
- **Phone:** (305) 555-0400

## Jade's Spice Design Tokens (jades-spice.html reference)
```css
--black: #0C0806; --dark: #14100C; --surface: #1C1612;
--surface2: #261E18; --border: #342A22;
--red: #D94040; --red2: #E86565;
--gold: #F0A830; --gold2: #F5C563;
--green: #3DAA6D; --green2: #5BC88A;
--white: #FFF8F0; --muted: #8A7A6E; --text: #D4C4B4;
```

## Jade's Spice Notes
- **Brand:** Jade's Spice by Jade (@jades_spice on Instagram, personal @jadelalajade 27K followers)
- **Tagline:** "Beautiful moments on your lips"
- **Cuisine:** Chinese/Asian-inspired fusion, fitness-focused meal prep
- **Differentiators:** Custom macros for fitness goals, glass containers only (no plastic), organic ingredients, from-scratch cooking, authentic Chinese home cooking
- **Aesthetic:** Warm, food-inspired tones (reds, golds, greens on warm dark browns)
- **Nav:** Logo + tagline → Menu, Why Us, How It Works, About, Reviews → Instagram link → Order Now CTA (no 24/7 badge, no service dropdowns)
- **Sections:** Hero (with floating macro cards) → Featured Meals (with macro breakdowns) → Why Us (4 cards) → How It Works (3 steps) → Full Menu (filterable by category) → About Jade → Testimonials → Order CTA → Footer
- **Menu filter:** JS category filter (All, Chinese, Fusion, Healthy) toggles menu items
- **Order flow:** DM on Instagram (no e-commerce backend)

## Templates Planned (not yet built)
- **LockPro** — Locksmith — purple/gold palette
- **GreenPro** — Landscaping — green palette

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

## RoofPro Design Tokens (roofpro.html reference)
```css
--black: #0A0E12; --dark: #0E1219; --surface: #141A24;
--surface2: #1C2332; --border: #252E3E;
--red: #E63946; --red2: #F77F8A; --red3: #FFC2C7;
--slate: #64748B; --white: #F5F7FA; --muted: #6B7A8A; --text: #A8B8CA;
```

## Licenses Used in Templates
- VoltPro: Electrical License `#EC13008450`
- AirPro: HVAC License `#CAC1818191`
- FlowPro: Plumbing License `#CFC1430009`
- RoofPro: Roofing License `#CCC1560088`
- PristineClean: Cleaning License `#CLN2024-0088`

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

### RoofPro Parallax (roofpro.html) — Roof Cross-Section Build
**Theme:** A roof being built layer by layer from trusses to finished shingles
**SVG viewBox:** 0 0 1050 600

**Build sequence:**
1. House walls + gable outline (stroke-dashoffset drawing)
2. 9 triangular trusses snap into place one by one
3. Plywood decking boards laid across both slopes
4. Ice & water shield membrane (blue-tinted) rolls across bottom edge
5. Gray felt underlayment rolls across full deck surface
6. 14 rows of architectural shingles laid bottom to top (staggered offsets, slate gray variations)
7. Ridge cap pieces along the peak
8. Metal flashing at ridge, eave edges, chimney
9. L-profile gutters + downspouts + drip edge
10. Box vents, pipe boot, soffit details
11. "ROOFPRO" glow blast with red glow + hero transition

## Git Workflow
```bash
cd "/Users/luisballen/Desktop/WaaS Dashboard"
git add <files>
git commit -m "message"
git push origin main   # auto-deploys to webnari.io
```
