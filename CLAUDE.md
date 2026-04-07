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
| Auto Detailing | **Apex Detail** | `apexdetail.html` | standalone | Electric Blue `#2563EB` + gunmetal dark `#08090C` | (305) 555-0600 |
| Barbershop | **Fade & Co.** | `fadeco.html` | standalone | Gold `#C9A84C` + warm cream `#FAF8F4` / dark charcoal `#1A1614` | (305) 555-0650 |
| Locksmith | **LockPro** | `lockpro.html` | standalone | Purple `#7C3AED` + gold `#F59E0B` + dark | (305) 555-0700 |
| Landscaping | **GreenPro** | `greenpro.html` | standalone | Green `#22C55E` + earth brown `#A16207` + dark | (305) 555-0750 |
| Fitness/Gym | **FitPro** | `fitpro.html` | standalone | Orange `#F97316` + red `#EF4444` + dark | (305) 555-0800 |
| Pool Service | **PoolPro** | `poolpro.html` | standalone | Aqua/teal `#06B6D4` + dark navy | (305) 555-0850 |
| Moving | **MovePro** | `movepro.html` | standalone | Orange `#F97316` + warm dark brown `#0A0806` | (305) 555-0900 |
| Painting | **PaintPro** | `paintpro.html` | standalone | Teal `#14B8A6` + coral `#F97066` + violet `#8B5CF6` (multi-color) | (305) 555-0950 |
| Towing | **TowPro** | `towpro.html` | standalone | Red `#EF4444` + yellow `#FACC15` + warm dark | (305) 555-1000 |
| Pet Grooming | **Paws & Co.** | `petpro.html` | standalone | Peach/pink/coral light `#FFECD2` / `#FF6B6B` — LIGHT THEME | (305) 555-1050 |
| Day Spa | **Serenity Spa** | `spapro.html` | standalone | Lavender `#B8A9D4` + sage `#A8B8A0` on cream `#FAF9F7` — EDITORIAL LIGHT | (305) 555-1100 |
| Auto Repair | **IronWorks Auto** | `autopro.html` | standalone | Red `#DC2626` + pure black `#0C0C0C` — INDUSTRIAL BRUTALIST | (305) 555-1150 |

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

## Apex Detail Design Tokens (apexdetail.html reference)
```css
--black: #08090C; --dark: #0E1118; --surface: #141820;
--surface2: #1A2030; --border: #252D3D; --border2: #303C50;
--blue: #2563EB; --blue2: #3B82F6; --blue3: #60A5FA;
--silver: #94A3B8; --silver2: #CBD5E1;
--white: #F0F4FF; --muted: #64748B; --text: #94A3B8;
```

## Apex Detail Notes
- **Brand:** Apex Detail — premium mobile auto detailing, South Florida
- **Design:** Standard dark template. Barlow Condensed (headings, 900 weight) + Barlow (body). Electric blue accent on gunmetal dark.
- **Nav:** Logo → Services dropdown (6 items) → Company dropdown (6 items) → 24/7 Mobile Service badge → "Call Now" CTA
- **Hero:** Grid layout, left copy + right SVG car illustration, 4-stat row
- **Sections:** Hero → Services (6 cards) → Why Us (split: stats grid + features) → Process (4 steps) → Testimonials (3 cards) → FAQ (accordion) → Service Areas → Contact (split form) → CTA Banner → Footer
- **Services:** Exterior Detail, Interior Detail, Full Detail Package, Paint Correction, Ceramic Coating, Engine Bay Detail
- **Phone:** (305) 555-0600
- **License:** #AUT2024-0156
- **Note:** Fully mobile service — no physical location, emphasizes "we come to you"

