// ═══════════════════════════════════════════════════════════════════
//  WEBNARI INDUSTRY BENCHMARKS DATABASE
//  Sources: ChatGPT Deep Research (March 2026) cross-referenced with
//  Angi, BrightLocal, First Page Sage, WordStream, Zenoti, Olo,
//  PartsTech, Clio, ADA, NRA, CallRail, Littledata
// ═══════════════════════════════════════════════════════════════════

const INDUSTRY_DATA = {

  // ── HOME SERVICES ─────────────────────────────────────
  'pest-control': {
    label: 'Pest Control',
    category: 'home-construction',
    revPerCustomer: 171,       // Angi avg: $171/visit, range $108-$261
    newCustomersPerMonth: 6,   // Modeled: BrightLocal traffic × FPS conversion
    clv: 1000,                 // ~$1K (recurring quarterly plan)
    clvRange: [700, 1600],
    avgJobRange: [108, 261],
    conversionRate: 3.5,       // First Page Sage pest control benchmark
    inputLabel: 'Avg. Service Visit',
    sources: ['Angi cost guides', 'First Page Sage conversion rates', 'BrightLocal traffic study']
  },

  'electrician': {
    label: 'Electrician',
    category: 'home-construction',
    revPerCustomer: 350,       // Angi avg: $350/job, range $163-$538
    newCustomersPerMonth: 5,   // Modeled median
    clv: 420,                  // Low repeat rate
    clvRange: [250, 700],
    avgJobRange: [163, 538],
    conversionRate: 3.0,
    inputLabel: 'Avg. Job Value',
    sources: ['Angi cost guides', 'BrightLocal traffic study']
  },

  'plumber': {
    label: 'Plumber',
    category: 'home-construction',
    revPerCustomer: 339,       // Angi avg: $339/job, range $181-$497
    newCustomersPerMonth: 8,   // Higher urgency = higher conversion
    clv: 680,                  // Moderate repeat
    clvRange: [400, 1200],
    avgJobRange: [181, 497],
    conversionRate: 4.0,
    inputLabel: 'Avg. Job Value',
    sources: ['Angi cost guides', 'BrightLocal traffic study']
  },

  'hvac': {
    label: 'HVAC',
    category: 'home-construction',
    revPerCustomer: 350,       // Angi avg repair: $350, range $130-$2000
    newCustomersPerMonth: 5,   // FPS HVAC lead conversion
    clv: 3600,                 // High CLV: maintenance + repair + replacement
    clvRange: [2500, 6000],
    avgJobRange: [130, 2000],
    conversionRate: 3.2,
    inputLabel: 'Avg. Repair Ticket',
    sources: ['Angi cost guides', 'HVAC gross margin targets']
  },

  'locksmith': {
    label: 'Locksmith',
    category: 'home-construction',
    revPerCustomer: 175,       // Angi avg: $175/service, range $107-$242
    newCustomersPerMonth: 10,  // High urgency intent
    clv: 160,                  // Very low repeat
    clvRange: [90, 300],
    avgJobRange: [107, 242],
    conversionRate: 5.0,       // Urgent intent = higher conversion
    inputLabel: 'Avg. Service Call',
    sources: ['Angi cost guides']
  },

  'roofing': {
    label: 'Roofing',
    category: 'home-construction',
    revPerCustomer: 9535,      // Angi avg replacement: $9,535, range $5,871-$13,228
    newCustomersPerMonth: 1,   // High-consideration, long sales cycle
    clv: 3500,                 // Low repeat, long replacement cycle
    clvRange: [2500, 6000],
    avgJobRange: [5871, 13228],
    conversionRate: 1.5,
    inputLabel: 'Avg. Replacement Job',
    sources: ['Angi cost guides']
  },

  // ── LANDSCAPING ───────────────────────────────────────
  'landscaping': {
    label: 'Landscaping',
    category: 'landscaping',
    revPerCustomer: 300,       // $300/mo maintenance avg, range $100-$500
    newCustomersPerMonth: 3,   // Seasonal, moderate volume
    clv: 3300,                 // Strong recurring: seasonal + upsells
    clvRange: [2000, 5000],
    avgJobRange: [100, 500],
    conversionRate: 2.5,
    inputLabel: 'Avg. Monthly Contract',
    sources: ['Angi cost guides', 'Labor share guidance']
  },

  // ── FOOD & DINING ─────────────────────────────────────
  'restaurant': {
    label: 'Restaurant / Dining',
    category: 'food-dining',
    revPerCustomer: 25,        // Olo: $24.51 online order AOV
    newCustomersPerMonth: 26,  // Higher traffic + food/bev conversion rate
    clv: 63,                   // Orders/year from Olo × gross margin
    clvRange: [30, 120],
    avgJobRange: [15, 45],
    conversionRate: 7.0,       // WordStream food & beverage benchmark
    inputLabel: 'Avg. Check Size',
    sources: ['Olo network data', 'WordStream conversion benchmarks', 'Damodaran margin data']
  },

  'sub-shop': {
    label: 'Sub / Sandwich Shop',
    category: 'food-dining',
    revPerCustomer: 14,        // Typical sub shop check
    newCustomersPerMonth: 40,  // High volume, lower ticket
    clv: 45,
    clvRange: [25, 80],
    avgJobRange: [10, 20],
    conversionRate: 7.0,
    inputLabel: 'Avg. Check Size',
    sources: ['Restaurant industry benchmarks']
  },

  'sushi': {
    label: 'Sushi / Japanese',
    category: 'food-dining',
    revPerCustomer: 55,        // Premium dining AOV
    newCustomersPerMonth: 15,
    clv: 180,
    clvRange: [80, 350],
    avgJobRange: [35, 85],
    conversionRate: 6.0,
    inputLabel: 'Avg. Check Size',
    sources: ['Restaurant industry benchmarks']
  },

  'pizza': {
    label: 'Pizza / Italian',
    category: 'food-dining',
    revPerCustomer: 28,
    newCustomersPerMonth: 35,
    clv: 95,
    clvRange: [50, 160],
    avgJobRange: [18, 40],
    conversionRate: 7.5,
    inputLabel: 'Avg. Order Value',
    sources: ['Restaurant industry benchmarks']
  },

  // ── HEALTH & WELLNESS ─────────────────────────────────
  'dentist': {
    label: 'Dentist',
    category: 'health-wellness',
    revPerCustomer: 571,       // ADA: ~$571/active patient-year, range $523-$628
    newCustomersPerMonth: 9,   // Healthcare lead conversion benchmark
    clv: 1100,                 // Overhead 60-65% → ~35-40% contribution
    clvRange: [800, 1600],
    avgJobRange: [523, 628],
    conversionRate: 4.5,
    inputLabel: 'Avg. Patient Value/Year',
    sources: ['American Dental Association', 'Healthcare conversion benchmarks']
  },

  'medspa': {
    label: 'Med Spa',
    category: 'health-wellness',
    revPerCustomer: 527,       // Zenoti: $527/visit
    newCustomersPerMonth: 14,  // Higher-traffic elective service
    clv: 1600,                 // Repeat patient share + visit frequency
    clvRange: [900, 3000],
    avgJobRange: [200, 900],
    conversionRate: 5.0,
    inputLabel: 'Avg. Treatment Value',
    sources: ['Zenoti network data', 'American Med Spa Association']
  },

  'chiropractor': {
    label: 'Chiropractor',
    category: 'health-wellness',
    revPerCustomer: 65,        // Per visit
    newCustomersPerMonth: 12,
    clv: 780,                  // High frequency visits
    clvRange: [400, 1200],
    avgJobRange: [45, 100],
    conversionRate: 4.0,
    inputLabel: 'Avg. Visit Value',
    sources: ['Healthcare benchmarks']
  },

  // ── FITNESS ───────────────────────────────────────────
  'gym': {
    label: 'Gym / Fitness',
    category: 'fitness',
    revPerCustomer: 65,        // Health & Fitness Association: $65/member-month
    newCustomersPerMonth: 6,   // BrightLocal traffic × conversion
    clv: 549,                  // EBITDA-level CLV with retention
    clvRange: [300, 900],
    avgJobRange: [30, 100],
    conversionRate: 3.5,
    inputLabel: 'Avg. Monthly Membership',
    sources: ['Health & Fitness Association', 'BrightLocal traffic study']
  },

  // ── AUTOMOTIVE ────────────────────────────────────────
  'auto-repair': {
    label: 'Auto Repair',
    category: 'automotive',
    revPerCustomer: 600,       // PartsTech: ~$600 ARO, common bands $250-$749
    newCustomersPerMonth: 5,
    clv: 1800,                 // Moderate repeat + parts gross profit
    clvRange: [1000, 3000],
    avgJobRange: [250, 749],
    conversionRate: 3.0,
    inputLabel: 'Avg. Repair Order',
    sources: ['PartsTech ARO data']
  },

  // ── LEGAL ─────────────────────────────────────────────
  'law-firm': {
    label: 'Law Firm',
    category: 'legal',
    revPerCustomer: 7000,      // Clio: $7,000/matter median, range $2K-$15K
    newCustomersPerMonth: 3,   // Legal services lead conversion benchmark
    clv: 3400,                 // Low repeat, high margin variance
    clvRange: [1500, 8000],
    avgJobRange: [2000, 15000],
    conversionRate: 2.0,
    inputLabel: 'Avg. Matter Value',
    sources: ['Clio hourly rate benchmarks', 'Legal conversion benchmarks']
  },

  // ── BEAUTY ────────────────────────────────────────────
  'salon': {
    label: 'Salon / Beauty',
    category: 'beauty-personal',
    revPerCustomer: 69,        // Zenoti: $69 avg tier, $74-$85 higher tiers
    newCustomersPerMonth: 14,  // Booking-driven, higher volume
    clv: 600,                  // Visit frequency + retention
    clvRange: [400, 1000],
    avgJobRange: [40, 120],
    conversionRate: 4.5,
    inputLabel: 'Avg. Service Value',
    sources: ['Zenoti network data']
  },

  // ── RETAIL ────────────────────────────────────────────
  'boutique': {
    label: 'Boutique Retail',
    category: 'retail-ecommerce',
    revPerCustomer: 60,        // Card ticket baseline ~$51.27 + specialty markup
    newCustomersPerMonth: 10,  // High variance with ecommerce
    clv: 127,                  // Gross margin for specialty retail
    clvRange: [70, 250],
    avgJobRange: [30, 120],
    conversionRate: 2.5,
    inputLabel: 'Avg. Transaction',
    sources: ['Retail card-ticket baselines']
  },

  // ── E-COMMERCE ────────────────────────────────────────
  'ecommerce': {
    label: 'E-Commerce Store',
    category: 'retail-ecommerce',
    revPerCustomer: 101,       // All ecommerce AOV $101; Shopify $85
    newCustomersPerMonth: 49,  // Shopify conversion 1.4% + traffic
    clv: 114,                  // Repeat order scenario + gross margin
    clvRange: [60, 250],
    avgJobRange: [54, 274],    // Bottom 20% to top 20%
    conversionRate: 1.4,       // Littledata Shopify benchmark
    inputLabel: 'Avg. Order Value',
    sources: ['Littledata Shopify benchmarks', 'Shopify AOV data']
  },

  // ── CLEANING ──────────────────────────────────────────
  'cleaning': {
    label: 'Cleaning Services',
    category: 'cleaning-services',
    revPerCustomer: 180,
    newCustomersPerMonth: 8,
    clv: 2160,                 // High recurring (monthly/bi-weekly)
    clvRange: [1200, 3600],
    avgJobRange: [100, 300],
    conversionRate: 3.5,
    inputLabel: 'Avg. Service Visit',
    sources: ['Home services benchmarks']
  },

  // ── PET SERVICES ──────────────────────────────────────
  'pet-services': {
    label: 'Pet Services',
    category: 'pet-services',
    revPerCustomer: 55,
    newCustomersPerMonth: 12,
    clv: 660,                  // Recurring grooming/boarding
    clvRange: [300, 1000],
    avgJobRange: [30, 100],
    conversionRate: 3.5,
    inputLabel: 'Avg. Visit Value',
    sources: ['Pet industry benchmarks']
  },

  // ── REAL ESTATE ───────────────────────────────────────
  'real-estate': {
    label: 'Real Estate',
    category: 'real-estate',
    revPerCustomer: 8500,      // Avg commission on median home
    newCustomersPerMonth: 2,
    clv: 12000,                // Referrals + repeat transactions
    clvRange: [5000, 25000],
    avgJobRange: [4000, 15000],
    conversionRate: 1.0,
    inputLabel: 'Avg. Commission',
    sources: ['NAR transaction data']
  }
};