## Fade & Co. Design Tokens (fadeco.html reference)
```css
--cream: #FAF8F4; --cream2: #F0EDE6; --dark: #1A1614; --dark2: #2A2422;
--surface: #FFFFFF; --border: #E5E0D8; --border2: #D5CEC4;
--gold: #C9A84C; --gold2: #E8C468; --gold3: #F5DFA0;
--charcoal: #2A2422; --text: #4A4240; --muted: #8A8280;
--white: #FFFFFF; --heading: #1A1614;
```

## Fade & Co. Notes
- **Brand:** Fade & Co. — premium barbershop, 242 Brickell Avenue, Miami FL 33131
- **Design:** Editorial light template (NOT standard dark Webnari design). Playfair Display (headings, serif with italic accents) + Inter (body). Warm cream backgrounds with charcoal dark sections and gold accents.
- **Nav:** Minimal — serif logo left, centered text links (Services, About, Reviews, Locations, Book), walk-ins badge + "BOOK NOW" dark/gold CTA
- **Hero:** Full-height split — dark left panel with giant serif headline + stats row, right panel with hours card + walk-in badge + address card
- **Sections:** Hero → Marquee → Services (6 cards in bordered grid with numbered labels + prices) → Why Us (big stat dark card + features list) → Process (dark bg, 4 steps) → Testimonials (3 cards) → FAQ (sticky sidebar layout) → Service Areas → Contact (info blocks + booking form) → CTA Banner → Footer
- **Marquee:** Continuous horizontal scroll of service types with gold dot separators
- **Services:** Classic Haircut ($35+), Fade & Taper ($40+), Beard Trim & Shape ($25+), Hot Towel Shave ($50+), Kids Cut ($25+), VIP Grooming Package ($100+)
- **Phone:** (305) 555-0650
- **License:** #BBR2024-0217
- **Hours:** Mon–Fri 9AM–8PM, Sat 8AM–7PM, Sun 9AM–5PM
- **Note:** Walk-ins welcome prominently featured; does not use Barlow fonts — uses Playfair Display + Inter

## New Template Notes (Batch 2 — April 2026)

### LockPro (lockpro.html)
- **Brand:** LockPro — emergency locksmith, standard dark Webnari design
- **Design:** Barlow Condensed + Barlow, purple/gold on dark. Standard nav/hero/services/why/process/testimonials/FAQ/areas/contact/CTA/footer
- **Phone:** (305) 555-0700 | **License:** #LCK2024-0312

### GreenPro (greenpro.html)
- **Brand:** GreenPro — landscaping, standard dark Webnari design
- **Design:** Barlow Condensed + Barlow, green/brown on dark. SVG hero: stylized tree with bushes and pathway
- **Phone:** (305) 555-0750 | **License:** #LND2024-0445

### FitPro (fitpro.html)
- **Brand:** FitPro — fitness/gym, standard dark Webnari design
- **Design:** Barlow Condensed + Barlow, orange/red on dark. SVG hero: dumbbell illustration
- **Phone:** (305) 555-0800 | **License:** #FIT2024-0189

### PoolPro (poolpro.html)
- **Brand:** PoolPro — pool service, standard dark Webnari design
- **Design:** Barlow Condensed + Barlow, aqua/teal on dark. SVG hero: swimming pool with ladder and waves
- **Phone:** (305) 555-0850 | **License:** #POL2024-0267

### MovePro (movepro.html)
- **Brand:** MovePro — moving company, standard dark Webnari design
- **Design:** Barlow Condensed + Barlow, orange on warm dark brown. SVG hero: moving truck with boxes and dolly
- **Phone:** (305) 555-0900 | **License:** FL Mover Reg. #IM3217

### PaintPro (paintpro.html)
- **Brand:** PaintPro — painting company, dark design with MULTI-COLOR accents
- **Design:** Barlow Condensed + Barlow. Teal primary, coral/violet/gold secondary. Service cards hover different colors. Process steps use alternating accent colors.
- **Phone:** (305) 555-0950 | **License:** #PNT2024-0334
- **SVG hero:** Paint roller with color swatches and drip effects

### TowPro (towpro.html)
- **Brand:** TowPro — 24/7 towing & roadside, dark urgent design
- **Design:** Barlow Condensed + Barlow, red/yellow on warm dark. Emergency strip banner below nav with animated pulsing badge. SVG hero: tow truck with animated flashing lights (CSS animation alternates red/yellow).
- **Phone:** (305) 555-1000 | **License:** #WR2024-0891
- **Unique:** Fixed emergency strip below nav, faster pulse animation for urgency

### Paws & Co. (petpro.html) — DIFFERENT DESIGN
- **Brand:** Paws & Co. — pet grooming, LIGHT playful design
- **Design:** Quicksand + Nunito fonts (NOT Barlow). Warm peach/pink/coral on cream white `#FFFBF7`. Floating pill-shaped nav centered on page. Full-screen mobile overlay.
- **Hero:** Peach-to-pink gradient with blurred organic blob shapes (lavender, mint, sky). Cute SVG dog face with crown. Pill-shaped buttons with box-shadow.
- **Sections:** Hero → Services (rounded cards with gradient circle icons + prices) → Why Us (horizontal feature cards) → Process (zigzag timeline with colored dots) → Reviews (avatar-initial cards) → FAQ → Areas → Contact (form in white card with shadow) → CTA → Footer
- **Phone:** (305) 555-1050 | Located in Coconut Grove

### Serenity Spa (spapro.html) — DIFFERENT DESIGN
- **Brand:** Serenity Spa — luxury day spa, EDITORIAL MINIMAL LIGHT design
- **Design:** Cormorant Garamond (serif headings, italic accents) + Jost (sans body). Cream/lavender/sage palette on off-white `#FAF9F7`. Transparent nav with underline-hover links. NO border-radius on most elements.
- **Hero:** Full-height centered text, no image. Serif headline with italic accent in lavender. Animated scroll hint line. Lots of whitespace.
- **Marquee:** Dark strip with serif service names and lavender dot separators
- **Services:** Numbered editorial list rows (not cards) with hover background, duration + price columns
- **About:** Full dark section with gradient visual placeholder and serif watermark text
- **Reviews:** Auto-rotating single-quote slider with large serif pullquote and navigation dots (6s interval)
- **FAQ:** Borderless accordion with serif headings, bottom-border-only style
- **Contact:** Underline-only form inputs (no boxes), labeled with uppercase micro text
- **Phone:** (305) 555-1100 | Located in Miami Beach

### IronWorks Auto (autopro.html) — DIFFERENT DESIGN
- **Brand:** IronWorks Auto — auto repair, INDUSTRIAL BRUTALIST DARK design
- **Design:** Oswald (headings) + Source Sans 3 (body). Red `#DC2626` + pure black `#0C0C0C`. NO border-radius anywhere — sharp edges throughout. Angled clip-path buttons. Thick red borders.
- **Hero:** Diagonal split background (black/red at 55% via CSS linear-gradient). Outline text effect (`-webkit-text-stroke`). Horizontal scan lines overlay. Red clip-path tag badge.
- **Nav:** Sticky (not fixed) with thick 3px red bottom border. Red top emergency bar.
- **Services:** Brutalist grid with 2px gap (border visible through gap). Large faded number watermarks via `data-num` attr + `::before`. Red underline on h3 via `::after`.
- **Why Us:** Split section — full red left panel, dark right panel with numbered items
- **Process:** Diamond-shaped dots (clip-path polygon) with connecting line
- **Reviews:** Grid cells with 2px gap brutalist layout
- **CTA:** Red section with giant watermark brand text behind content
- **Phone:** (305) 555-1150 | **License:** #MVR2024-1147 | Located in Hialeah

## Git Workflow
```bash
cd "/Users/luisballen/Desktop/WaaS Dashboard"
git add <files>
git commit -m "message"
git push origin main   # auto-deploys to webnari.io
```