// ═══════════════════════════════════════════════════════════════════
//  HELPER: Get industry data by niche category or specific type
// ═══════════════════════════════════════════════════════════════════
function getIndustryData(niche) {
  // Direct match
  if (INDUSTRY_DATA[niche]) return INDUSTRY_DATA[niche];

  // Category match — find first in that category
  const byCategory = Object.values(INDUSTRY_DATA).find(d => d.category === niche);
  if (byCategory) return byCategory;

  // Default fallback
  return {
    label: 'Service Business',
    category: 'general',
    revPerCustomer: 250,
    newCustomersPerMonth: 8,
    clv: 500,
    clvRange: [200, 1000],
    avgJobRange: [100, 500],
    conversionRate: 3.0,
    inputLabel: 'Avg. Revenue Per Customer',
    sources: ['Industry averages']
  };
}

// ═══════════════════════════════════════════════════════════════════
//  TRAFFIC & CONVERSION BENCHMARKS
// ═══════════════════════════════════════════════════════════════════
const TRAFFIC_BENCHMARKS = {
  // BrightLocal study of 11,000+ local business websites
  avgMonthlySessionsLocal: 506,
  medianMonthlySessionsLocal: 414,    // 55% get < 500
  topPerformerSessions: 2000,         // Top 10%

  // WordStream 2025 Google Ads conversion rates by category
  paidSearchConversion: {
    'home-improvement': 7.0,
    'food-restaurant': 7.2,
    'dental': 9.8,
    'physicians': 11.6,
    'legal': 4.3,
    'automotive': 5.6,
    'beauty': 6.1,
    'fitness': 5.5,
    'real-estate': 3.2,
    'ecommerce': 1.4,
    'average': 6.6
  },

  // CallRail missed-call rates (operational leakage)
  missedCallRates: {
    'healthcare': 32,
    'home-services': 14,
    'legal': 24,
    'automotive': 18,
    'average': 20
  }
};

// Export for use in other files (if loaded as module)
if (typeof module !== 'undefined') {
  module.exports = { INDUSTRY_DATA, getIndustryData, TRAFFIC_BENCHMARKS };
}
