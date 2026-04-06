// ═══════════════════════════════════════════════════════════════
// Webnari Commerce API — Cloudflare Worker
// Multi-tenant e-commerce backend: checkout, payments, inventory,
// orders, shipping, tax — for all Webnari store templates.
//
// Routes:
//   POST /api/checkout/create         — Create checkout session
//   POST /api/checkout/webhook/stripe — Stripe webhook
//   POST /api/checkout/webhook/square — Square webhook
//   GET  /api/orders/:id              — Get order by ID
//   GET  /api/orders                  — List orders (by email or admin)
//   PATCH /api/orders/:id             — Update order (admin)
//   GET  /api/inventory/:productId    — Get stock levels
//   PATCH /api/inventory/:productId   — Update stock (admin)
//   GET  /api/inventory/low-stock     — Low stock items (admin)
//   POST /api/shipping/calculate      — Calculate shipping cost
//   POST /api/tax/calculate           — Calculate tax
//   GET  /api/store/config            — Public store config
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Strip /commerce prefix when accessed via custom domain route (webnari.io/commerce/*)
    const rawPath = url.pathname;
    const path = rawPath.startsWith('/commerce/') ? rawPath.slice('/commerce'.length) : rawPath;
    const method = request.method;

    // ── CORS ──────────────────────────────────────────────
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(corsOrigin),
      });
    }

    // ── Store ID from header ──────────────────────────────
    const storeId = request.headers.get('X-Store-ID');

    // Webhooks don't need X-Store-ID (store is in the payload metadata)
    const isWebhook = path.includes('/webhook/');

    // ── Supabase client helper ────────────────────────────
    const sb = supabase(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    try {
      // ── Route matching ────────────────────────────────────
      // Health check (no store ID required)
      if (path === '/api/health') {
        return json({ status: 'ok', service: 'webnari-commerce' }, 200, corsOrigin);
      }

      // Square OAuth callback — browser redirect from Square, no X-Store-ID
      if (method === 'GET' && path === '/api/admin/integrations/square/callback') {
        return await handleSquareOAuthCallback(request, sb, env, url, corsOrigin);
      }

      // QuickBooks OAuth callback — browser redirect from Intuit, no X-Store-ID
      if (method === 'GET' && path === '/api/admin/integrations/quickbooks/callback') {
        return await handleQuickBooksCallback(request, sb, env, null, url, corsOrigin);
      }

      // Stripe Connect OAuth callback — browser redirect from Stripe, no X-Store-ID
      if (method === 'GET' && path === '/api/admin/integrations/stripe/callback') {
        return await handleStripeConnectCallback(request, sb, env, url, corsOrigin);
      }

      // All other /api/ routes require X-Store-ID (except webhooks)
      if (!storeId && !isWebhook && path.startsWith('/api/')) {
        return json({ error: 'Missing X-Store-ID header' }, 400, corsOrigin);
      }

      // Store config
      if (method === 'GET' && path === '/api/store/config') {
        return await handleGetStoreConfig(sb, storeId, corsOrigin);
      }

      // Checkout
      if (method === 'POST' && path === '/api/checkout/create') {
        return await handleCreateCheckout(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/checkout/webhook/stripe') {
        return await handleStripeWebhook(request, sb, env, corsOrigin);
      }
      if (method === 'POST' && path === '/api/checkout/webhook/square') {
        return await handleSquareWebhook(request, sb, env, corsOrigin);
      }

      // Orders
      if (method === 'GET' && path.match(/^\/api\/orders\/[^/]+\/invoice$/)) {
        const orderId = path.split('/')[3];
        return await handleGetInvoice(request, sb, env, storeId, orderId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/orders\/[^/]+$/)) {
        const orderId = path.split('/').pop();
        return await handleGetOrder(request, sb, env, storeId, orderId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/orders') {
        return await handleListOrders(request, sb, env, storeId, url, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/orders\/[^/]+$/)) {
        const orderId = path.split('/').pop();
        return await handleUpdateOrder(request, sb, env, storeId, orderId, corsOrigin);
      }

      // Inventory
      if (method === 'GET' && path === '/api/inventory/low-stock') {
        return await handleLowStock(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/inventory\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handleGetInventory(sb, storeId, productId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/inventory\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handleUpdateInventory(request, sb, env, storeId, productId, corsOrigin);
      }

      // Shipping & Tax
      if (method === 'POST' && path === '/api/shipping/calculate') {
        return await handleCalculateShipping(request, sb, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/tax/calculate') {
        return await handleCalculateTax(request, sb, storeId, corsOrigin);
      }

      // ── Admin Routes ────────────────────────────────────
      // Dashboard stats
      if (method === 'GET' && path === '/api/admin/stats') {
        return await handleAdminStats(request, sb, env, storeId, corsOrigin);
      }

      // Admin Products
      if (method === 'GET' && path === '/api/admin/products') {
        return await handleAdminListProducts(request, sb, env, storeId, url, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/products') {
        return await handleAdminCreateProduct(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/products/export') {
        return await handleAdminExportProducts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/products/import') {
        return await handleAdminImportProducts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/admin\/products\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handleAdminGetProduct(request, sb, env, storeId, productId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/products\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handleAdminUpdateProduct(request, sb, env, storeId, productId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/products\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handleAdminDeleteProduct(request, sb, env, storeId, productId, corsOrigin);
      }

      // Admin Variants
      if (method === 'POST' && path === '/api/admin/variants') {
        return await handleAdminCreateVariant(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/variants\/[^/]+$/)) {
        const variantId = path.split('/').pop();
        return await handleAdminUpdateVariant(request, sb, env, storeId, variantId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/variants\/[^/]+$/)) {
        const variantId = path.split('/').pop();
        return await handleAdminDeleteVariant(request, sb, env, storeId, variantId, corsOrigin);
      }

      // Admin Reviews
      if (method === 'GET' && path === '/api/admin/reviews') {
        return await handleAdminListReviews(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/reviews\/[^/]+$/)) {
        const reviewId = path.split('/').pop();
        return await handleAdminUpdateReview(request, sb, env, storeId, reviewId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/reviews\/[^/]+$/)) {
        const reviewId = path.split('/').pop();
        return await handleAdminDeleteReview(request, sb, env, storeId, reviewId, corsOrigin);
      }

      // Admin Categories
      if (method === 'GET' && path === '/api/admin/categories') {
        return await handleAdminListCategories(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/categories') {
        return await handleAdminCreateCategory(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/categories\/[^/]+$/)) {
        const catId = path.split('/').pop();
        return await handleAdminUpdateCategory(request, sb, env, storeId, catId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/categories\/[^/]+$/)) {
        const catId = path.split('/').pop();
        return await handleAdminDeleteCategory(request, sb, env, storeId, catId, corsOrigin);
      }

      // Public categories (no admin required)
      if (method === 'GET' && path === '/api/categories') {
        const cats = await sb.query('categories', {
          filters: { store_id: `eq.${storeId}` },
          order: 'sort_order.asc,name.asc',
        });
        return json(cats, 200, corsOrigin);
      }

      // Admin Subscribers
      if (method === 'GET' && path === '/api/admin/subscribers') {
        return await handleAdminListSubscribers(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/subscribers/export') {
        return await handleAdminExportSubscribers(request, sb, env, storeId, corsOrigin);
      }

      // Admin Discounts
      if (method === 'GET' && path === '/api/admin/discounts') {
        return await handleAdminListDiscounts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/discounts') {
        return await handleAdminCreateDiscount(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/discounts\/[^/]+$/)) {
        const discountId = path.split('/').pop();
        return await handleAdminUpdateDiscount(request, sb, env, storeId, discountId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/discounts\/[^/]+$/)) {
        const discountId = path.split('/').pop();
        return await handleAdminDeleteDiscount(request, sb, env, storeId, discountId, corsOrigin);
      }

      // Admin Analytics
      if (method === 'GET' && path === '/api/admin/analytics') {
        return await handleAdminAnalytics(request, sb, env, storeId, url, corsOrigin);
      }

      // Admin Customers
      if (method === 'GET' && path === '/api/admin/customers') {
        return await handleAdminListCustomers(request, sb, env, storeId, corsOrigin);
      }

      // Admin Blog
      if (method === 'GET' && path === '/api/admin/blog') {
        return await handleAdminListBlog(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/blog') {
        return await handleAdminCreateBlog(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/blog\/[^/]+$/)) {
        const postId = path.split('/').pop();
        return await handleAdminUpdateBlog(request, sb, env, storeId, postId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/blog\/[^/]+$/)) {
        const postId = path.split('/').pop();
        return await handleAdminDeleteBlog(request, sb, env, storeId, postId, corsOrigin);
      }

      // Admin Gift Cards
      if (method === 'GET' && path === '/api/admin/gift-cards') {
        return await handleAdminListGiftCards(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/gift-cards') {
        return await handleAdminCreateGiftCard(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/gift-cards\/[^/]+$/)) {
        const cardId = path.split('/').pop();
        return await handleAdminUpdateGiftCard(request, sb, env, storeId, cardId, corsOrigin);
      }

      // Public blog (no admin required)
      if (method === 'GET' && path === '/api/blog') {
        const posts = await sb.query('blog_posts', {
          filters: { store_id: `eq.${storeId}`, published: 'eq.true' },
          order: 'created_at.desc',
        });
        return json(posts, 200, corsOrigin);
      }

      // Public gift card balance check
      if (method === 'GET' && path === '/api/gift-cards/check') {
        const code = url.searchParams.get('code');
        if (!code) return json({ error: 'Code is required' }, 400, corsOrigin);
        const card = await sb.query('gift_cards', {
          filters: { store_id: `eq.${storeId}`, code: `eq.${code}`, is_active: 'eq.true' },
          single: true,
        });
        if (!card) return json({ error: 'Gift card not found' }, 404, corsOrigin);
        return json({ balance: card.current_balance, code: card.code }, 200, corsOrigin);
      }

      // Admin Glossary
      if (method === 'GET' && path === '/api/admin/glossary') {
        return await handleAdminListGlossary(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/glossary') {
        return await handleAdminCreateGlossary(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/glossary\/[^/]+$/)) {
        const termId = path.split('/').pop();
        return await handleAdminUpdateGlossary(request, sb, env, storeId, termId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/glossary\/[^/]+$/)) {
        const termId = path.split('/').pop();
        return await handleAdminDeleteGlossary(request, sb, env, storeId, termId, corsOrigin);
      }

      // Public glossary (no admin required)
      if (method === 'GET' && path === '/api/glossary') {
        const terms = await sb.query('glossary_terms', {
          filters: { store_id: `eq.${storeId}`, is_published: 'eq.true' },
          order: 'sort_order.asc,term.asc',
        });
        return json(terms, 200, corsOrigin);
      }

      // ── Admin Integrations (Square + QuickBooks) ────────
      if (method === 'GET' && path === '/api/admin/integrations') {
        return await handleAdminListIntegrations(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/square/connect') {
        return await handleSquareOAuthConnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/square/disconnect') {
        return await handleSquareOAuthDisconnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/square/sync') {
        return await handleSquareManualSync(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/square/sync-images') {
        return await handleSquareSyncImages(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/integrations/square/locations') {
        return await handleSquareListLocations(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path === '/api/admin/integrations/square/location') {
        return await handleSquareSetLocation(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/integrations/mappings') {
        return await handleAdminListMappings(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/mappings') {
        return await handleAdminCreateMapping(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/mappings') {
        return await handleAdminDeleteAllMappings(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/integrations\/mappings\/[^/]+$/)) {
        const mappingId = path.split('/').pop();
        return await handleAdminDeleteMapping(request, sb, env, storeId, mappingId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/integrations/sync-log') {
        return await handleAdminSyncLog(request, sb, env, storeId, corsOrigin);
      }

      // Square OAuth callback (browser redirect — no admin auth, no X-Store-ID)
      // Must be BEFORE the storeId check since it comes from Square redirect

      // Square inventory webhook (no auth, verify signature)
      if (method === 'POST' && path === '/api/webhooks/square/inventory') {
        return await handleSquareInventoryWebhook(request, sb, env, corsOrigin);
      }

      // ── QuickBooks routes ─────────────────────────────
      // Note: QB callback is handled earlier (before X-Store-ID check) since it's a browser redirect
      if (method === 'POST' && path === '/api/admin/integrations/quickbooks/connect') {
        return await handleQuickBooksConnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/quickbooks/disconnect') {
        return await handleQuickBooksDisconnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/quickbooks/test') {
        return await handleQuickBooksTest(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/integrations/quickbooks/sync-log') {
        return await handleQuickBooksSyncLog(request, sb, env, storeId, corsOrigin);
      }

      // ── Stripe Connect routes ────────────────────────────
      // Note: Stripe callback is handled earlier (before X-Store-ID check) since it's a browser redirect
      if (method === 'POST' && path === '/api/admin/integrations/stripe/connect') {
        return await handleStripeConnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/stripe/disconnect') {
        return await handleStripeDisconnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/stripe/test') {
        return await handleStripeTest(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/stripe/sync') {
        return await handleStripeSyncProducts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/integrations/stripe/status') {
        return await handleStripeOnboardingStatus(request, sb, env, storeId, corsOrigin);
      }

      // Admin Store Settings
      if (method === 'PATCH' && path === '/api/admin/store') {
        return await handleAdminUpdateStore(request, sb, env, storeId, corsOrigin);
      }

      // Admin Tax Rates
      if (method === 'POST' && path === '/api/admin/tax-rates') {
        return await handleAdminUpsertTaxRate(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/tax-rates\/[^/]+$/)) {
        const rateId = path.split('/').pop();
        return await handleAdminDeleteTaxRate(request, sb, env, storeId, rateId, corsOrigin);
      }

      return json({ error: 'Not found' }, 404, corsOrigin);

    } catch (err) {
      console.error('Commerce API error:', err);
      return json({ error: 'Internal server error' }, 500, corsOrigin);
    }
  }
};


// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Store-ID, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// HMAC-signed invoice tokens — prevents unauthorized access to customer PII
async function generateInvoiceToken(orderId, email, secret) {
  const data = `invoice:${orderId}:${email}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyInvoiceToken(orderId, email, token, secret) {
  const expected = await generateInvoiceToken(orderId, email, secret);
  return expected === token;
}

function supabase(url, serviceKey) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  return {
    async query(table, { select = '*', filters = {}, order, limit, single } = {}) {
      const params = new URLSearchParams();
      params.set('select', select);
      for (const [key, val] of Object.entries(filters)) {
        params.set(key, val);
      }
      if (order) params.set('order', order);
      if (limit) params.set('limit', limit.toString());

      const res = await fetch(`${url}/rest/v1/${table}?${params}`, { headers });
      if (!res.ok) throw new Error(`Supabase ${table} query failed: ${res.status}`);
      const data = await res.json();
      return single ? data[0] || null : data;
    },

    async insert(table, rows) {
      const res = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase insert ${table} failed: ${res.status} ${err}`);
      }
      return await res.json();
    },

    async update(table, filters, data) {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(filters)) {
        params.set(key, val);
      }
      const res = await fetch(`${url}/rest/v1/${table}?${params}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase update ${table} failed: ${res.status} ${err}`);
      }
      return await res.json();
    },

    async rpc(fn, args = {}) {
      const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(args),
      });
      if (!res.ok) throw new Error(`Supabase RPC ${fn} failed: ${res.status}`);
      return await res.json();
    },

    async delete(table, filters) {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(filters)) {
        params.set(key, val);
      }
      const res = await fetch(`${url}/rest/v1/${table}?${params}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(`Supabase delete ${table} failed: ${res.status}`);
      return true;
    },
  };
}

// Get the secret for a specific store + provider
function getStoreSecret(env, storeId, key) {
  // Try store-specific first: STRIPE_SECRET_KEY_WOOKWEAR
  const storeKey = `${key}_${storeId.toUpperCase()}`;
  if (env[storeKey]) return env[storeKey];
  // Fallback to generic: STRIPE_SECRET_KEY
  if (env[key]) return env[key];
  return null;
}

/// Admin auth check — expects Authorization: Bearer <admin-key>
// Supports: master key (ADMIN_API_KEY) or per-store key (ADMIN_API_KEY_STOREID)
function requireAdmin(request, env, storeId) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);

  // Check master admin key (your Webnari admin access)
  if (env.ADMIN_API_KEY && token === env.ADMIN_API_KEY) return true;

  // Check per-store admin key (client-specific access)
  if (storeId) {
    const storeKey = env[`ADMIN_API_KEY_${storeId.toUpperCase().replace(/-/g, '_')}`];
    if (storeKey && token === storeKey) return true;
  }

  return false;
}


// ═══════════════════════════════════════════════════════════════
//  STORE CONFIG
// ═══════════════════════════════════════════════════════════════

async function handleGetStoreConfig(sb, storeId, corsOrigin) {
  const store = await sb.query('stores', {
    select: 'id,name,domain,currency,payment_provider,stripe_publishable_key,square_application_id,square_location_id,shipping_rules,settings',
    filters: { id: `eq.${storeId}` },
    single: true,
  });

  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  // Only expose public-safe fields
  return json({
    id: store.id,
    name: store.name,
    currency: store.currency,
    paymentProvider: store.payment_provider,
    stripePublishableKey: store.stripe_publishable_key,
    squareApplicationId: store.square_application_id,
    squareLocationId: store.square_location_id,
    shippingRules: store.shipping_rules,
    settings: store.settings,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  CHECKOUT — CREATE SESSION
// ═══════════════════════════════════════════════════════════════

async function handleCreateCheckout(request, sb, env, storeId, corsOrigin) {
  const body = await request.json();
  const { items, customer, shippingState, successUrl, cancelUrl, provider } = body;

  // items: [{ productId, variantId?, quantity }]
  // customer: { email, name, phone? }

  if (!items?.length) return json({ error: 'Cart is empty' }, 400, corsOrigin);
  if (!customer?.email) return json({ error: 'Customer email required' }, 400, corsOrigin);

  // ── 1. Load store config ────────────────────────────────
  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    single: true,
  });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  // ── 2. Clean up expired reservations ────────────────────
  await cleanupExpiredReservations(sb, storeId);

  // ── 3. Validate items + check inventory ─────────────────
  const lineItems = [];
  const reservations = [];
  let subtotal = 0;

  for (const item of items) {
    // Load product
    const product = await sb.query('products', {
      filters: { id: `eq.${item.productId}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!product) return json({ error: `Product not found: ${item.productId}` }, 400, corsOrigin);

    let price = product.price;
    let itemName = product.name;
    let variantName = null;
    let availableQty = product.stock_quantity;

    // Check variant if specified
    if (item.variantId) {
      const variant = await sb.query('variants', {
        filters: { id: `eq.${item.variantId}`, product_id: `eq.${item.productId}` },
        single: true,
      });
      if (!variant) return json({ error: `Variant not found: ${item.variantId}` }, 400, corsOrigin);
      if (variant.price) price = variant.price;
      variantName = variant.name;
      itemName = `${product.name} — ${variant.name}`;
      availableQty = variant.stock_quantity;
    }

    // Check stock (accounting for existing reservations)
    if (product.track_inventory) {
      const reserved = await getReservedQuantity(sb, storeId, item.productId, item.variantId);
      const effectiveQty = availableQty - reserved;
      if (effectiveQty < item.quantity) {
        return json({
          error: `Insufficient stock for "${itemName}". Available: ${effectiveQty}, requested: ${item.quantity}`,
        }, 400, corsOrigin);
      }
    }

    subtotal += price * item.quantity;

    lineItems.push({
      productId: item.productId,
      variantId: item.variantId || null,
      name: itemName,
      variantName,
      price,
      quantity: item.quantity,
      image: product.img || null,
    });

    reservations.push({
      product_id: item.productId,
      variant_id: item.variantId || null,
      quantity: item.quantity,
    });
  }

  // ── 4. Calculate shipping ───────────────────────────────
  const shippingCost = calculateShippingFromRules(store.shipping_rules, subtotal);

  // ── 5. Calculate tax ────────────────────────────────────
  let taxAmount = 0;
  if (shippingState) {
    const taxRate = await sb.query('store_tax_rates', {
      filters: { store_id: `eq.${storeId}`, state: `eq.${shippingState}` },
      single: true,
    });
    if (taxRate) {
      taxAmount = Math.round(subtotal * parseFloat(taxRate.rate));
    }
  }

  const total = subtotal + shippingCost + taxAmount;

  // ── 6. Determine payment provider ───────────────────────
  const paymentProvider = provider || store.payment_provider;

  if (paymentProvider === 'stripe' || paymentProvider === 'both') {
    return await createStripeCheckout(sb, env, storeId, store, {
      lineItems, customer, subtotal, shippingCost, taxAmount, total,
      shippingState, reservations, successUrl, cancelUrl,
    }, corsOrigin);
  }

  if (paymentProvider === 'square') {
    return await createSquareCheckout(sb, env, storeId, store, {
      lineItems, customer, subtotal, shippingCost, taxAmount, total,
      shippingState, reservations, successUrl, cancelUrl,
    }, corsOrigin);
  }

  return json({ error: `Unsupported payment provider: ${paymentProvider}` }, 400, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  STRIPE
// ═══════════════════════════════════════════════════════════════

async function createStripeCheckout(sb, env, storeId, store, data, corsOrigin) {
  // Check for Stripe Connect integration first, fall back to per-store secret
  let stripeKey = null;
  let stripeAccountHeader = {};
  let applicationFee = null;

  const connectIntegration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });

  if (connectIntegration?.merchant_id) {
    // Use platform key + connected account
    stripeKey = env.STRIPE_SECRET_KEY;
    stripeAccountHeader = { 'Stripe-Account': connectIntegration.merchant_id };
    // Platform fee: 3% of total (configurable in store settings)
    const feePercent = store.platform_fee_percent || 3;
    applicationFee = Math.round(data.total * feePercent / 100);
  } else {
    // Fall back to per-store Stripe secret key
    stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
  }

  if (!stripeKey) return json({ error: 'Stripe not configured for this store' }, 500, corsOrigin);

  // Build Stripe line items
  const stripeLineItems = data.lineItems.map((item, i) => ({
    [`line_items[${i}][price_data][currency]`]: store.currency,
    [`line_items[${i}][price_data][product_data][name]`]: item.name,
    [`line_items[${i}][price_data][unit_amount]`]: item.price.toString(),
    [`line_items[${i}][quantity]`]: item.quantity.toString(),
  }));

  // Flatten line items into form params
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('customer_email', data.customer.email);
  params.set('success_url', data.successUrl || `https://${store.domain || 'webnari.io'}?checkout=success`);
  params.set('cancel_url', data.cancelUrl || `https://${store.domain || 'webnari.io'}?checkout=cancelled`);
  params.set('metadata[store_id]', storeId);
  params.set('metadata[customer_name]', data.customer.name || '');
  params.set('metadata[customer_phone]', data.customer.phone || '');
  params.set('metadata[shipping_state]', data.shippingState || '');

  // Encode line items
  data.lineItems.forEach((item, i) => {
    params.set(`line_items[${i}][price_data][currency]`, store.currency);
    params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
    params.set(`line_items[${i}][price_data][unit_amount]`, item.price.toString());
    params.set(`line_items[${i}][quantity]`, item.quantity.toString());
  });

  // Add shipping as a line item if > 0
  if (data.shippingCost > 0) {
    const si = data.lineItems.length;
    params.set(`line_items[${si}][price_data][currency]`, store.currency);
    params.set(`line_items[${si}][price_data][product_data][name]`, 'Shipping');
    params.set(`line_items[${si}][price_data][unit_amount]`, data.shippingCost.toString());
    params.set(`line_items[${si}][quantity]`, '1');
  }

  // Add tax as a line item if > 0
  if (data.taxAmount > 0) {
    const ti = data.lineItems.length + (data.shippingCost > 0 ? 1 : 0);
    params.set(`line_items[${ti}][price_data][currency]`, store.currency);
    params.set(`line_items[${ti}][price_data][product_data][name]`, 'Sales Tax');
    params.set(`line_items[${ti}][price_data][unit_amount]`, data.taxAmount.toString());
    params.set(`line_items[${ti}][quantity]`, '1');
  }

  // Shipping address collection
  params.set('shipping_address_collection[allowed_countries][]', 'US');

  // Stripe Connect: application fee for platform revenue
  if (applicationFee && applicationFee > 0) {
    params.set('payment_intent_data[application_fee_amount]', applicationFee.toString());
  }

  // Create Stripe Checkout Session
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...stripeAccountHeader,
    },
    body: params.toString(),
  });

  const session = await res.json();
  if (!res.ok) {
    console.error('Stripe error:', JSON.stringify(session));
    return json({ error: 'Failed to create checkout session', details: session.error?.message }, 500, corsOrigin);
  }

  // ── Create inventory reservations ───────────────────────
  const reservationRows = data.reservations.map(r => ({
    store_id: storeId,
    session_id: session.id,
    product_id: r.product_id,
    variant_id: r.variant_id,
    quantity: r.quantity,
    status: 'held',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }));

  await sb.insert('inventory_reservations', reservationRows);

  // Store line item details in metadata for webhook
  // (Stripe metadata has 500 char limit per value, so we store in Supabase)
  // We'll re-derive from the session in the webhook

  return json({
    sessionId: session.id,
    url: session.url,
    subtotal: data.subtotal,
    shipping: data.shippingCost,
    tax: data.taxAmount,
    total: data.total,
  }, 200, corsOrigin);
}


// ── Stripe Webhook ────────────────────────────────────────

async function handleStripeWebhook(request, sb, env, corsOrigin) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  // Parse the event (we'll verify the signature per-store)
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsOrigin);
  }

  // Get store_id from event metadata
  const storeId = event.data?.object?.metadata?.store_id;
  if (!storeId) {
    console.error('Webhook missing store_id in metadata');
    return json({ error: 'Missing store_id' }, 400, corsOrigin);
  }

  // Verify webhook signature — try per-store secret first, then platform secret
  const webhookSecret = getStoreSecret(env, storeId, 'STRIPE_WEBHOOK_SECRET') || env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && sig) {
    const isValid = await verifyStripeSignature(body, sig, webhookSecret);
    if (!isValid) {
      return json({ error: 'Invalid signature' }, 401, corsOrigin);
    }
  }

  // Handle event types
  if (event.type === 'checkout.session.completed') {
    await handleStripeSessionCompleted(sb, env, storeId, event.data.object);
  }

  if (event.type === 'checkout.session.expired') {
    await handleCheckoutExpired(sb, event.data.object.id);
  }

  // Handle Connect deauthorization (store disconnected from Stripe dashboard)
  if (event.type === 'account.application.deauthorized') {
    const connectedAccountId = event.account;
    if (connectedAccountId) {
      // Find and remove the integration
      const integration = await sb.query('store_integrations', {
        filters: { merchant_id: `eq.${connectedAccountId}`, provider: 'eq.stripe' },
        single: true,
      });
      if (integration) {
        await sb.delete('product_mappings', {
          store_id: `eq.${integration.store_id}`,
          provider: 'eq.stripe',
        });
        await sb.delete('store_integrations', { id: `eq.${integration.id}` });
        await sb.insert('sync_log', {
          store_id: integration.store_id,
          provider: 'stripe',
          event_type: 'disconnected',
          direction: 'inbound',
          status: 'success',
          details: JSON.stringify({ reason: 'deauthorized_via_stripe_dashboard', account_id: connectedAccountId }),
        });
      }
    }
  }

  return json({ received: true }, 200, corsOrigin);
}

async function handleStripeSessionCompleted(sb, env, storeId, session) {
  const sessionId = session.id;

  // Check if order already created (idempotency)
  const existing = await sb.query('orders', {
    filters: { stripe_session_id: `eq.${sessionId}` },
    single: true,
  });
  if (existing) return;

  // Get reservations for this session
  const reservations = await sb.query('inventory_reservations', {
    filters: { session_id: `eq.${sessionId}`, status: `eq.held` },
  });

  // Get line items from Stripe — support both per-store key and Connect
  let stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
  const liHeaders = { Authorization: `Bearer ${stripeKey || env.STRIPE_SECRET_KEY}` };

  // If using Stripe Connect, add the connected account header
  const connectIntegration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });
  if (connectIntegration?.merchant_id) {
    liHeaders['Stripe-Account'] = connectIntegration.merchant_id;
    if (!stripeKey) stripeKey = env.STRIPE_SECRET_KEY;
  }

  const liRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100`, {
    headers: liHeaders,
  });
  const lineItemsData = await liRes.json();

  // Generate order number
  const orderNumber = await generateOrderNumber(sb, storeId);

  // Parse shipping address from Stripe
  const shippingDetails = session.shipping_details || session.customer_details;
  const shippingAddress = shippingDetails?.address ? {
    line1: shippingDetails.address.line1,
    line2: shippingDetails.address.line2,
    city: shippingDetails.address.city,
    state: shippingDetails.address.state,
    zip: shippingDetails.address.postal_code,
    country: shippingDetails.address.country,
  } : null;

  // Calculate amounts from Stripe's actual charges
  const total = session.amount_total;       // cents
  const subtotal = session.amount_subtotal; // cents

  // Create order
  const [order] = await sb.insert('orders', {
    store_id: storeId,
    order_number: orderNumber,
    payment_provider: 'stripe',
    stripe_session_id: sessionId,
    stripe_payment_intent: session.payment_intent,
    status: 'confirmed',
    customer_email: session.customer_details?.email || session.metadata?.customer_email,
    customer_name: session.metadata?.customer_name || session.customer_details?.name,
    customer_phone: session.metadata?.customer_phone,
    shipping_address: shippingAddress,
    subtotal: subtotal || 0,
    shipping: 0,  // Extracted from line items below
    tax: 0,       // Extracted from line items below
    total: total || 0,
  });

  // Create order items from reservations + line items
  if (reservations.length > 0) {
    const orderItems = [];
    for (const res of reservations) {
      const product = await sb.query('products', {
        filters: { id: `eq.${res.product_id}` },
        single: true,
      });

      let variantName = null;
      let price = product?.price || 0;

      if (res.variant_id) {
        const variant = await sb.query('variants', {
          filters: { id: `eq.${res.variant_id}` },
          single: true,
        });
        if (variant) {
          variantName = variant.name;
          if (variant.price) price = variant.price;
        }
      }

      orderItems.push({
        order_id: order.id,
        product_id: res.product_id,
        variant_id: res.variant_id,
        product_name: product?.name || 'Unknown Product',
        variant_name: variantName,
        sku: null,
        price,
        quantity: res.quantity,
        image_url: null,
      });

      // Decrement stock
      if (res.variant_id) {
        const variant = await sb.query('variants', {
          filters: { id: `eq.${res.variant_id}` },
          single: true,
        });
        if (variant) {
          await sb.update('variants',
            { id: `eq.${res.variant_id}` },
            { stock_quantity: Math.max(0, variant.stock_quantity - res.quantity) }
          );
        }
      } else {
        if (product) {
          await sb.update('products',
            { id: `eq.${res.product_id}` },
            { stock_quantity: Math.max(0, product.stock_quantity - res.quantity) }
          );
        }
      }

      // Sync sale to Square (non-blocking)
      pushSaleToSquare(sb, env, storeId, res.product_id, res.variant_id, res.quantity).catch(() => {});

      // Mark reservation completed
      await sb.update('inventory_reservations',
        { id: `eq.${res.id}` },
        { status: 'completed' }
      );
    }

    await sb.insert('order_items', orderItems);

    // Sync order to QuickBooks if connected
    syncOrderToQuickBooks(sb, env, storeId, order, orderItems).catch(err =>
      console.error('QB sync (Stripe) failed:', err)
    );
  }
}

async function handleCheckoutExpired(sb, sessionId) {
  // Release reservations
  await sb.update('inventory_reservations',
    { session_id: `eq.${sessionId}`, status: `eq.held` },
    { status: 'expired' }
  );
}

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(payload, sigHeader, secret) {
  try {
    const parts = sigHeader.split(',').reduce((acc, part) => {
      const [key, val] = part.split('=');
      acc[key] = val;
      return acc;
    }, {});

    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    // Check timestamp tolerance (5 min)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    return computed === signature;
  } catch {
    return false;
  }
}


// ═══════════════════════════════════════════════════════════════
//  SQUARE
// ═══════════════════════════════════════════════════════════════

async function createSquareCheckout(sb, env, storeId, store, data, corsOrigin) {
  const accessToken = getStoreSecret(env, storeId, 'SQUARE_ACCESS_TOKEN');
  if (!accessToken) return json({ error: 'Square not configured for this store' }, 500, corsOrigin);

  const locationId = store.square_location_id;
  if (!locationId) return json({ error: 'Square location not configured' }, 500, corsOrigin);

  // Build Square order line items
  const orderLineItems = data.lineItems.map(item => ({
    name: item.name,
    quantity: item.quantity.toString(),
    base_price_money: {
      amount: item.price,
      currency: store.currency.toUpperCase(),
    },
  }));

  // Add shipping
  if (data.shippingCost > 0) {
    orderLineItems.push({
      name: 'Shipping',
      quantity: '1',
      base_price_money: {
        amount: data.shippingCost,
        currency: store.currency.toUpperCase(),
      },
    });
  }

  // Add tax
  if (data.taxAmount > 0) {
    orderLineItems.push({
      name: 'Sales Tax',
      quantity: '1',
      base_price_money: {
        amount: data.taxAmount,
        currency: store.currency.toUpperCase(),
      },
    });
  }

  // Create payment link
  const idempotencyKey = crypto.randomUUID();

  const res = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
    method: 'POST',
    headers: {
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      quick_pay: undefined,
      order: {
        location_id: locationId,
        line_items: orderLineItems,
        metadata: {
          store_id: storeId,
          customer_email: data.customer.email,
          customer_name: data.customer.name || '',
          customer_phone: data.customer.phone || '',
          shipping_state: data.shippingState || '',
        },
      },
      checkout_options: {
        redirect_url: data.successUrl || `https://${store.domain || 'webnari.io'}?checkout=success`,
        allow_tipping: false,
      },
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error('Square error:', JSON.stringify(result));
    return json({ error: 'Failed to create Square checkout', details: result.errors?.[0]?.detail }, 500, corsOrigin);
  }

  // Create inventory reservations
  const sessionId = result.payment_link?.id || idempotencyKey;
  const reservationRows = data.reservations.map(r => ({
    store_id: storeId,
    session_id: sessionId,
    product_id: r.product_id,
    variant_id: r.variant_id,
    quantity: r.quantity,
    status: 'held',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }));

  await sb.insert('inventory_reservations', reservationRows);

  return json({
    sessionId,
    url: result.payment_link?.url,
    subtotal: data.subtotal,
    shipping: data.shippingCost,
    tax: data.taxAmount,
    total: data.total,
  }, 200, corsOrigin);
}


// ── Square Webhook ────────────────────────────────────────

async function handleSquareWebhook(request, sb, env, corsOrigin) {
  const body = await request.text();
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsOrigin);
  }

  // Square sends different event types
  if (event.type === 'payment.completed') {
    const payment = event.data?.object?.payment;
    if (!payment) return json({ received: true }, 200, corsOrigin);

    const orderId = payment.order_id;
    if (!orderId) return json({ received: true }, 200, corsOrigin);

    // Fetch the Square order to get metadata
    // We need to find which store this belongs to by checking reservations
    // or order metadata from Square
    const storeId = event.data?.object?.payment?.note || null;

    // Get order details from Square
    const locationId = payment.location_id;

    // For now, try to find the store by checking all stores with this location
    let store = null;
    if (storeId) {
      store = await sb.query('stores', {
        filters: { id: `eq.${storeId}` },
        single: true,
      });
    }

    if (!store) {
      // Try to find by location_id
      const stores = await sb.query('stores', {
        filters: { square_location_id: `eq.${locationId}` },
      });
      store = stores?.[0];
    }

    if (!store) {
      console.error('Square webhook: could not determine store');
      return json({ received: true }, 200, corsOrigin);
    }

    // Verify webhook signature
    const webhookSig = getStoreSecret(env, store.id, 'SQUARE_WEBHOOK_SIG');
    if (webhookSig) {
      const sigHeader = request.headers.get('x-square-hmacsha256-signature');
      if (sigHeader) {
        const isValid = await verifySquareSignature(
          body,
          sigHeader,
          webhookSig,
          request.url
        );
        if (!isValid) return json({ error: 'Invalid signature' }, 401, corsOrigin);
      }
    }

    // Find reservations by looking for the payment link ID
    // Square payment.completed doesn't directly link back to payment_link
    // We use the order metadata or look up by recent held reservations
    const reservations = await sb.query('inventory_reservations', {
      filters: { store_id: `eq.${store.id}`, status: `eq.held` },
      order: 'created_at.desc',
      limit: 50,
    });

    if (reservations.length > 0) {
      const orderNumber = await generateOrderNumber(sb, store.id);

      const [order] = await sb.insert('orders', {
        store_id: store.id,
        order_number: orderNumber,
        payment_provider: 'square',
        square_payment_id: payment.id,
        status: 'confirmed',
        customer_email: payment.buyer_email_address || '',
        customer_name: '',
        shipping_address: payment.shipping_address ? {
          line1: payment.shipping_address.address_line_1,
          line2: payment.shipping_address.address_line_2,
          city: payment.shipping_address.locality,
          state: payment.shipping_address.administrative_district_level_1,
          zip: payment.shipping_address.postal_code,
          country: payment.shipping_address.country,
        } : null,
        subtotal: payment.amount_money?.amount || 0,
        total: payment.amount_money?.amount || 0,
      });

      // Process reservations → order items + decrement stock
      const orderItems = [];
      for (const res of reservations) {
        const product = await sb.query('products', {
          filters: { id: `eq.${res.product_id}` },
          single: true,
        });

        let variantName = null;
        let price = product?.price || 0;

        if (res.variant_id) {
          const variant = await sb.query('variants', {
            filters: { id: `eq.${res.variant_id}` },
            single: true,
          });
          if (variant) {
            variantName = variant.name;
            if (variant.price) price = variant.price;
          }
        }

        orderItems.push({
          order_id: order.id,
          product_id: res.product_id,
          variant_id: res.variant_id,
          product_name: product?.name || 'Unknown',
          variant_name: variantName,
          price,
          quantity: res.quantity,
        });

        // Decrement stock
        if (res.variant_id) {
          const variant = await sb.query('variants', {
            filters: { id: `eq.${res.variant_id}` },
            single: true,
          });
          if (variant) {
            await sb.update('variants',
              { id: `eq.${res.variant_id}` },
              { stock_quantity: Math.max(0, variant.stock_quantity - res.quantity) }
            );
          }
        } else if (product) {
          await sb.update('products',
            { id: `eq.${res.product_id}` },
            { stock_quantity: Math.max(0, product.stock_quantity - res.quantity) }
          );
        }

        await sb.update('inventory_reservations',
          { id: `eq.${res.id}` },
          { status: 'completed' }
        );
      }

      if (orderItems.length > 0) {
        await sb.insert('order_items', orderItems);

        // Sync order to QuickBooks if connected
        syncOrderToQuickBooks(sb, env, store.id, order, orderItems).catch(err =>
          console.error('QB sync (Square) failed:', err)
        );
      }
    }
  }

  return json({ received: true }, 200, corsOrigin);
}

async function verifySquareSignature(body, signature, sigKey, url) {
  try {
    const payload = url + body;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(sigKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return computed === signature;
  } catch {
    return false;
  }
}


// ═══════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════

async function handleGetOrder(request, sb, env, storeId, orderId, corsOrigin) {
  // Customers can look up by order ID + email
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  const filters = { id: `eq.${orderId}`, store_id: `eq.${storeId}` };
  if (email) filters.customer_email = `eq.${email}`;

  const order = await sb.query('orders', {
    filters,
    single: true,
  });

  if (!order) return json({ error: 'Order not found' }, 404, corsOrigin);

  // Get order items
  const items = await sb.query('order_items', {
    filters: { order_id: `eq.${order.id}` },
  });

  // Build signed invoice URL — HMAC token prevents unauthorized access to customer PII
  const baseUrl = url.origin;
  const secret = env.ADMIN_API_KEY || 'invoice-secret';
  const token = await generateInvoiceToken(order.id, order.customer_email || '', secret);
  const invoiceUrl = `${baseUrl}/api/orders/${order.id}/invoice?email=${encodeURIComponent(order.customer_email || '')}&token=${token}`;

  return json({ ...order, items, invoice_url: invoiceUrl }, 200, corsOrigin);
}


async function handleGetInvoice(request, sb, env, storeId, orderId, corsOrigin) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');
  const isAdmin = requireAdmin(request, env, storeId);

  // Auth: admin via Bearer token, or customer via signed HMAC token
  if (!isAdmin) {
    if (!token || !email) return json({ error: 'Unauthorized' }, 401, corsOrigin);
    const secret = env.ADMIN_API_KEY || 'invoice-secret';
    const valid = await verifyInvoiceToken(orderId, email, token, secret);
    if (!valid) return json({ error: 'Invalid or expired link' }, 403, corsOrigin);
  }

  const filters = { id: `eq.${orderId}` };
  if (storeId) filters.store_id = `eq.${storeId}`;
  if (email) filters.customer_email = `eq.${email}`;

  const order = await sb.query('orders', { filters, single: true });
  if (!order) return json({ error: 'Order not found' }, 404, corsOrigin);

  const items = await sb.query('order_items', {
    filters: { order_id: `eq.${order.id}` },
  });

  // Get store info for branding
  const store = await sb.query('stores', {
    filters: { id: `eq.${order.store_id}` },
    single: true,
    select: 'id,name,domain,settings',
  });

  const storeName = store?.name || 'Store';
  const storeEmail = store?.settings?.email || '';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fmtCents = (c) => `$${(c / 100).toFixed(2)}`;

  const addr = order.shipping_address;
  const shipTo = addr
    ? `${addr.line1 || ''}${addr.line2 ? ', ' + addr.line2 : ''}<br>${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`
    : '';

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        ${esc(item.product_name)}${item.variant_name ? `<br><span style="color:#6b7280;font-size:12px;">${esc(item.variant_name)}</span>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtCents(item.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtCents(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${esc(order.order_number)} — ${esc(storeName)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#f9fafb;padding:40px 20px}
  .invoice{max-width:800px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden}
  .header{padding:40px 40px 32px;border-bottom:2px solid #111827}
  .header h1{font-size:28px;font-weight:800;letter-spacing:-0.5px}
  .header .invoice-label{font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
  .meta{display:flex;justify-content:space-between;padding:32px 40px;gap:24px;flex-wrap:wrap}
  .meta-col{min-width:180px}
  .meta-col h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;font-weight:600}
  .meta-col p{font-size:14px;line-height:1.6;color:#374151}
  table{width:100%;border-collapse:collapse}
  thead th{padding:12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;font-weight:600}
  thead th:nth-child(2){text-align:center}
  thead th:nth-child(3),thead th:nth-child(4){text-align:right}
  .table-wrap{padding:0 40px}
  .summary{padding:24px 40px 32px;display:flex;justify-content:flex-end}
  .summary-table{width:260px}
  .summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#374151}
  .summary-row.total{border-top:2px solid #111827;margin-top:8px;padding-top:12px;font-weight:800;font-size:16px;color:#111827}
  .footer{padding:32px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center}
  .footer p{font-size:13px;color:#6b7280;line-height:1.6}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
  .badge-paid{background:#d1fae5;color:#065f46}
  .badge-refunded{background:#fee2e2;color:#991b1b}
  .badge-pending{background:#fef3c7;color:#92400e}
  .print-btn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#111827;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:100}
  .print-btn:hover{background:#374151}
  @media print{
    body{background:#fff;padding:0}
    .invoice{box-shadow:none;border-radius:0}
    .print-btn{display:none}
    .header{border-bottom-width:1px}
  }
  @media(max-width:600px){
    .header,.meta,.table-wrap,.summary,.footer{padding-left:20px;padding-right:20px}
    .meta{flex-direction:column;gap:16px}
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">Save as PDF</button>
<div class="invoice">
  <div class="header">
    <h1>${esc(storeName)}</h1>
    <div class="invoice-label">Invoice</div>
  </div>

  <div class="meta">
    <div class="meta-col">
      <h3>Invoice Details</h3>
      <p>
        <strong>${esc(order.order_number)}</strong><br>
        ${esc(orderDate)}<br>
        <span class="badge ${order.status === 'refunded' ? 'badge-refunded' : order.status === 'pending' ? 'badge-pending' : 'badge-paid'}">
          ${esc(order.status)}
        </span>
      </p>
    </div>
    <div class="meta-col">
      <h3>Bill To</h3>
      <p>
        ${order.customer_name ? esc(order.customer_name) + '<br>' : ''}
        ${esc(order.customer_email)}
        ${order.customer_phone ? '<br>' + esc(order.customer_phone) : ''}
      </p>
    </div>
    ${shipTo ? `
    <div class="meta-col">
      <h3>Ship To</h3>
      <p>${order.customer_name ? esc(order.customer_name) + '<br>' : ''}${shipTo}</p>
    </div>` : ''}
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <div class="summary">
    <div class="summary-table">
      <div class="summary-row"><span>Subtotal</span><span>${fmtCents(order.subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${order.shipping ? fmtCents(order.shipping) : 'Free'}</span></div>
      <div class="summary-row"><span>Tax</span><span>${fmtCents(order.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${fmtCents(order.total)}</span></div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Thank you for your purchase!</strong></p>
    ${storeEmail ? `<p>${esc(storeEmail)}</p>` : ''}
    <p style="margin-top:12px;font-size:11px;color:#9ca3af;">Payment via ${esc(order.payment_provider || 'card')}</p>
  </div>
</div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'private, no-cache',
    },
  });
}


async function handleListOrders(request, sb, env, storeId, url, corsOrigin) {
  const email = url.searchParams.get('email');
  const status = url.searchParams.get('status');
  const limit = url.searchParams.get('limit') || '50';
  const isAdmin = requireAdmin(request, env, storeId);

  // Non-admin must provide email
  if (!isAdmin && !email) {
    return json({ error: 'Email required for order lookup' }, 400, corsOrigin);
  }

  const filters = { store_id: `eq.${storeId}` };
  if (email) filters.customer_email = `eq.${email}`;
  if (status) filters.status = `eq.${status}`;

  const orders = await sb.query('orders', {
    filters,
    order: 'created_at.desc',
    limit: parseInt(limit),
  });

  return json(orders, 200, corsOrigin);
}

async function handleUpdateOrder(request, sb, env, storeId, orderId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  const body = await request.json();
  const allowed = ['status', 'tracking_number', 'tracking_url', 'notes'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  // Handle refund if status changed to 'refunded'
  if (updates.status === 'refunded') {
    const order = await sb.query('orders', {
      filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` },
      single: true,
    });

    if (order && order.payment_provider === 'stripe' && order.stripe_payment_intent) {
      const stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
      if (stripeKey) {
        const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `payment_intent=${order.stripe_payment_intent}`,
        });
        if (!refundRes.ok) {
          const err = await refundRes.json();
          return json({ error: 'Refund failed', details: err.error?.message }, 500, corsOrigin);
        }
      }
    }

    if (order && order.payment_provider === 'square' && order.square_payment_id) {
      const accessToken = getStoreSecret(env, storeId, 'SQUARE_ACCESS_TOKEN');
      if (accessToken) {
        const refundRes = await fetch('https://connect.squareup.com/v2/refunds', {
          method: 'POST',
          headers: {
            'Square-Version': '2024-01-18',
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            payment_id: order.square_payment_id,
            amount_money: {
              amount: order.total,
              currency: 'USD',
            },
          }),
        });
        if (!refundRes.ok) {
          const err = await refundRes.json();
          return json({ error: 'Refund failed', details: err.errors?.[0]?.detail }, 500, corsOrigin);
        }
      }
    }

    // Restore inventory
    if (order) {
      const items = await sb.query('order_items', {
        filters: { order_id: `eq.${orderId}` },
      });
      for (const item of items) {
        if (item.variant_id) {
          const variant = await sb.query('variants', {
            filters: { id: `eq.${item.variant_id}` },
            single: true,
          });
          if (variant) {
            await sb.update('variants',
              { id: `eq.${item.variant_id}` },
              { stock_quantity: variant.stock_quantity + item.quantity }
            );
          }
        } else {
          const product = await sb.query('products', {
            filters: { id: `eq.${item.product_id}` },
            single: true,
          });
          if (product) {
            await sb.update('products',
              { id: `eq.${item.product_id}` },
              { stock_quantity: product.stock_quantity + item.quantity }
            );
          }
        }
      }
    }
  }

  const result = await sb.update('orders',
    { id: `eq.${orderId}`, store_id: `eq.${storeId}` },
    updates
  );

  return json(result[0] || { updated: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  INVENTORY
// ═══════════════════════════════════════════════════════════════

async function handleGetInventory(sb, storeId, productId, corsOrigin) {
  const product = await sb.query('products', {
    select: 'id,name,stock_quantity,low_stock_threshold,track_inventory,in_stock',
    filters: { id: `eq.${productId}`, store_id: `eq.${storeId}` },
    single: true,
  });
  if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

  const variants = await sb.query('variants', {
    select: 'id,name,sku,color,size,stock_quantity,in_stock',
    filters: { product_id: `eq.${productId}` },
    order: 'sort_order.asc',
  });

  const reserved = await getReservedQuantity(sb, storeId, productId, null);

  return json({
    product: {
      ...product,
      reservedQuantity: reserved,
      availableQuantity: product.stock_quantity - reserved,
    },
    variants: await Promise.all(variants.map(async v => {
      const vReserved = await getReservedQuantity(sb, storeId, productId, v.id);
      return {
        ...v,
        reservedQuantity: vReserved,
        availableQuantity: v.stock_quantity - vReserved,
      };
    })),
  }, 200, corsOrigin);
}

async function handleUpdateInventory(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  const body = await request.json();

  // Update product-level stock
  if (body.stockQuantity !== undefined) {
    await sb.update('products',
      { id: `eq.${productId}`, store_id: `eq.${storeId}` },
      {
        stock_quantity: body.stockQuantity,
        in_stock: body.stockQuantity > 0,
      }
    );
  }

  // Update variant-level stock
  if (body.variants && Array.isArray(body.variants)) {
    for (const v of body.variants) {
      if (v.id && v.stockQuantity !== undefined) {
        await sb.update('variants',
          { id: `eq.${v.id}`, product_id: `eq.${productId}` },
          {
            stock_quantity: v.stockQuantity,
            in_stock: v.stockQuantity > 0,
          }
        );
      }
    }
  }

  return json({ updated: true }, 200, corsOrigin);
}

async function handleLowStock(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  // Get products where stock is at or below threshold
  // Using PostgREST filter: stock_quantity <= low_stock_threshold
  // This requires a custom RPC or we fetch and filter in JS
  const products = await sb.query('products', {
    select: 'id,name,stock_quantity,low_stock_threshold,track_inventory',
    filters: { store_id: `eq.${storeId}`, track_inventory: `eq.true` },
  });

  const lowStock = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

  // Also check variants
  const allVariants = [];
  for (const product of products) {
    const variants = await sb.query('variants', {
      select: 'id,name,sku,stock_quantity,product_id',
      filters: { product_id: `eq.${product.id}` },
    });
    for (const v of variants) {
      if (v.stock_quantity <= product.low_stock_threshold) {
        allVariants.push({ ...v, productName: product.name });
      }
    }
  }

  return json({
    products: lowStock,
    variants: allVariants,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  SHIPPING & TAX
// ═══════════════════════════════════════════════════════════════

async function handleCalculateShipping(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { subtotal } = body;  // subtotal in cents

  if (subtotal === undefined) {
    return json({ error: 'subtotal required (in cents)' }, 400, corsOrigin);
  }

  const store = await sb.query('stores', {
    select: 'shipping_rules',
    filters: { id: `eq.${storeId}` },
    single: true,
  });

  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  const cost = calculateShippingFromRules(store.shipping_rules, subtotal);

  return json({
    shippingCost: cost,
    rules: store.shipping_rules,
  }, 200, corsOrigin);
}

function calculateShippingFromRules(rules, subtotal) {
  if (!rules || !Array.isArray(rules) || rules.length === 0) return 0;

  // Find matching rule based on subtotal
  for (const rule of rules) {
    const min = rule.min_total || 0;
    const max = rule.max_total;
    if (subtotal >= min && (max === null || max === undefined || subtotal <= max)) {
      return rule.cost || 0;
    }
  }

  // Default: first rule's cost
  return rules[0]?.cost || 0;
}

async function handleCalculateTax(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { subtotal, state } = body;  // subtotal in cents, state as 2-letter code

  if (!subtotal || !state) {
    return json({ error: 'subtotal (cents) and state (2-letter code) required' }, 400, corsOrigin);
  }

  const taxRate = await sb.query('store_tax_rates', {
    filters: { store_id: `eq.${storeId}`, state: `eq.${state}` },
    single: true,
  });

  if (!taxRate) {
    return json({ taxAmount: 0, rate: 0, label: 'No tax' }, 200, corsOrigin);
  }

  const rate = parseFloat(taxRate.rate);
  const taxAmount = Math.round(subtotal * rate);

  return json({
    taxAmount,
    rate,
    label: taxRate.label,
    state,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  INVENTORY HELPERS
// ═══════════════════════════════════════════════════════════════

async function getReservedQuantity(sb, storeId, productId, variantId) {
  const filters = {
    store_id: `eq.${storeId}`,
    product_id: `eq.${productId}`,
    status: `eq.held`,
  };
  if (variantId) filters.variant_id = `eq.${variantId}`;

  const reservations = await sb.query('inventory_reservations', { filters });

  // Only count non-expired
  const now = new Date();
  return reservations
    .filter(r => new Date(r.expires_at) > now)
    .reduce((sum, r) => sum + r.quantity, 0);
}

async function cleanupExpiredReservations(sb, storeId) {
  // Get all expired held reservations
  const expired = await sb.query('inventory_reservations', {
    filters: {
      store_id: `eq.${storeId}`,
      status: `eq.held`,
      expires_at: `lt.${new Date().toISOString()}`,
    },
  });

  for (const res of expired) {
    await sb.update('inventory_reservations',
      { id: `eq.${res.id}` },
      { status: 'expired' }
    );
  }
}

async function generateOrderNumber(sb, storeId) {
  const prefix = storeId.slice(0, 3).toUpperCase();
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  // Count today's orders for this store
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
  const orders = await sb.query('orders', {
    filters: {
      store_id: `eq.${storeId}`,
      created_at: `gte.${todayStart}`,
    },
  });

  const seq = (orders?.length || 0) + 1;
  return `${prefix}-${dateStr}-${seq.toString().padStart(4, '0')}`;
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

async function handleAdminStats(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const [products, orders, subscribers, lowStockProducts] = await Promise.all([
    sb.query('products', { filters: { store_id: `eq.${storeId}` } }),
    sb.query('orders', { filters: { store_id: `eq.${storeId}` }, order: 'created_at.desc' }),
    sb.query('newsletter_subscribers', { filters: { store_id: `eq.${storeId}`, unsubscribed_at: 'is.null' } }),
    sb.query('products', { filters: { store_id: `eq.${storeId}`, track_inventory: 'eq.true' } }),
  ]);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const ordersThisMonth = orders.filter(o => o.created_at >= thisMonth);
  const revenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueThisMonth = ordersThisMonth.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const lowStock = lowStockProducts.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const outOfStock = products.filter(p => !p.in_stock).length;

  const pendingReviews = await sb.query('reviews', {
    filters: { store_id: `eq.${storeId}`, approved: 'eq.false' },
  });

  return json({
    totalProducts: products.length,
    totalOrders: orders.length,
    ordersThisMonth: ordersThisMonth.length,
    totalRevenue: revenue,
    revenueThisMonth,
    totalSubscribers: subscribers.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock,
    pendingReviews: pendingReviews.length,
    recentOrders: orders.slice(0, 10).map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      customerEmail: o.customer_email,
      customerName: o.customer_name,
      status: o.status,
      total: o.total,
      createdAt: o.created_at,
    })),
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — PRODUCTS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListProducts(request, sb, env, storeId, url, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const limit = url.searchParams.get('limit') || '100';

  const filters = { store_id: `eq.${storeId}` };
  if (category) filters.category = `eq.${category}`;
  if (search) filters.name = `ilike.*${search}*`;

  const products = await sb.query('products', {
    filters,
    order: 'sort_order.asc,created_at.desc',
    limit: parseInt(limit),
  });

  // Get variant counts and images for each product
  const enriched = await Promise.all(products.map(async p => {
    const [variants, images] = await Promise.all([
      sb.query('variants', { select: 'id', filters: { product_id: `eq.${p.id}` } }),
      sb.query('product_images', { select: 'url', filters: { product_id: `eq.${p.id}` }, order: 'sort_order.asc', limit: 1 }),
    ]);
    return {
      ...p,
      variantCount: variants.length,
      thumbnail: images[0]?.url || null,
    };
  }));

  return json(enriched, 200, corsOrigin);
}

async function handleAdminGetProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const product = await sb.query('products', {
    filters: { id: `eq.${productId}`, store_id: `eq.${storeId}` },
    single: true,
  });
  if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

  const [images, variants, reviews] = await Promise.all([
    sb.query('product_images', { filters: { product_id: `eq.${productId}` }, order: 'sort_order.asc' }),
    sb.query('variants', { filters: { product_id: `eq.${productId}` }, order: 'sort_order.asc' }),
    sb.query('reviews', { filters: { product_id: `eq.${productId}` }, order: 'created_at.desc' }),
  ]);

  // Get variant images
  const variantsWithImages = await Promise.all(variants.map(async v => {
    const vImages = await sb.query('variant_images', {
      filters: { variant_id: `eq.${v.id}` },
      order: 'sort_order.asc',
    });
    return { ...v, images: vImages };
  }));

  return json({ ...product, images, variants: variantsWithImages, reviews }, 200, corsOrigin);
}

async function handleAdminCreateProduct(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { images, variants, ...productData } = body;

  // Create product
  const [product] = await sb.insert('products', {
    ...productData,
    store_id: storeId,
    price: productData.price || 0,
  });

  // Create images
  if (images?.length) {
    await sb.insert('product_images', images.map((img, i) => ({
      product_id: product.id,
      url: img.url,
      alt: img.alt || null,
      sort_order: i,
    })));
  }

  // Create variants
  if (variants?.length) {
    for (const v of variants) {
      const { images: vImages, ...variantData } = v;
      const [variant] = await sb.insert('variants', {
        ...variantData,
        product_id: product.id,
      });
      if (vImages?.length) {
        await sb.insert('variant_images', vImages.map((img, i) => ({
          variant_id: variant.id,
          url: img.url,
          sort_order: i,
        })));
      }
    }
  }

  // Auto-push to Square if connected (non-blocking)
  pushProductToSquare(sb, env, storeId, product).catch(() => {});

  return json(product, 201, corsOrigin);
}

async function handleAdminUpdateProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { images, ...productData } = body;

  // Update product fields
  const allowed = ['name', 'sku', 'color', 'slug', 'category', 'description', 'price', 'compare_at_price',
    'badge', 'in_stock', 'track_inventory', 'stock_quantity', 'low_stock_threshold',
    'is_collection', 'rating', 'stripe_price_id', 'square_catalog_id', 'meta_title', 'meta_description', 'sort_order'];
  const updates = {};
  for (const key of allowed) {
    if (productData[key] !== undefined) updates[key] = productData[key];
  }

  if (Object.keys(updates).length > 0) {
    await sb.update('products', { id: `eq.${productId}`, store_id: `eq.${storeId}` }, updates);
  }

  // Replace images if provided
  if (images !== undefined) {
    await sb.delete('product_images', { product_id: `eq.${productId}` });
    if (images?.length) {
      await sb.insert('product_images', images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt || null,
        sort_order: i,
      })));
    }
  }

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Cascading delete handles images, variants, variant_images, reviews
  await sb.delete('products', { id: `eq.${productId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — VARIANTS
// ═══════════════════════════════════════════════════════════════

async function handleAdminCreateVariant(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { images, ...variantData } = body;

  // Verify product belongs to store
  const product = await sb.query('products', {
    filters: { id: `eq.${variantData.product_id}`, store_id: `eq.${storeId}` },
    single: true,
  });
  if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

  const [variant] = await sb.insert('variants', variantData);

  if (images?.length) {
    await sb.insert('variant_images', images.map((img, i) => ({
      variant_id: variant.id,
      url: img.url,
      sort_order: i,
    })));
  }

  return json(variant, 201, corsOrigin);
}

async function handleAdminUpdateVariant(request, sb, env, storeId, variantId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Verify variant belongs to a product owned by this store
  const variant = await sb.query('variants', { filters: { id: `eq.${variantId}` }, single: true });
  if (!variant) return json({ error: 'Variant not found' }, 404, corsOrigin);
  const product = await sb.query('products', { filters: { id: `eq.${variant.product_id}`, store_id: `eq.${storeId}` }, single: true });
  if (!product) return json({ error: 'Not authorized' }, 403, corsOrigin);

  const body = await request.json();
  const { images, ...variantData } = body;

  const allowed = ['name', 'sku', 'color', 'size', 'price', 'in_stock', 'stock_quantity', 'sort_order'];
  const updates = {};
  for (const key of allowed) {
    if (variantData[key] !== undefined) updates[key] = variantData[key];
  }

  if (Object.keys(updates).length > 0) {
    await sb.update('variants', { id: `eq.${variantId}` }, updates);
  }

  if (images !== undefined) {
    await sb.delete('variant_images', { variant_id: `eq.${variantId}` });
    if (images?.length) {
      await sb.insert('variant_images', images.map((img, i) => ({
        variant_id: variantId,
        url: img.url,
        sort_order: i,
      })));
    }
  }

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteVariant(request, sb, env, storeId, variantId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Verify variant belongs to a product owned by this store
  const variant = await sb.query('variants', { filters: { id: `eq.${variantId}` }, single: true });
  if (!variant) return json({ error: 'Variant not found' }, 404, corsOrigin);
  const product = await sb.query('products', { filters: { id: `eq.${variant.product_id}`, store_id: `eq.${storeId}` }, single: true });
  if (!product) return json({ error: 'Not authorized' }, 403, corsOrigin);

  await sb.delete('variants', { id: `eq.${variantId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — REVIEWS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListReviews(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const reviews = await sb.query('reviews', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  // Enrich with product names
  const enriched = await Promise.all(reviews.map(async r => {
    const product = await sb.query('products', {
      select: 'name',
      filters: { id: `eq.${r.product_id}` },
      single: true,
    });
    return { ...r, productName: product?.name || 'Unknown Product' };
  }));

  return json(enriched, 200, corsOrigin);
}

async function handleAdminUpdateReview(request, sb, env, storeId, reviewId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const updates = {};
  if (body.approved !== undefined) updates.approved = body.approved;

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('reviews', { id: `eq.${reviewId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteReview(request, sb, env, storeId, reviewId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('reviews', { id: `eq.${reviewId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListSubscribers(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const subscribers = await sb.query('newsletter_subscribers', {
    filters: { store_id: `eq.${storeId}` },
    order: 'subscribed_at.desc',
  });

  return json(subscribers, 200, corsOrigin);
}

async function handleAdminExportSubscribers(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const subscribers = await sb.query('newsletter_subscribers', {
    filters: { store_id: `eq.${storeId}`, unsubscribed_at: 'is.null' },
    order: 'subscribed_at.desc',
  });

  const csv = 'email,subscribed_at\n' + subscribers.map(s => `${s.email},${s.subscribed_at}`).join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${storeId}-subscribers-${new Date().toISOString().slice(0,10)}.csv"`,
      ...corsHeaders(corsOrigin),
    },
  });
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — STORE SETTINGS
// ═══════════════════════════════════════════════════════════════

async function handleAdminUpdateStore(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['name', 'domain', 'currency', 'payment_provider', 'shipping_rules', 'settings'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('stores', { id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — TAX RATES
// ═══════════════════════════════════════════════════════════════

async function handleAdminUpsertTaxRate(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.state || body.rate === undefined) {
    return json({ error: 'state and rate required' }, 400, corsOrigin);
  }

  // Check if rate exists for this store + state
  const existing = await sb.query('store_tax_rates', {
    filters: { store_id: `eq.${storeId}`, state: `eq.${body.state}` },
    single: true,
  });

  if (existing) {
    await sb.update('store_tax_rates',
      { id: `eq.${existing.id}` },
      { rate: body.rate, label: body.label || existing.label }
    );
  } else {
    await sb.insert('store_tax_rates', {
      store_id: storeId,
      state: body.state,
      rate: body.rate,
      label: body.label || 'Sales Tax',
    });
  }

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteTaxRate(request, sb, env, storeId, rateId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('store_tax_rates', { id: `eq.${rateId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — CATEGORIES
// ═══════════════════════════════════════════════════════════════

async function handleAdminListCategories(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const categories = await sb.query('categories', {
    filters: { store_id: `eq.${storeId}` },
    order: 'sort_order.asc,name.asc',
  });

  // Get product count per category
  const products = await sb.query('products', {
    select: 'category',
    filters: { store_id: `eq.${storeId}` },
  });

  const counts = {};
  for (const p of products) {
    if (p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  }

  return json(categories.map(c => ({
    ...c,
    productCount: counts[c.slug] || 0,
  })), 200, corsOrigin);
}

async function handleAdminCreateCategory(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.name) return json({ error: 'Category name required' }, 400, corsOrigin);

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Check for duplicate
  const existing = await sb.query('categories', {
    filters: { store_id: `eq.${storeId}`, slug: `eq.${slug}` },
    single: true,
  });
  if (existing) return json({ error: 'Category already exists' }, 400, corsOrigin);

  const [category] = await sb.insert('categories', {
    store_id: storeId,
    name: body.name,
    slug,
    sort_order: body.sort_order || 0,
  });

  return json(category, 201, corsOrigin);
}

async function handleAdminUpdateCategory(request, sb, env, storeId, catId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['name', 'slug', 'sort_order'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('categories', { id: `eq.${catId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteCategory(request, sb, env, storeId, catId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('categories', { id: `eq.${catId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — DISCOUNTS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListDiscounts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const discounts = await sb.query('discounts', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  return json(discounts, 200, corsOrigin);
}

async function handleAdminCreateDiscount(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.code) return json({ error: 'Discount code required' }, 400, corsOrigin);

  const [discount] = await sb.insert('discounts', {
    store_id: storeId,
    code: body.code.toUpperCase().replace(/\s+/g, ''),
    type: body.type || 'percentage',
    value: body.value || 0,
    min_order: body.min_order || 0,
    max_uses: body.max_uses || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
    starts_at: body.starts_at || null,
    expires_at: body.expires_at || null,
  });

  return json(discount, 201, corsOrigin);
}

async function handleAdminUpdateDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['code', 'type', 'value', 'min_order', 'max_uses', 'is_active', 'starts_at', 'expires_at'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('discounts', { id: `eq.${discountId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('discounts', { id: `eq.${discountId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — ANALYTICS
// ═══════════════════════════════════════════════════════════════

async function handleAdminAnalytics(request, sb, env, storeId, url, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const range = url.searchParams.get('range') || '30d';
  const days = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? 3650 : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const prevSince = new Date(Date.now() - days * 2 * 86400000).toISOString();

  // Current period orders
  const orders = await sb.query('orders', {
    filters: { store_id: `eq.${storeId}`, created_at: `gte.${since}` },
    order: 'created_at.asc',
  });

  // Previous period orders (for comparison)
  const prevOrders = range !== 'all' ? await sb.query('orders', {
    filters: { store_id: `eq.${storeId}`, created_at: `gte.${prevSince}`, created_at: `lt.${since}` },
    order: 'created_at.asc',
  }) : [];

  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  const prevOrderCount = prevOrders.length;
  const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Customer breakdown
  const emails = new Set(orders.map(o => o.customer_email).filter(Boolean));
  const allTimeOrders = await sb.query('orders', {
    filters: { store_id: `eq.${storeId}`, created_at: `lt.${since}` },
    select: 'customer_email',
  });
  const prevEmails = new Set(allTimeOrders.map(o => o.customer_email).filter(Boolean));
  let newCustomers = 0;
  let returningCustomers = 0;
  for (const email of emails) {
    if (prevEmails.has(email)) returningCustomers++;
    else newCustomers++;
  }

  function pctChange(curr, prev) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Daily breakdown
  const daily = {};
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    if (!daily[day]) daily[day] = { date: day, revenue: 0, orders: 0 };
    daily[day].revenue += o.total || 0;
    daily[day].orders += 1;
  }

  // Status breakdown
  const statusBreakdown = {};
  for (const o of orders) {
    const s = o.status || 'pending';
    statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
  }

  // Top products (from order line items if available, else from order names)
  const productSales = {};
  for (const o of orders) {
    if (o.status === 'cancelled' || o.status === 'refunded') continue;
    const items = o.items || o.line_items || [];
    if (items.length > 0) {
      for (const item of items) {
        const name = item.name || item.product_name || 'Unknown';
        if (!productSales[name]) productSales[name] = { name, revenue: 0, quantity: 0 };
        productSales[name].revenue += (item.price || 0) * (item.quantity || 1);
        productSales[name].quantity += item.quantity || 1;
      }
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return json({
    range,
    revenue: { total: revenue, previous: prevRevenue, change: pctChange(revenue, prevRevenue) },
    orders: { total: orderCount, previous: prevOrderCount, change: pctChange(orderCount, prevOrderCount) },
    customers: { total: emails.size, new: newCustomers, returning: returningCustomers },
    avgOrderValue: avgOrder,
    revenueByDay: Object.values(daily),
    statusBreakdown,
    topProducts,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — CUSTOMERS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListCustomers(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const orders = await sb.query('orders', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  // Aggregate by email
  const customerMap = {};
  for (const o of orders) {
    const email = o.customer_email;
    if (!email) continue;
    if (!customerMap[email]) {
      customerMap[email] = {
        email,
        name: o.customer_name || '',
        phone: o.customer_phone || '',
        orderCount: 0,
        totalSpent: 0,
        lastOrder: o.created_at,
      };
    }
    customerMap[email].orderCount++;
    customerMap[email].totalSpent += o.total || 0;
    if (o.customer_name && !customerMap[email].name) {
      customerMap[email].name = o.customer_name;
    }
  }

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  return json(customers, 200, corsOrigin);
}


// ══════════════════════════════════════════════════��════════════
//  ADMIN — CSV PRODUCT IMPORT/EXPORT
// ═══════════════════════════════════════════════════════════════

async function handleAdminExportProducts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}` },
    order: 'sort_order.asc,name.asc',
  });

  const headers = ['id', 'name', 'slug', 'category', 'description', 'price', 'compare_at_price', 'badge', 'in_stock', 'stock_quantity', 'sort_order'];
  const csv = headers.join(',') + '\n' + products.map(p =>
    headers.map(h => {
      const val = p[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  ).join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${storeId}-products-${new Date().toISOString().slice(0,10)}.csv"`,
      ...corsHeaders(corsOrigin),
    },
  });
}

async function handleAdminImportProducts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const rows = body.rows;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return json({ error: 'No rows to import' }, 400, corsOrigin);
  }

  let created = 0;
  let updated = 0;
  const errors = [];

  for (const row of rows) {
    const name = row.name || row.Name;
    if (!name) { errors.push('Row missing name'); continue; }

    const slug = row.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const price = parseInt(row.price || row.Price || '0') || 0;

    // Check if product with this slug already exists
    const existing = await sb.query('products', {
      filters: { store_id: `eq.${storeId}`, slug: `eq.${slug}` },
      single: true,
    });

    if (existing) {
      const updates = {};
      if (row.price || row.Price) updates.price = price;
      if (row.category) updates.category = row.category;
      if (row.description) updates.description = row.description;
      if (row.stock_quantity) updates.stock_quantity = parseInt(row.stock_quantity) || 0;
      if (Object.keys(updates).length > 0) {
        await sb.update('products', { id: `eq.${existing.id}`, store_id: `eq.${storeId}` }, updates);
        updated++;
      }
    } else {
      await sb.insert('products', {
        store_id: storeId,
        name,
        slug,
        price,
        category: row.category || null,
        description: row.description || null,
        stock_quantity: parseInt(row.stock_quantity || '0') || 0,
      });
      created++;
    }
  }

  return json({ created, updated, errors: errors.length > 0 ? errors : undefined }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — BLOG
// ═══════════════════════════════════════════════════════════════

async function handleAdminListBlog(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const posts = await sb.query('blog_posts', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  return json(posts, 200, corsOrigin);
}

async function handleAdminCreateBlog(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.title) return json({ error: 'Title is required' }, 400, corsOrigin);

  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const [post] = await sb.insert('blog_posts', {
    store_id: storeId,
    title: body.title,
    slug,
    excerpt: body.excerpt || null,
    content: body.content || null,
    category: body.category || null,
    read_time: body.read_time || null,
    image_url: body.image_url || null,
    published: body.published || false,
  });

  return json(post, 201, corsOrigin);
}

async function handleAdminUpdateBlog(request, sb, env, storeId, postId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['title', 'slug', 'excerpt', 'content', 'category', 'read_time', 'image_url', 'published'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('blog_posts', { id: `eq.${postId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteBlog(request, sb, env, storeId, postId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('blog_posts', { id: `eq.${postId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — GIFT CARDS
// ═══════════════════════════════════════════════════════════════

function generateGiftCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function handleAdminListGiftCards(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const cards = await sb.query('gift_cards', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  return json(cards, 200, corsOrigin);
}

async function handleAdminCreateGiftCard(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.amount || body.amount <= 0) return json({ error: 'Valid amount is required' }, 400, corsOrigin);

  const balanceCents = Math.round(body.amount * 100);
  const code = generateGiftCode();

  const [card] = await sb.insert('gift_cards', {
    store_id: storeId,
    code,
    initial_balance: balanceCents,
    current_balance: balanceCents,
    purchaser_email: body.purchaser_email || null,
    recipient_email: body.recipient_email || null,
    recipient_name: body.recipient_name || null,
    message: body.message || null,
    is_active: true,
  });

  return json(card, 201, corsOrigin);
}

async function handleAdminUpdateGiftCard(request, sb, env, storeId, cardId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['is_active', 'current_balance', 'recipient_email', 'recipient_name', 'message'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('gift_cards', { id: `eq.${cardId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — GLOSSARY
// ═══════════════════════════════════════════════════════════════

async function handleAdminListGlossary(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const terms = await sb.query('glossary_terms', {
    filters: { store_id: `eq.${storeId}` },
    order: 'sort_order.asc,term.asc',
  });

  return json(terms, 200, corsOrigin);
}

async function handleAdminCreateGlossary(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.term) return json({ error: 'Term is required' }, 400, corsOrigin);
  if (!body.definition) return json({ error: 'Definition is required' }, 400, corsOrigin);

  const slug = body.slug || body.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const [term] = await sb.insert('glossary_terms', {
    store_id: storeId,
    term: body.term,
    slug,
    definition: body.definition,
    category: body.category || null,
    image_url: body.image_url || null,
    sort_order: body.sort_order || 0,
    is_published: body.is_published !== undefined ? body.is_published : true,
  });

  return json(term, 201, corsOrigin);
}

async function handleAdminUpdateGlossary(request, sb, env, storeId, termId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['term', 'slug', 'definition', 'category', 'image_url', 'sort_order', 'is_published'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('glossary_terms', { id: `eq.${termId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteGlossary(request, sb, env, storeId, termId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('glossary_terms', { id: `eq.${termId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — INTEGRATIONS (Square OAuth + Inventory Sync + QuickBooks)
// ═══════════════════════════════════════════════════════════════

// Auto-detect sandbox vs production based on SQUARE_APP_ID
function getSquareBase(env) {
  const appId = env.SQUARE_APP_ID || '';
  if (appId.startsWith('sandbox-')) {
    return 'https://connect.squareupsandbox.com';
  }
  return 'https://connect.squareup.com';
}
function getSquareOAuthUrl(env) {
  return getSquareBase(env) + '/oauth2/authorize';
}

// QuickBooks constants
const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QB_REVOKE_URL = 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke';
const QB_API_BASE = 'https://quickbooks.api.intuit.com';
const QB_SANDBOX_API_BASE = 'https://sandbox-quickbooks.api.intuit.com';

// List all integrations for a store
async function handleAdminListIntegrations(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integrations = await sb.query('store_integrations', {
    select: 'id,store_id,provider,merchant_id,location_id,realm_id,company_name,settings,connected_at,updated_at,token_expires_at,metadata',
    filters: { store_id: `eq.${storeId}` },
  });

  // Get mapping counts per provider
  for (const integ of integrations) {
    const mappings = await sb.query('product_mappings', {
      select: 'id',
      filters: { store_id: `eq.${storeId}`, provider: `eq.${integ.provider}` },
    });
    integ.mapping_count = mappings.length;
  }

  return json(integrations, 200, corsOrigin);
}

// Start Square OAuth — returns the URL to redirect the user to
async function handleSquareOAuthConnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const appId = env.SQUARE_APP_ID;
  if (!appId) return json({ error: 'Square app not configured' }, 500, corsOrigin);

  // Encode store_id in the state param for CSRF protection + identification
  const statePayload = JSON.stringify({ store_id: storeId, ts: Date.now() });
  const state = btoa(statePayload);

  const scopes = [
    'INVENTORY_READ',
    'INVENTORY_WRITE',
    'ITEMS_READ',
    'ITEMS_WRITE',
    'MERCHANT_PROFILE_READ',
    'ORDERS_READ',
  ].join('+');

  const redirectUri = encodeURIComponent(
    `https://webnari.io/commerce/api/admin/integrations/square/callback`
  );

  const oauthUrl = `${getSquareOAuthUrl(env)}?client_id=${appId}&response_type=code&scope=${scopes}&state=${encodeURIComponent(state)}&redirect_uri=${redirectUri}`;

  return json({ url: oauthUrl }, 200, corsOrigin);
}

// Square OAuth callback — browser redirect, exchanges code for tokens
async function handleSquareOAuthCallback(request, sb, env, url, corsOrigin) {
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Admin dashboard base URL
  const adminBase = 'https://webnari-store-admin.webnari.workers.dev';

  if (error) {
    return Response.redirect(`${adminBase}?integration_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !stateParam) {
    return Response.redirect(`${adminBase}?integration_error=missing_code`, 302);
  }

  // Decode the state to get store_id
  let storeId;
  try {
    const stateData = JSON.parse(atob(decodeURIComponent(stateParam)));
    storeId = stateData.store_id;
    // Check state is not too old (30 minutes)
    if (Date.now() - stateData.ts > 30 * 60 * 1000) {
      return Response.redirect(`${adminBase}?integration_error=state_expired`, 302);
    }
  } catch {
    return Response.redirect(`${adminBase}?integration_error=invalid_state`, 302);
  }

  if (!storeId) {
    return Response.redirect(`${adminBase}?integration_error=missing_store`, 302);
  }

  // Exchange authorization code for access token
  const appId = env.SQUARE_APP_ID;
  const appSecret = env.SQUARE_APP_SECRET;

  try {
    const tokenRes = await fetch(`${getSquareBase(env)}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: appId,
        client_secret: appSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://webnari.io/commerce/api/admin/integrations/square/callback',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Square OAuth token exchange failed:', tokenData);
      const errDetail = encodeURIComponent(
        tokenData.message || tokenData.error || JSON.stringify(tokenData).slice(0, 200)
      );
      return Response.redirect(
        `${adminBase}/${storeId}/integrations?error=${errDetail}`, 302
      );
    }

    // Get merchant info
    let merchantId = tokenData.merchant_id || null;
    let locationId = null;

    // Fetch merchant's locations
    try {
      const locRes = await fetch(`${getSquareBase(env)}/v2/locations`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const locData = await locRes.json();
      if (locData.locations && locData.locations.length > 0) {
        // Default to first active location
        const activeLoc = locData.locations.find(l => l.status === 'ACTIVE') || locData.locations[0];
        locationId = activeLoc.id;
        if (!merchantId) merchantId = activeLoc.merchant_id;
      }
    } catch (err) {
      console.error('Failed to fetch Square locations:', err);
    }

    // Calculate token expiry
    let tokenExpiresAt = null;
    if (tokenData.expires_at) {
      tokenExpiresAt = tokenData.expires_at;
    }

    // Upsert the integration record
    // Check if exists first
    const existing = await sb.query('store_integrations', {
      filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
      single: true,
    });

    if (existing) {
      await sb.update('store_integrations',
        { store_id: `eq.${storeId}`, provider: 'eq.square' },
        {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          merchant_id: merchantId,
          location_id: locationId,
          token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        }
      );
    } else {
      await sb.insert('store_integrations', {
        store_id: storeId,
        provider: 'square',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        merchant_id: merchantId,
        location_id: locationId,
        token_expires_at: tokenExpiresAt,
      });
    }

    // Log the connection
    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'square',
      direction: 'system',
      event_type: 'connected',
      details: `Square account connected (merchant: ${merchantId})`,
      status: 'success',
    });

    return Response.redirect(`${adminBase}/${storeId}/integrations?connected=square`, 302);

  } catch (err) {
    console.error('Square OAuth error:', err);
    return Response.redirect(
      `${adminBase}/${storeId}/integrations?error=oauth_failed`, 302
    );
  }
}

// Disconnect Square
async function handleSquareOAuthDisconnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Get the integration to revoke the token
  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
    single: true,
  });

  if (!integration) {
    return json({ error: 'No Square integration found' }, 404, corsOrigin);
  }

  // Revoke the access token at Square
  if (integration.access_token) {
    try {
      await fetch(`${getSquareBase(env)}/oauth2/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Client ${env.SQUARE_APP_SECRET}`,
        },
        body: JSON.stringify({
          client_id: env.SQUARE_APP_ID,
          access_token: integration.access_token,
        }),
      });
    } catch (err) {
      console.error('Failed to revoke Square token:', err);
    }
  }

  // Delete mappings and integration record
  await sb.delete('product_mappings', { store_id: `eq.${storeId}`, provider: 'eq.square' });
  await sb.delete('store_integrations', { store_id: `eq.${storeId}`, provider: 'eq.square' });

  // Log the disconnection
  await sb.insert('sync_log', {
    store_id: storeId,
    provider: 'square',
    direction: 'system',
    event_type: 'disconnected',
    details: 'Square account disconnected',
    status: 'success',
  });

  return json({ disconnected: true }, 200, corsOrigin);
}

// ── QuickBooks OAuth ────────────────────────────────────

// Generate QuickBooks OAuth URL
async function handleQuickBooksConnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const clientId = env.QUICKBOOKS_CLIENT_ID;
  if (!clientId) return json({ error: 'QuickBooks not configured — missing QUICKBOOKS_CLIENT_ID' }, 500, corsOrigin);

  // Build the redirect URI — the callback route on this worker
  const redirectUri = `https://webnari.io/commerce/api/admin/integrations/quickbooks/callback`;

  // State encodes storeId + timestamp for CSRF protection
  const state = btoa(JSON.stringify({ storeId, ts: Date.now() }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    state,
  });

  return json({ url: `${QB_AUTH_URL}?${params}` }, 200, corsOrigin);
}

// OAuth callback — exchange code for tokens
async function handleQuickBooksCallback(request, sb, env, storeId, url, corsOrigin) {
  try {
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Decode storeId from state first (needed for redirect URLs)
  let callbackStoreId = storeId;
  if (state) {
    try {
      const parsed = JSON.parse(atob(state));
      if (parsed.storeId) callbackStoreId = parsed.storeId;
      // Validate state is not older than 30 minutes
      if (parsed.ts && Date.now() - parsed.ts > 30 * 60 * 1000) {
        const adminUrl = `https://webnari-store-admin.webnari.workers.dev/${callbackStoreId || 'unknown'}/integrations`;
        return Response.redirect(`${adminUrl}?qb_error=${encodeURIComponent('OAuth session expired. Please try again.')}`, 302);
      }
    } catch { /* use header storeId */ }
  }

  const adminUrl = `https://webnari-store-admin.webnari.workers.dev/${callbackStoreId || 'unknown'}/integrations`;

  if (error) {
    return Response.redirect(`${adminUrl}?qb_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !realmId) {
    return Response.redirect(`${adminUrl}?qb_error=${encodeURIComponent('Missing code or realmId')}`, 302);
  }

  const clientId = env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = env.QUICKBOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return json({ error: 'QuickBooks not configured' }, 500, corsOrigin);
  }

  const redirectUri = `https://webnari.io/commerce/api/admin/integrations/quickbooks/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('QB token exchange failed:', JSON.stringify(tokens));
    return Response.redirect(`https://webnari-store-admin.webnari.workers.dev/${callbackStoreId}/integrations?qb_error=token_exchange_failed`, 302);
  }

  // Fetch company name from QB
  let companyName = '';
  try {
    const apiBase = env.QUICKBOOKS_SANDBOX === 'true' ? QB_SANDBOX_API_BASE : QB_API_BASE;
    const infoRes = await fetch(`${apiBase}/v3/company/${realmId}/companyinfo/${realmId}`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/json',
      },
    });
    if (infoRes.ok) {
      const infoData = await infoRes.json();
      companyName = infoData.CompanyInfo?.CompanyName || '';
    }
  } catch { /* non-critical */ }

  // Upsert integration record
  const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();
  const refreshExpiresAt = new Date(Date.now() + (tokens.x_refresh_token_expires_in || 8726400) * 1000).toISOString();

  // Check if already exists
  const existing = await sb.query('store_integrations', {
    filters: { store_id: `eq.${callbackStoreId}`, provider: `eq.quickbooks` },
    single: true,
  });

  if (existing) {
    await sb.update('store_integrations',
      { id: `eq.${existing.id}` },
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        realm_id: realmId,
        company_name: companyName,
        metadata: { refresh_expires_at: refreshExpiresAt },
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  } else {
    await sb.insert('store_integrations', {
      store_id: callbackStoreId,
      provider: 'quickbooks',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      realm_id: realmId,
      company_name: companyName,
      metadata: { refresh_expires_at: refreshExpiresAt },
    });
  }

  // Redirect back to integrations page
  return Response.redirect(`https://webnari-store-admin.webnari.workers.dev/${callbackStoreId}/integrations?qb_connected=true`, 302);
  } catch (err) {
    console.error('QB callback error:', err);
    return json({ error: 'QuickBooks callback failed', details: err.message }, 500, corsOrigin);
  }
}

// Disconnect QuickBooks
async function handleQuickBooksDisconnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: `eq.quickbooks` },
    single: true,
  });

  if (!integration) return json({ error: 'QuickBooks not connected' }, 404, corsOrigin);

  // Revoke token at Intuit
  const clientId = env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = env.QUICKBOOKS_CLIENT_SECRET;
  if (clientId && clientSecret && integration.refresh_token) {
    try {
      await fetch(QB_REVOKE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: JSON.stringify({ token: integration.refresh_token }),
      });
    } catch { /* best effort */ }
  }

  await sb.delete('store_integrations', { id: `eq.${integration.id}` });

  return json({ disconnected: true }, 200, corsOrigin);
}

// List Square locations for the connected merchant
async function handleSquareListLocations(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await getSquareIntegration(sb, env, storeId);
  if (!integration) return json({ error: 'Square not connected' }, 400, corsOrigin);

  const res = await fetch(`${getSquareBase(env)}/v2/locations`, {
    headers: { Authorization: `Bearer ${integration.access_token}` },
  });
  const data = await res.json();

  if (!res.ok) return json({ error: 'Failed to fetch locations' }, 502, corsOrigin);

  const locations = (data.locations || []).map(l => ({
    id: l.id,
    name: l.name,
    status: l.status,
    address: l.address,
  }));

  return json({ locations, current: integration.location_id }, 200, corsOrigin);
}

// Set active Square location
async function handleSquareSetLocation(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.location_id) return json({ error: 'location_id is required' }, 400, corsOrigin);

  await sb.update('store_integrations',
    { store_id: `eq.${storeId}`, provider: 'eq.square' },
    { location_id: body.location_id, updated_at: new Date().toISOString() }
  );

  return json({ updated: true }, 200, corsOrigin);
}

// Manual sync — pull Square catalog and auto-map by SKU
async function handleSquareManualSync(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await getSquareIntegration(sb, env, storeId);
  if (!integration) return json({ error: 'Square not connected' }, 400, corsOrigin);

  try {
    // Parse options
    const body = await request.text();
    const opts = body ? JSON.parse(body) : {};
    const freshSync = opts.fresh === true;
    const includeImages = opts.include_images === true || opts.includeImages === true;

    if (freshSync) {
      // Delete all existing Square catalog items created by Webnari
      const oldMappings = await sb.query('product_mappings', {
        filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
      });

      if (oldMappings.length > 0) {
        // Get unique parent item IDs from Square
        const variationIds = oldMappings.map(m => m.external_id).filter(Boolean);

        // Batch retrieve to get parent item IDs
        if (variationIds.length > 0) {
          try {
            const batchRes = await fetch(`${getSquareBase(env)}/v2/catalog/batch-retrieve`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${integration.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ object_ids: variationIds }),
            });
            const batchData = await batchRes.json();

            // Collect parent item IDs (variations have item_variation_data.item_id)
            const parentIds = new Set();
            for (const obj of (batchData.objects || [])) {
              if (obj.type === 'ITEM_VARIATION' && obj.item_variation_data?.item_id) {
                parentIds.add(obj.item_variation_data.item_id);
              } else if (obj.type === 'ITEM') {
                parentIds.add(obj.id);
              }
            }

            // Delete parent items from Square
            if (parentIds.size > 0) {
              await fetch(`${getSquareBase(env)}/v2/catalog/batch-delete`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${integration.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ object_ids: [...parentIds] }),
              });
            }
          } catch (e) {
            console.error('Failed to delete old Square items:', e.message);
          }
        }

        // Clear all mappings
        await sb.delete('product_mappings', {
          store_id: `eq.${storeId}`,
          provider: 'eq.square',
        });
      }
    }

    // ── STEP 1: Pull Square catalog ──────────────────────
    let cursor = null;
    let allSquareItems = [];

    do {
      const params = new URLSearchParams({ types: 'ITEM' });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`${getSquareBase(env)}/v2/catalog/list?${params}`, {
        headers: { Authorization: `Bearer ${integration.access_token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(`Square catalog fetch failed: ${res.status}`);

      if (data.objects) allSquareItems = allSquareItems.concat(data.objects);
      cursor = data.cursor || null;
    } while (cursor);

    // ── STEP 2: Get Webnari products + existing mappings ─
    const products = await sb.query('products', {
      filters: { store_id: `eq.${storeId}` },
    });

    // Variants don't have store_id — fetch by product IDs
    let variants = [];
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      variants = await sb.query('variants', {
        filters: { product_id: `in.(${productIds.join(',')})` },
        order: 'name.asc',
      });
    }

    let existingMappings = await sb.query('product_mappings', {
      filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
    });

    // ── Clean up stale mappings (pointing to deleted Square items) ──
    const allSquareVariationIds = new Set();
    for (const item of allSquareItems) {
      for (const v of (item.item_data?.variations || [])) {
        allSquareVariationIds.add(v.id);
      }
    }
    const staleMappings = existingMappings.filter(m => !allSquareVariationIds.has(m.external_id));
    if (staleMappings.length > 0) {
      for (const stale of staleMappings) {
        await sb.delete('product_mappings', { id: `eq.${stale.id}` });
      }
      // Re-fetch clean mappings
      existingMappings = existingMappings.filter(m => allSquareVariationIds.has(m.external_id));
      console.log(`Cleaned up ${staleMappings.length} stale mappings`);
    }

    const mappedExternalIds = new Set(existingMappings.map(m => m.external_id));
    const mappedWebnariIds = new Set(existingMappings.map(m => m.webnari_product_id));

    // Build SKU lookups
    const skuToWebnari = {};
    for (const p of products) {
      if (p.sku) skuToWebnari[p.sku.toUpperCase()] = { product_id: p.id, variant_id: null, product: p };
    }
    for (const v of variants) {
      if (v.sku) skuToWebnari[v.sku.toUpperCase()] = { product_id: v.product_id, variant_id: v.id };
    }

    // Build name lookup as fallback (normalize: lowercase, trim)
    const nameToWebnari = {};
    for (const p of products) {
      if (p.name) nameToWebnari[p.name.trim().toLowerCase()] = { product_id: p.id, variant_id: null, product: p };
    }

    let matched = 0;
    let skipped = 0;
    let importedFromSquare = 0;
    let pushedToSquare = 0;
    const newMappings = [];

    // ── STEP 3: Square → Webnari (match or import) ───────
    for (const item of allSquareItems) {
      const itemData = item.item_data;
      if (!itemData || !itemData.variations) continue;

      for (const variation of itemData.variations) {
        const varData = variation.item_variation_data;
        const externalId = variation.id;

        if (mappedExternalIds.has(externalId)) { skipped++; continue; }

        // Try matching: SKU first, then product name
        const squareSku = varData?.sku?.toUpperCase();
        let match = squareSku ? skuToWebnari[squareSku] : null;

        if (!match && itemData.name) {
          const nameKey = itemData.name.trim().toLowerCase();
          const nameMatch = nameToWebnari[nameKey];
          // Only use name match if that product isn't already mapped
          if (nameMatch && !mappedWebnariIds.has(nameMatch.product_id)) {
            match = nameMatch;
          }
        }

        if (match) {
          // Matched by SKU or name — link them
          newMappings.push({
            store_id: storeId,
            provider: 'square',
            webnari_product_id: match.product_id,
            webnari_variant_id: match.variant_id,
            external_id: externalId,
            external_name: `${itemData.name} — ${varData?.name || 'Default'}`,
            external_sku: varData?.sku || null,
            auto_sync: true,
          });
          matched++;
        } else {
          // No match — import from Square as a new Webnari product
          const priceMoney = varData?.price_money;
          const priceCents = priceMoney ? priceMoney.amount : 0;

          const slug = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

          const [newProduct] = await sb.insert('products', {
            store_id: storeId,
            name: itemData.name,
            slug: slug + '-' + Date.now().toString(36),
            description: itemData.description || '',
            sku: varData?.sku || null,
            price: priceCents,
            stock_quantity: 0, // Will be updated by inventory sync
            track_inventory: true,
            in_stock: true,
          });

          newMappings.push({
            store_id: storeId,
            provider: 'square',
            webnari_product_id: newProduct.id,
            webnari_variant_id: null,
            external_id: externalId,
            external_name: `${itemData.name} — ${varData?.name || 'Default'}`,
            external_sku: varData?.sku || null,
            auto_sync: true,
          });

          importedFromSquare++;
        }
      }
    }

    // ── STEP 4: Webnari → Square (push unmapped products with variants + images) ─
    for (const product of products) {
      if (mappedWebnariIds.has(product.id)) continue;

      // Check if this product's SKU already matched above
      const alreadyMapped = newMappings.some(m => m.webnari_product_id === product.id);
      if (alreadyMapped) continue;

      // Push this product to Square catalog
      try {
        // Fetch variants for this product
        const productVariants = variants.filter(v => v.product_id === product.id);

        // Build Square variations array
        let squareVariations = [];
        if (productVariants.length > 0) {
          // Product has real variants — push each one
          squareVariations = productVariants.map(v => ({
            type: 'ITEM_VARIATION',
            id: `#webnari-var-${v.id}`,
            item_variation_data: {
              item_id: `#webnari-${product.id}`,
              name: v.name || 'Default',
              sku: v.sku || undefined,
              pricing_type: 'FIXED_PRICING',
              price_money: {
                amount: v.price || product.price || 0,
                currency: 'USD',
              },
            },
          }));
        } else {
          // No variants — single "Default" variation
          squareVariations = [{
            type: 'ITEM_VARIATION',
            id: `#webnari-var-${product.id}`,
            item_variation_data: {
              item_id: `#webnari-${product.id}`,
              name: 'Default',
              sku: product.sku || undefined,
              pricing_type: 'FIXED_PRICING',
              price_money: {
                amount: product.price || 0,
                currency: 'USD',
              },
            },
          }];
        }

        const idempotencyKey = `webnari-${product.id}-${Date.now()}`;
        const squareItem = {
          idempotency_key: idempotencyKey,
          object: {
            type: 'ITEM',
            id: `#webnari-${product.id}`,
            item_data: {
              name: product.name,
              description: product.description || '',
              variations: squareVariations,
            },
          },
        };

        const pushRes = await fetch(`${getSquareBase(env)}/v2/catalog/object`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(squareItem),
        });

        const pushData = await pushRes.json();

        if (pushRes.ok && pushData.catalog_object) {
          const createdItem = pushData.catalog_object;
          const createdVariations = createdItem.item_data?.variations || [];

          if (productVariants.length > 0) {
            // Map each variant to its Square variation
            for (let vi = 0; vi < createdVariations.length; vi++) {
              const sqVar = createdVariations[vi];
              const wnVar = productVariants[vi]; // Order matches
              if (sqVar && wnVar) {
                newMappings.push({
                  store_id: storeId,
                  provider: 'square',
                  webnari_product_id: product.id,
                  webnari_variant_id: wnVar.id,
                  external_id: sqVar.id,
                  external_name: `${product.name} — ${wnVar.name || 'Variant'}`,
                  external_sku: wnVar.sku || null,
                  auto_sync: true,
                });

                // Set inventory for each variant
                if (wnVar.stock_quantity > 0 && integration.location_id) {
                  await pushInventoryToSquare(env, integration, sqVar.id, wnVar.stock_quantity);
                }
              }
            }
          } else {
            // Single default variation
            const createdVariation = createdVariations[0];
            if (createdVariation) {
              newMappings.push({
                store_id: storeId,
                provider: 'square',
                webnari_product_id: product.id,
                webnari_variant_id: null,
                external_id: createdVariation.id,
                external_name: `${product.name} — Default`,
                external_sku: product.sku || null,
                auto_sync: true,
              });

              if (product.stock_quantity > 0 && integration.location_id) {
                await pushInventoryToSquare(env, integration, createdVariation.id, product.stock_quantity);
              }
            }
          }

          // ── Upload product images to Square (only when includeImages is set) ──
          if (includeImages) try {
            const productImages = await sb.query('product_images', {
              filters: { product_id: `eq.${product.id}` },
              order: 'sort_order.asc',
            });

            const createdItemId = createdItem.id;
            for (const img of productImages.slice(0, 5)) { // Max 5 images per item
              try {
                // Download the image from Supabase storage
                const imgRes = await fetch(img.url);
                if (!imgRes.ok) continue;
                const imgBlob = await imgRes.arrayBuffer();
                const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

                // Square requires multipart form upload for images
                const boundary = '----WebKitFormBoundary' + Date.now().toString(36);
                const imageJson = JSON.stringify({
                  idempotency_key: `img-${img.id}-${Date.now()}`,
                  object_id: createdItemId,
                  image: {
                    type: 'IMAGE',
                    id: `#img-${img.id}`,
                    image_data: {
                      name: img.alt || product.name,
                      caption: img.alt || '',
                    },
                  },
                });

                // Build multipart body
                const encoder = new TextEncoder();
                const parts = [
                  encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n${imageJson}\r\n`),
                  encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="image.jpg"\r\nContent-Type: ${contentType}\r\n\r\n`),
                  new Uint8Array(imgBlob),
                  encoder.encode(`\r\n--${boundary}--\r\n`),
                ];

                const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
                const body = new Uint8Array(totalLength);
                let offset = 0;
                for (const part of parts) {
                  body.set(part, offset);
                  offset += part.byteLength;
                }

                await fetch(`${getSquareBase(env)}/v2/catalog/images`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${integration.access_token}`,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                  },
                  body: body,
                });
              } catch (imgErr) {
                console.error(`Image upload failed for ${product.name}:`, imgErr.message);
              }
            }

            // Upload variant-specific images
            for (let vi = 0; vi < productVariants.length && vi < createdVariations.length; vi++) {
              const wnVar = productVariants[vi];
              const sqVar = createdVariations[vi];
              try {
                const varImages = await sb.query('variant_images', {
                  filters: { variant_id: `eq.${wnVar.id}` },
                  order: 'sort_order.asc',
                });

                for (const vimg of varImages.slice(0, 3)) { // Up to 3 images per variant
                  try {
                    const imgRes = await fetch(vimg.url);
                    if (!imgRes.ok) continue;
                    const imgBlob = await imgRes.arrayBuffer();
                    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

                    const boundary = '----WebKitFormBoundary' + Date.now().toString(36);
                    const imageJson = JSON.stringify({
                      idempotency_key: `vimg-${vimg.id}-${Date.now()}`,
                      object_id: sqVar.id, // Attach to the specific ITEM_VARIATION
                      image: {
                        type: 'IMAGE',
                        id: `#vimg-${vimg.id}`,
                        image_data: {
                          name: `${product.name} - ${wnVar.name}`,
                          caption: wnVar.name || '',
                        },
                      },
                    });

                    const encoder = new TextEncoder();
                    const parts = [
                      encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n${imageJson}\r\n`),
                      encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="image.jpg"\r\nContent-Type: ${contentType}\r\n\r\n`),
                      new Uint8Array(imgBlob),
                      encoder.encode(`\r\n--${boundary}--\r\n`),
                    ];

                    const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
                    const body = new Uint8Array(totalLength);
                    let offset = 0;
                    for (const part of parts) {
                      body.set(part, offset);
                      offset += part.byteLength;
                    }

                    await fetch(`${getSquareBase(env)}/v2/catalog/images`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${integration.access_token}`,
                        'Content-Type': `multipart/form-data; boundary=${boundary}`,
                      },
                      body: body,
                    });
                  } catch (vimgErr) {
                    console.error(`Variant image upload failed:`, vimgErr.message);
                  }
                }
              } catch (e) {
                // variant_images table might not exist or no images
              }
            }
          } catch (imgErr) {
            console.error(`Image sync failed for ${product.name}:`, imgErr.message);
          }

          pushedToSquare++;
        } else {
          console.error('Failed to push product to Square:', pushData);
        }
      } catch (err) {
        console.error(`Failed to push product ${product.name} to Square:`, err);
      }
    }

    // ── STEP 5: Save mappings + log ──────────────────────
    if (newMappings.length > 0) {
      await sb.insert('product_mappings', newMappings);
    }

    // Pull inventory counts from Square for all mapped items
    let inventoryUpdated = 0;
    if (integration.location_id) {
      const allMappingIds = [...existingMappings, ...newMappings.map(m => ({ ...m }))];
      const catalogIds = allMappingIds.map(m => m.external_id).filter(Boolean);

      if (catalogIds.length > 0) {
        // Batch retrieve inventory counts
        try {
          const invRes = await fetch(`${getSquareBase(env)}/v2/inventory/counts/batch-retrieve`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${integration.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              catalog_object_ids: catalogIds.slice(0, 100),
              location_ids: [integration.location_id],
            }),
          });
          const invData = await invRes.json();

          if (invData.counts) {
            for (const count of invData.counts) {
              const mapping = allMappingIds.find(m => m.external_id === count.catalog_object_id);
              if (!mapping) continue;

              const qty = parseInt(count.quantity, 10) || 0;

              if (mapping.webnari_variant_id) {
                await sb.update('variants',
                  { id: `eq.${mapping.webnari_variant_id}` },
                  { stock_quantity: qty }
                );
              } else {
                await sb.update('products',
                  { id: `eq.${mapping.webnari_product_id}` },
                  { stock_quantity: qty }
                );
              }
              inventoryUpdated++;
            }
          }
        } catch (err) {
          console.error('Inventory count sync error:', err);
        }
      }
    }

    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'square',
      direction: 'both',
      event_type: 'catalog_sync',
      details: `Bidirectional sync: ${matched} matched by SKU, ${importedFromSquare} imported from Square, ${pushedToSquare} pushed to Square, ${inventoryUpdated} inventory counts updated, ${skipped} already mapped`,
      status: 'success',
    });

    return json({
      synced: true,
      square_items: allSquareItems.length,
      webnari_products: products.length,
      matched,
      imported_from_square: importedFromSquare,
      pushed_to_square: pushedToSquare,
      inventory_updated: inventoryUpdated,
      skipped,
      total_mappings: existingMappings.length + newMappings.length,
    }, 200, corsOrigin);

  } catch (err) {
    console.error('Square manual sync error:', err);

    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'square',
      direction: 'inbound',
      event_type: 'catalog_sync',
      details: 'Manual catalog sync failed',
      status: 'error',
      error: err.message,
    });

    return json({ error: 'Sync failed: ' + err.message }, 500, corsOrigin);
  }
}

// ── Sync images to Square (one product at a time) ───────
async function handleSquareSyncImages(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await getSquareIntegration(sb, env, storeId);
  if (!integration) return json({ error: 'Square not connected' }, 400, corsOrigin);

  try {
    const body = await request.text();
    const opts = body ? JSON.parse(body) : {};
    const targetProductId = opts.product_id || null; // optional: sync images for one product
    const skipCount = parseInt(opts.offset || opts.skip || '0', 10) || 0;

    // Get mappings to find Square item IDs
    const mappings = await sb.query('product_mappings', {
      filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
    });
    if (!mappings.length) return json({ error: 'No product mappings found' }, 400, corsOrigin);

    // Group mappings by webnari_product_id to get parent Square item IDs
    const productMappings = {};
    for (const m of mappings) {
      if (!productMappings[m.webnari_product_id]) {
        productMappings[m.webnari_product_id] = [];
      }
      productMappings[m.webnari_product_id].push(m);
    }

    // If targeting specific product, filter
    const productIds = targetProductId
      ? [targetProductId]
      : Object.keys(productMappings);

    // Process 5 products per call — balances speed vs Worker timeout
    const maxProducts = 5;
    const toProcess = productIds.slice(skipCount, skipCount + maxProducts);
    let uploaded = 0;
    let failed = 0;
    const processed = [];

    for (const productId of toProcess) {
      const prodMappings = productMappings[productId];
      if (!prodMappings || !prodMappings.length) continue;

      // Get the Square parent item ID by batch-retrieving one variation
      const firstVariationId = prodMappings[0].external_id;
      let squareItemId = null;

      try {
        const batchRes = await fetch(`${getSquareBase(env)}/v2/catalog/batch-retrieve`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ object_ids: [firstVariationId] }),
        });
        const batchData = await batchRes.json();
        const obj = (batchData.objects || [])[0];
        if (obj?.type === 'ITEM_VARIATION') {
          squareItemId = obj.item_variation_data?.item_id;
        } else if (obj?.type === 'ITEM') {
          squareItemId = obj.id;
        }
      } catch (e) {
        console.error('Failed to resolve Square item ID:', e.message);
        failed++;
        continue;
      }

      if (!squareItemId) { failed++; continue; }

      // Get product info
      const products = await sb.query('products', {
        filters: { id: `eq.${productId}` },
      });
      const product = products[0];
      if (!product) { failed++; continue; }

      // Upload product images
      try {
        const productImages = await sb.query('product_images', {
          filters: { product_id: `eq.${productId}` },
          order: 'sort_order.asc',
        });

        for (const img of productImages.slice(0, 5)) {
          try {
            const imgRes = await fetch(img.url);
            if (!imgRes.ok) continue;
            const imgBlob = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

            const boundary = '----WebKitFormBoundary' + Date.now().toString(36);
            const imageJson = JSON.stringify({
              idempotency_key: `img-${img.id}-${Date.now()}`,
              object_id: squareItemId,
              image: {
                type: 'IMAGE',
                id: `#img-${img.id}`,
                image_data: {
                  name: img.alt || product.name,
                  caption: img.alt || '',
                },
              },
            });

            const encoder = new TextEncoder();
            const parts = [
              encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n${imageJson}\r\n`),
              encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="image.jpg"\r\nContent-Type: ${contentType}\r\n\r\n`),
              new Uint8Array(imgBlob),
              encoder.encode(`\r\n--${boundary}--\r\n`),
            ];

            const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
            const bodyBuf = new Uint8Array(totalLength);
            let offset = 0;
            for (const part of parts) {
              bodyBuf.set(part, offset);
              offset += part.byteLength;
            }

            const upRes = await fetch(`${getSquareBase(env)}/v2/catalog/images`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${integration.access_token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
              },
              body: bodyBuf,
            });

            if (upRes.ok) {
              uploaded++;
            } else {
              const errData = await upRes.json().catch(() => ({}));
              console.error('Image upload error:', JSON.stringify(errData));
              failed++;
            }
          } catch (imgErr) {
            console.error(`Image upload failed:`, imgErr.message);
            failed++;
          }
        }
      } catch (e) {
        // product_images table might not exist
        console.error('Product images query failed:', e.message);
      }

      // ── Upload variant-specific images ──
      // Find mappings that have a webnari_variant_id for this product
      const variantMappingsForProduct = prodMappings.filter(m => m.webnari_variant_id);
      for (const vm of variantMappingsForProduct) {
        try {
          const varImages = await sb.query('variant_images', {
            filters: { variant_id: `eq.${vm.webnari_variant_id}` },
            order: 'sort_order.asc',
          });

          for (const vimg of varImages.slice(0, 3)) { // Up to 3 images per variant
            try {
              const imgRes = await fetch(vimg.url);
              if (!imgRes.ok) continue;
              const imgBlob = await imgRes.arrayBuffer();
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

              const boundary = '----WebKitFormBoundary' + Date.now().toString(36);
              const imageJson = JSON.stringify({
                idempotency_key: `vimg-${vimg.id}-${Date.now()}`,
                object_id: vm.external_id, // Attach to the specific ITEM_VARIATION, not parent item
                image: {
                  type: 'IMAGE',
                  id: `#vimg-${vimg.id}`,
                  image_data: {
                    name: `${product.name} - ${vm.external_name?.split(' — ')[1] || 'Variant'}`,
                    caption: vm.external_name?.split(' — ')[1] || '',
                  },
                },
              });

              const encoder = new TextEncoder();
              const parts = [
                encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n${imageJson}\r\n`),
                encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="image.jpg"\r\nContent-Type: ${contentType}\r\n\r\n`),
                new Uint8Array(imgBlob),
                encoder.encode(`\r\n--${boundary}--\r\n`),
              ];

              const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
              const bodyBuf = new Uint8Array(totalLength);
              let offset = 0;
              for (const part of parts) {
                bodyBuf.set(part, offset);
                offset += part.byteLength;
              }

              const upRes = await fetch(`${getSquareBase(env)}/v2/catalog/images`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${integration.access_token}`,
                  'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
                body: bodyBuf,
              });

              if (upRes.ok) {
                uploaded++;
              } else {
                const errData = await upRes.json().catch(() => ({}));
                console.error('Variant image upload error:', JSON.stringify(errData));
                failed++;
              }
            } catch (vimgErr) {
              console.error(`Variant image upload failed:`, vimgErr.message);
              failed++;
            }
          }
        } catch (e) {
          // variant_images table might not exist or no images for this variant
        }
      }

      processed.push(product.name);
    }

    const remaining = productIds.length - (skipCount + toProcess.length);

    // No per-call sync_log — the frontend aggregates all batches
    // and the catalog_sync log entry covers the main sync

    return json({
      uploaded,
      failed,
      products_processed: processed,
      remaining_products: remaining,
      next_offset: remaining > 0 ? skipCount + toProcess.length : null,
    }, 200, corsOrigin);

  } catch (err) {
    console.error('Image sync error:', err);
    return json({ error: 'Image sync failed: ' + err.message }, 500, corsOrigin);
  }
}

// List product mappings
async function handleAdminListMappings(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const mappings = await sb.query('product_mappings', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  // Enrich with Webnari product names
  for (const m of mappings) {
    try {
      if (m.webnari_product_id) {
        const products = await sb.query('products', {
          filters: { id: `eq.${m.webnari_product_id}` },
        });
        const product = products[0];
        m.webnari_product_name = product?.name || 'Unknown';
        m.webnari_sku = product?.sku || null;
      } else {
        m.webnari_product_name = 'Unknown';
        m.webnari_sku = null;
      }

      if (m.webnari_variant_id) {
        const vlist = await sb.query('variants', {
          filters: { id: `eq.${m.webnari_variant_id}` },
        });
        const variant = vlist[0];
        m.webnari_variant_name = variant?.name || null;
        if (variant?.sku) m.webnari_sku = variant.sku;
      }
    } catch (err) {
      m.webnari_product_name = m.webnari_product_name || 'Unknown';
      m.webnari_sku = m.webnari_sku || null;
    }
  }

  return json(mappings, 200, corsOrigin);
}

// Create a manual product mapping
async function handleAdminCreateMapping(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.webnari_product_id || !body.external_id || !body.provider) {
    return json({ error: 'webnari_product_id, external_id, and provider are required' }, 400, corsOrigin);
  }

  const [mapping] = await sb.insert('product_mappings', {
    store_id: storeId,
    provider: body.provider,
    webnari_product_id: body.webnari_product_id,
    webnari_variant_id: body.webnari_variant_id || null,
    external_id: body.external_id,
    external_name: body.external_name || null,
    external_sku: body.external_sku || null,
    auto_sync: body.auto_sync !== false,
  });

  return json(mapping, 201, corsOrigin);
}

// Delete a product mapping
async function handleAdminDeleteAllMappings(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('product_mappings', { store_id: `eq.${storeId}` });

  return json({ deleted: true, all: true }, 200, corsOrigin);
}

async function handleAdminDeleteMapping(request, sb, env, storeId, mappingId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('product_mappings', { id: `eq.${mappingId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}

// View sync log
async function handleAdminSyncLog(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const logs = await sb.query('sync_log', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
    limit: 50,
  });

  return json(logs, 200, corsOrigin);
}

// Test QuickBooks connection by querying CompanyInfo
async function handleQuickBooksTest(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await getQuickBooksIntegration(sb, env, storeId);
  if (!integration) return json({ error: 'QuickBooks not connected' }, 404, corsOrigin);

  const apiBase = env.QUICKBOOKS_SANDBOX === 'true' ? QB_SANDBOX_API_BASE : QB_API_BASE;
  const res = await fetch(`${apiBase}/v3/company/${integration.realm_id}/companyinfo/${integration.realm_id}`, {
    headers: {
      Authorization: `Bearer ${integration.access_token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return json({ error: 'Connection test failed', details: err }, 500, corsOrigin);
  }

  const data = await res.json();
  return json({
    connected: true,
    companyName: data.CompanyInfo?.CompanyName,
    companyId: integration.realm_id,
  }, 200, corsOrigin);
}

// Get QB sync log
async function handleQuickBooksSyncLog(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const logs = await sb.query('sync_log', {
    filters: { store_id: `eq.${storeId}`, provider: `eq.quickbooks` },
    order: 'created_at.desc',
    limit: 50,
  });

  return json(logs, 200, corsOrigin);
}

// ── Square Inventory Webhook ─────────────────────────────

async function handleSquareInventoryWebhook(request, sb, env, corsOrigin) {
  const body = await request.text();
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsOrigin);
  }

  const eventType = event.type;

  // We handle inventory.count.updated and payment.completed
  if (eventType === 'inventory.count.updated') {
    const counts = event.data?.object?.inventory_counts;
    if (!counts || counts.length === 0) return json({ received: true }, 200, corsOrigin);

    for (const count of counts) {
      const catalogObjId = count.catalog_object_id;
      const locationId = count.location_id;
      const newQuantity = parseInt(count.quantity, 10) || 0;

      // Find the mapping for this Square catalog object
      const mappings = await sb.query('product_mappings', {
        filters: { provider: 'eq.square', external_id: `eq.${catalogObjId}` },
      });

      for (const mapping of mappings) {
        // Verify webhook signature if we have a key
        const sigKey = env.SQUARE_WEBHOOK_SIGNATURE_KEY;
        if (sigKey) {
          const sigHeader = request.headers.get('x-square-hmacsha256-signature');
          if (sigHeader) {
            const isValid = await verifySquareSignature(body, sigHeader, sigKey, request.url);
            if (!isValid) return json({ error: 'Invalid signature' }, 401, corsOrigin);
          }
        }

        if (!mapping.auto_sync) continue;

        // Update Webnari inventory
        try {
          if (mapping.webnari_variant_id) {
            await sb.update('variants',
              { id: `eq.${mapping.webnari_variant_id}` },
              { stock_quantity: Math.max(0, newQuantity) }
            );
          } else {
            await sb.update('products',
              { id: `eq.${mapping.webnari_product_id}` },
              { stock_quantity: Math.max(0, newQuantity) }
            );
          }

          // Log the sync
          await sb.insert('sync_log', {
            store_id: mapping.store_id,
            provider: 'square',
            direction: 'inbound',
            event_type: 'inventory_update',
            details: `Stock updated to ${newQuantity} for ${mapping.external_name || catalogObjId}`,
            status: 'success',
          });
        } catch (err) {
          console.error('Square inventory sync error:', err);
          await sb.insert('sync_log', {
            store_id: mapping.store_id,
            provider: 'square',
            direction: 'inbound',
            event_type: 'inventory_update',
            details: `Failed to update stock for ${mapping.external_name || catalogObjId}`,
            status: 'error',
            error: err.message,
          });
        }
      }
    }
  }

  if (eventType === 'payment.completed') {
    const payment = event.data?.object?.payment;
    if (!payment) return json({ received: true }, 200, corsOrigin);

    const locationId = payment.location_id;
    if (!locationId) return json({ received: true }, 200, corsOrigin);

    // Find the store with this Square location
    const integration = await sb.query('store_integrations', {
      filters: { provider: 'eq.square', location_id: `eq.${locationId}` },
      single: true,
    });

    if (!integration) return json({ received: true }, 200, corsOrigin);

    // Verify signature
    const sigKey = env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (sigKey) {
      const sigHeader = request.headers.get('x-square-hmacsha256-signature');
      if (sigHeader) {
        const isValid = await verifySquareSignature(body, sigHeader, sigKey, request.url);
        if (!isValid) return json({ error: 'Invalid signature' }, 401, corsOrigin);
      }
    }

    // Get the Square order line items to find which products were sold
    const orderId = payment.order_id;
    if (orderId) {
      try {
        const orderRes = await fetch(`${getSquareBase(env)}/v2/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        });
        const orderData = await orderRes.json();

        if (orderData.order && orderData.order.line_items) {
          for (const lineItem of orderData.order.line_items) {
            const catalogObjId = lineItem.catalog_object_id;
            if (!catalogObjId) continue;

            const mapping = await sb.query('product_mappings', {
              filters: {
                store_id: `eq.${integration.store_id}`,
                provider: 'eq.square',
                external_id: `eq.${catalogObjId}`,
              },
              single: true,
            });

            if (mapping && mapping.auto_sync) {
              const qtySold = parseInt(lineItem.quantity, 10) || 1;

              // Decrement Webnari stock
              if (mapping.webnari_variant_id) {
                const variant = await sb.query('variants', {
                  filters: { id: `eq.${mapping.webnari_variant_id}` },
                  single: true,
                });
                if (variant) {
                  await sb.update('variants',
                    { id: `eq.${mapping.webnari_variant_id}` },
                    { stock_quantity: Math.max(0, variant.stock_quantity - qtySold) }
                  );
                }
              } else {
                const product = await sb.query('products', {
                  filters: { id: `eq.${mapping.webnari_product_id}` },
                  single: true,
                });
                if (product) {
                  await sb.update('products',
                    { id: `eq.${mapping.webnari_product_id}` },
                    { stock_quantity: Math.max(0, product.stock_quantity - qtySold) }
                  );
                }
              }

              await sb.insert('sync_log', {
                store_id: integration.store_id,
                provider: 'square',
                direction: 'inbound',
                event_type: 'pos_sale',
                details: `POS sale: ${qtySold}x ${mapping.external_name || catalogObjId} — stock decremented`,
                status: 'success',
              });
            }
          }
        }
      } catch (err) {
        console.error('Square POS sale sync error:', err);
        await sb.insert('sync_log', {
          store_id: integration.store_id,
          provider: 'square',
          direction: 'inbound',
          event_type: 'pos_sale',
          details: 'Failed to process POS sale',
          status: 'error',
          error: err.message,
        });
      }
    }
  }

  return json({ received: true }, 200, corsOrigin);
}

// ── Square Outbound Helpers ──────────────────────────────

// Push inventory count to Square
async function pushInventoryToSquare(env, integration, catalogObjectId, quantity) {
  try {
    await fetch(`${getSquareBase(env)}/v2/inventory/changes/batch-create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: `inv-${catalogObjectId}-${Date.now()}`,
        changes: [{
          type: 'PHYSICAL_COUNT',
          physical_count: {
            catalog_object_id: catalogObjectId,
            location_id: integration.location_id,
            quantity: String(quantity),
            state: 'IN_STOCK',
            occurred_at: new Date().toISOString(),
          },
        }],
      }),
    });
  } catch (err) {
    console.error('Push inventory to Square failed:', err);
  }
}

// Push a new product to Square catalog (called after product create)
async function pushProductToSquare(sb, env, storeId, product) {
  const integration = await getSquareIntegration(sb, env, storeId);
  if (!integration) return;

  // Check if already mapped
  const existing = await sb.query('product_mappings', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.square', webnari_product_id: `eq.${product.id}` },
    single: true,
  });
  if (existing) return;

  try {
    const idempotencyKey = `webnari-${product.id}-${Date.now()}`;
    const res = await fetch(`${getSquareBase(env)}/v2/catalog/object`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        object: {
          type: 'ITEM',
          id: `#webnari-${product.id}`,
          item_data: {
            name: product.name,
            description: product.description || '',
            variations: [{
              type: 'ITEM_VARIATION',
              id: `#webnari-var-${product.id}`,
              item_variation_data: {
                item_id: `#webnari-${product.id}`,
                name: 'Default',
                sku: product.sku || undefined,
                pricing_type: 'FIXED_PRICING',
                price_money: { amount: product.price || 0, currency: 'USD' },
              },
            }],
          },
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data.catalog_object) {
      const createdVariation = data.catalog_object.item_data?.variations?.[0];
      if (createdVariation) {
        await sb.insert('product_mappings', {
          store_id: storeId,
          provider: 'square',
          webnari_product_id: product.id,
          webnari_variant_id: null,
          external_id: createdVariation.id,
          external_name: `${product.name} — Default`,
          external_sku: product.sku || null,
          auto_sync: true,
        });

        if (product.stock_quantity > 0 && integration.location_id) {
          await pushInventoryToSquare(env, integration, createdVariation.id, product.stock_quantity);
        }

        await sb.insert('sync_log', {
          store_id: storeId,
          provider: 'square',
          direction: 'outbound',
          event_type: 'product_created',
          details: `Auto-pushed "${product.name}" to Square catalog`,
          status: 'success',
        });
      }
    }
  } catch (err) {
    console.error('Auto-push product to Square failed:', err);
  }
}

// Push inventory change to Square after a Webnari sale
async function pushSaleToSquare(sb, env, storeId, productId, variantId, qtySold) {
  const integration = await getSquareIntegration(sb, env, storeId);
  if (!integration || !integration.location_id) return;

  // Find the mapping
  const filters = {
    store_id: `eq.${storeId}`,
    provider: 'eq.square',
    webnari_product_id: `eq.${productId}`,
  };
  if (variantId) filters.webnari_variant_id = `eq.${variantId}`;

  const mapping = await sb.query('product_mappings', { filters, single: true });
  if (!mapping || !mapping.auto_sync) return;

  try {
    await fetch(`${getSquareBase(env)}/v2/inventory/changes/batch-create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: `sale-${productId}-${Date.now()}`,
        changes: [{
          type: 'ADJUSTMENT',
          adjustment: {
            catalog_object_id: mapping.external_id,
            location_id: integration.location_id,
            quantity: String(-qtySold),
            from_state: 'IN_STOCK',
            to_state: 'SOLD',
            occurred_at: new Date().toISOString(),
          },
        }],
      }),
    });

    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'square',
      direction: 'outbound',
      event_type: 'inventory_adjustment',
      details: `Online sale: ${qtySold}x ${mapping.external_name || productId} — Square stock decremented`,
      status: 'success',
    });
  } catch (err) {
    console.error('Push sale to Square failed:', err);
    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'square',
      direction: 'outbound',
      event_type: 'inventory_adjustment',
      details: `Failed to sync sale to Square for ${mapping.external_name || productId}`,
      status: 'error',
      error: err.message,
    });
  }
}

// ── Square Token Refresh Helper ──────────────────────────

async function getSquareIntegration(sb, env, storeId) {
  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.square' },
    single: true,
  });

  if (!integration) return null;

  // Check if token needs refresh (refresh 24h before expiry)
  if (integration.token_expires_at && integration.refresh_token) {
    const expiresAt = new Date(integration.token_expires_at).getTime();
    const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours

    if (Date.now() > expiresAt - refreshThreshold) {
      try {
        const res = await fetch(`${getSquareBase(env)}/oauth2/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: env.SQUARE_APP_ID,
            client_secret: env.SQUARE_APP_SECRET,
            refresh_token: integration.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const data = await res.json();
        if (res.ok && data.access_token) {
          integration.access_token = data.access_token;
          if (data.refresh_token) integration.refresh_token = data.refresh_token;

          await sb.update('store_integrations',
            { store_id: `eq.${storeId}`, provider: 'eq.square' },
            {
              access_token: data.access_token,
              refresh_token: data.refresh_token || integration.refresh_token,
              token_expires_at: data.expires_at || null,
              updated_at: new Date().toISOString(),
            }
          );
        }
      } catch (err) {
        console.error('Square token refresh failed:', err);
      }
    }
  }

  return integration;
}

// ── QuickBooks Helpers ──────────────────────────────────

// Get integration with auto-refresh
async function getQuickBooksIntegration(sb, env, storeId) {
  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: `eq.quickbooks` },
    single: true,
  });

  if (!integration) return null;

  // Check if token needs refresh (within 5 min of expiry)
  const expiresAt = new Date(integration.token_expires_at).getTime();
  const fiveMinFromNow = Date.now() + 5 * 60 * 1000;

  if (expiresAt < fiveMinFromNow) {
    const refreshed = await refreshQuickBooksToken(sb, env, integration);
    if (refreshed) return refreshed;
  }

  return integration;
}

// Refresh QuickBooks OAuth token
async function refreshQuickBooksToken(sb, env, integration) {
  const clientId = env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = env.QUICKBOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret || !integration.refresh_token) return null;

  try {
    const res = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refresh_token,
      }).toString(),
    });

    const tokens = await res.json();
    if (!res.ok) {
      console.error('QB token refresh failed:', JSON.stringify(tokens));
      return null;
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();
    const refreshExpiresAt = new Date(Date.now() + (tokens.x_refresh_token_expires_in || 8726400) * 1000).toISOString();

    await sb.update('store_integrations',
      { id: `eq.${integration.id}` },
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        metadata: { ...integration.metadata, refresh_expires_at: refreshExpiresAt },
        updated_at: new Date().toISOString(),
      }
    );

    return { ...integration, access_token: tokens.access_token, token_expires_at: expiresAt };
  } catch (err) {
    console.error('QB token refresh error:', err);
    return null;
  }
}

// Sync a completed order to QuickBooks as a SalesReceipt
async function syncOrderToQuickBooks(sb, env, storeId, order, orderItems) {
  let integration;
  try {
    integration = await getQuickBooksIntegration(sb, env, storeId);
  } catch { /* silent if no integration */ }
  if (!integration) return; // QB not connected, skip
  if (!orderItems || orderItems.length === 0) return; // No items to sync

  const apiBase = env.QUICKBOOKS_SANDBOX === 'true' ? QB_SANDBOX_API_BASE : QB_API_BASE;
  const realmId = integration.realm_id;
  const headers = {
    Authorization: `Bearer ${integration.access_token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // 1. Find or create customer by email
    let customerId = null;
    if (order.customer_email) {
      const qbCustomers = await fetch(
        `${apiBase}/v3/company/${realmId}/query?query=${encodeURIComponent(`SELECT * FROM Customer WHERE PrimaryEmailAddr = '${(order.customer_email || '').replace(/'/g, "\\'")}'`)}`,
        { headers }
      );
      const custData = await qbCustomers.json();
      const existing = custData.QueryResponse?.Customer?.[0];

      if (existing) {
        customerId = existing.Id;
      } else {
        // Create customer
        const createRes = await fetch(`${apiBase}/v3/company/${realmId}/customer`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            DisplayName: order.customer_name || order.customer_email,
            PrimaryEmailAddr: { Address: order.customer_email },
          }),
        });
        if (createRes.ok) {
          const newCust = await createRes.json();
          customerId = newCust.Customer?.Id;

          await sb.insert('sync_log', {
            store_id: storeId,
            provider: 'quickbooks',
            event_type: 'customer_created',
            direction: 'outbound',
            status: 'success',
            details: JSON.stringify({ customer_email: order.customer_email, qb_customer_id: customerId }),
          });
        }
      }
    }

    // 2. Build SalesReceipt line items
    const lines = orderItems.map((item, i) => ({
      LineNum: i + 1,
      Amount: (item.price * item.quantity) / 100, // cents → dollars
      DetailType: 'SalesItemLineDetail',
      Description: item.variant_name ? `${item.product_name} — ${item.variant_name}` : item.product_name,
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: item.price / 100,
      },
    }));

    // Add shipping line if > 0
    if (order.shipping > 0) {
      lines.push({
        LineNum: lines.length + 1,
        Amount: order.shipping / 100,
        DetailType: 'SalesItemLineDetail',
        Description: 'Shipping',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: order.shipping / 100,
        },
      });
    }

    // Add tax line if > 0
    if (order.tax > 0) {
      lines.push({
        LineNum: lines.length + 1,
        Amount: order.tax / 100,
        DetailType: 'SalesItemLineDetail',
        Description: 'Sales Tax',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: order.tax / 100,
        },
      });
    }

    // 3. Create SalesReceipt
    const receipt = {
      Line: lines,
      PrivateNote: `Webnari Order #${order.order_number}`,
      DocNumber: order.order_number,
    };

    if (customerId) {
      receipt.CustomerRef = { value: customerId };
    }

    const receiptRes = await fetch(`${apiBase}/v3/company/${realmId}/salesreceipt`, {
      method: 'POST',
      headers,
      body: JSON.stringify(receipt),
    });

    const receiptData = await receiptRes.json();

    if (receiptRes.ok) {
      await sb.insert('sync_log', {
        store_id: storeId,
        provider: 'quickbooks',
        event_type: 'order_synced',
        direction: 'outbound',
        status: 'success',
        details: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          qb_receipt_id: receiptData.SalesReceipt?.Id,
          total: order.total / 100,
        }),
      });
    } else {
      await sb.insert('sync_log', {
        store_id: storeId,
        provider: 'quickbooks',
        event_type: 'order_synced',
        direction: 'outbound',
        status: 'error',
        details: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          error: receiptData.Fault?.Error?.[0]?.Detail || 'Unknown error',
        }),
      });
    }
  } catch (err) {
    console.error('QB sync error:', err);
    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'quickbooks',
      event_type: 'order_synced',
      direction: 'outbound',
      status: 'error',
      details: JSON.stringify({ order_id: order.id, error: err.message }),
    });
  }
}


// ═══════════════════════════════════════════════════════════════
//  STRIPE CONNECT
// ═══════════════════════════════════════════════════════════════

// Start Stripe Connect — creates a connected account + onboarding link (Account Links flow)
async function handleStripeConnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return json({ error: 'Stripe not configured — missing STRIPE_SECRET_KEY' }, 500, corsOrigin);

  const stripeHeaders = {
    Authorization: `Bearer ${stripeSecret}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const adminBase = 'https://webnari-store-admin.webnari.workers.dev';
  const returnUrl = `${adminBase}/${storeId}/integrations?stripe_return=true`;
  const refreshUrl = `${adminBase}/${storeId}/integrations?stripe_refresh=true`;

  try {
    // Check if there's already a pending/incomplete connected account for this store
    const existing = await sb.query('store_integrations', {
      filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
      single: true,
    });

    let stripeAccountId;

    if (existing?.merchant_id) {
      // Re-use existing connected account (might need to finish onboarding)
      stripeAccountId = existing.merchant_id;
    } else {
      // Create a new connected account (Standard type — gets their own Stripe dashboard)
      const createRes = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: stripeHeaders,
        body: new URLSearchParams({
          type: 'standard',
          'metadata[store_id]': storeId,
          'metadata[platform]': 'webnari',
        }).toString(),
      });

      const account = await createRes.json();
      if (!createRes.ok) {
        console.error('Stripe account creation failed:', account);
        return json({ error: 'Failed to create Stripe account', details: account.error?.message }, 500, corsOrigin);
      }

      stripeAccountId = account.id;

      // Save the connected account ID immediately (onboarding may not be complete yet)
      await sb.insert('store_integrations', {
        store_id: storeId,
        provider: 'stripe',
        merchant_id: stripeAccountId,
        company_name: '',
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        settings: {},
        metadata: { onboarding_complete: false },
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Create an Account Link for Stripe-hosted onboarding
    const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: stripeHeaders,
      body: new URLSearchParams({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      }).toString(),
    });

    const link = await linkRes.json();
    if (!linkRes.ok) {
      console.error('Stripe account link failed:', link);
      return json({ error: 'Failed to create onboarding link', details: link.error?.message }, 500, corsOrigin);
    }

    return json({ url: link.url }, 200, corsOrigin);

  } catch (err) {
    console.error('Stripe Connect error:', err);
    return json({ error: 'Stripe Connect failed', details: err.message }, 500, corsOrigin);
  }
}

// Stripe Connect callback — called when store returns from onboarding, checks account status
async function handleStripeConnectCallback(request, sb, env, url, corsOrigin) {
  // Account Links flow: the return/refresh URLs go directly to the admin frontend
  // This callback route is kept for backward compatibility but redirects to the admin
  const adminBase = 'https://webnari-store-admin.webnari.workers.dev';
  return Response.redirect(`${adminBase}?stripe_return=true`, 302);
}

// Check Stripe onboarding status — called when store returns from Stripe onboarding
async function handleStripeOnboardingStatus(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return json({ error: 'Stripe not configured' }, 500, corsOrigin);

  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });

  if (!integration) return json({ error: 'No Stripe integration found' }, 404, corsOrigin);

  // Fetch the account to check onboarding status
  const acctRes = await fetch(`https://api.stripe.com/v1/accounts/${integration.merchant_id}`, {
    headers: { Authorization: `Bearer ${stripeSecret}` },
  });

  if (!acctRes.ok) {
    return json({ error: 'Failed to fetch account status' }, 502, corsOrigin);
  }

  const acct = await acctRes.json();
  // In sandbox, charges_enabled may not flip immediately even after details are submitted
  // Treat details_submitted as sufficient for onboarding completion
  const isComplete = acct.details_submitted;
  const accountName = acct.business_profile?.name
    || acct.settings?.dashboard?.display_name
    || acct.email
    || '';

  // Update integration record with onboarding status
  await sb.update('store_integrations', { id: `eq.${integration.id}` }, {
    company_name: accountName || integration.company_name,
    metadata: {
      ...(integration.metadata || {}),
      onboarding_complete: isComplete,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      details_submitted: acct.details_submitted,
    },
    updated_at: new Date().toISOString(),
  });

  // Log connection if onboarding just completed
  if (isComplete && !integration.metadata?.onboarding_complete) {
    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'stripe',
      event_type: 'connected',
      direction: 'system',
      status: 'success',
      details: JSON.stringify({ account_id: integration.merchant_id, account_name: accountName }),
    });
  }

  return json({
    accountId: integration.merchant_id,
    accountName,
    chargesEnabled: acct.charges_enabled,
    payoutsEnabled: acct.payouts_enabled,
    detailsSubmitted: acct.details_submitted,
    onboardingComplete: isComplete,
  }, 200, corsOrigin);
}

// Disconnect Stripe Connect
async function handleStripeDisconnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });

  if (!integration) return json({ error: 'Stripe not connected' }, 404, corsOrigin);

  // Delete the connected account at Stripe (optional — removes it entirely)
  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (stripeSecret && integration.merchant_id) {
    try {
      await fetch(`https://api.stripe.com/v1/accounts/${integration.merchant_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${stripeSecret}` },
      });
    } catch { /* best effort — account may already be deleted */ }
  }

  // Clean up mappings
  await sb.delete('product_mappings', {
    store_id: `eq.${storeId}`,
    provider: 'eq.stripe',
  });

  // Delete integration record
  await sb.delete('store_integrations', { id: `eq.${integration.id}` });

  // Log disconnection
  await sb.insert('sync_log', {
    store_id: storeId,
    provider: 'stripe',
    event_type: 'disconnected',
    direction: 'system',
    status: 'success',
    details: JSON.stringify({ account_id: integration.merchant_id }),
  });

  return json({ disconnected: true }, 200, corsOrigin);
}

// Test Stripe Connect — verify the connected account is reachable
async function handleStripeTest(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });

  if (!integration) return json({ error: 'Stripe not connected' }, 404, corsOrigin);

  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return json({ error: 'Platform Stripe key not configured' }, 500, corsOrigin);

  try {
    const res = await fetch(`https://api.stripe.com/v1/accounts/${integration.merchant_id}`, {
      headers: { Authorization: `Bearer ${stripeSecret}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return json({ error: 'Connection test failed', details: err }, 500, corsOrigin);
    }

    const acct = await res.json();
    return json({
      connected: true,
      accountName: acct.business_profile?.name || acct.settings?.dashboard?.display_name || acct.email,
      accountId: integration.merchant_id,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
    }, 200, corsOrigin);
  } catch (err) {
    return json({ error: 'Connection test failed', details: err.message }, 500, corsOrigin);
  }
}

// Sync products between Webnari and Stripe connected account
async function handleStripeSyncProducts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const integration = await sb.query('store_integrations', {
    filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    single: true,
  });

  if (!integration) return json({ error: 'Stripe not connected' }, 400, corsOrigin);

  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return json({ error: 'Platform Stripe key not configured' }, 500, corsOrigin);

  const stripeAccountId = integration.merchant_id;
  const stripeHeaders = {
    Authorization: `Bearer ${stripeSecret}`,
    'Stripe-Account': stripeAccountId,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    // Parse options
    const body = await request.text();
    const opts = body ? JSON.parse(body) : {};
    const freshSync = opts.fresh === true;

    if (freshSync) {
      // Clear existing Stripe mappings
      await sb.delete('product_mappings', {
        store_id: `eq.${storeId}`,
        provider: 'eq.stripe',
      });
    }

    // ── STEP 1: Pull Stripe catalog ──────────────────────
    let allStripeProducts = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params = new URLSearchParams({ limit: '100', active: 'true' });
      if (startingAfter) params.set('starting_after', startingAfter);

      const res = await fetch(`https://api.stripe.com/v1/products?${params}`, {
        headers: { Authorization: `Bearer ${stripeSecret}`, 'Stripe-Account': stripeAccountId },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(`Stripe product fetch failed: ${res.status} — ${data.error?.message || 'unknown'}`);

      allStripeProducts = allStripeProducts.concat(data.data || []);
      hasMore = data.has_more || false;
      if (data.data?.length > 0) startingAfter = data.data[data.data.length - 1].id;
    }

    // Fetch default price for each Stripe product
    const stripeProductPrices = {};
    for (const sp of allStripeProducts) {
      if (sp.default_price) {
        try {
          const priceRes = await fetch(`https://api.stripe.com/v1/prices/${sp.default_price}`, {
            headers: { Authorization: `Bearer ${stripeSecret}`, 'Stripe-Account': stripeAccountId },
          });
          if (priceRes.ok) {
            stripeProductPrices[sp.id] = await priceRes.json();
          }
        } catch { /* skip */ }
      }
    }

    // ── STEP 2: Get Webnari products + existing mappings ─
    const products = await sb.query('products', {
      filters: { store_id: `eq.${storeId}` },
    });

    let variants = [];
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      variants = await sb.query('variants', {
        filters: { product_id: `in.(${productIds.join(',')})` },
      });
    }

    const existingMappings = await sb.query('product_mappings', {
      filters: { store_id: `eq.${storeId}`, provider: 'eq.stripe' },
    });

    const mappedExternalIds = new Set(existingMappings.map(m => m.external_id));
    const mappedWebnariIds = new Set(existingMappings.map(m => m.webnari_product_id));

    // ── STEP 3: Match Stripe products to Webnari by SKU ──
    let newMappings = 0;
    let skipped = 0;

    for (const sp of allStripeProducts) {
      if (mappedExternalIds.has(sp.id)) { skipped++; continue; }

      const stripeSku = sp.metadata?.sku || sp.metadata?.webnari_sku || '';
      if (!stripeSku) continue;

      // Find matching Webnari product by SKU
      const matchProduct = products.find(p => p.sku && p.sku.toLowerCase() === stripeSku.toLowerCase());
      if (matchProduct && !mappedWebnariIds.has(matchProduct.id)) {
        await sb.insert('product_mappings', {
          store_id: storeId,
          provider: 'stripe',
          webnari_product_id: matchProduct.id,
          webnari_variant_id: null,
          external_id: sp.id,
          external_name: sp.name,
          external_sku: stripeSku,
          auto_sync: true,
        });
        newMappings++;
        mappedWebnariIds.add(matchProduct.id);
        mappedExternalIds.add(sp.id);
      }
    }

    // ── STEP 4: Push unmapped Webnari products to Stripe ─
    let pushed = 0;

    for (const product of products) {
      if (mappedWebnariIds.has(product.id)) continue;

      // Create product on connected account
      const productParams = new URLSearchParams();
      productParams.set('name', product.name);
      if (product.description) productParams.set('description', product.description.slice(0, 500));
      if (product.sku) productParams.set('metadata[sku]', product.sku);
      productParams.set('metadata[webnari_id]', product.id);

      // Add first image if available
      if (product.images?.length > 0) {
        productParams.set('images[0]', product.images[0]);
      }

      const createRes = await fetch('https://api.stripe.com/v1/products', {
        method: 'POST',
        headers: stripeHeaders,
        body: productParams.toString(),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        console.error(`Failed to create Stripe product for ${product.name}:`, created.error?.message);
        continue;
      }

      // Create a default price
      const priceParams = new URLSearchParams();
      priceParams.set('product', created.id);
      priceParams.set('unit_amount', (product.price || 0).toString());
      priceParams.set('currency', 'usd');

      const priceRes = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: stripeHeaders,
        body: priceParams.toString(),
      });

      const priceData = await priceRes.json();

      // Set as default price
      if (priceRes.ok) {
        await fetch(`https://api.stripe.com/v1/products/${created.id}`, {
          method: 'POST',
          headers: stripeHeaders,
          body: new URLSearchParams({ default_price: priceData.id }).toString(),
        });
      }

      // Create mapping
      await sb.insert('product_mappings', {
        store_id: storeId,
        provider: 'stripe',
        webnari_product_id: product.id,
        webnari_variant_id: null,
        external_id: created.id,
        external_name: created.name,
        external_sku: product.sku || null,
        auto_sync: true,
      });

      pushed++;
    }

    // Log sync
    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'stripe',
      event_type: 'catalog_sync',
      direction: 'outbound',
      status: 'success',
      details: JSON.stringify({
        stripe_products_found: allStripeProducts.length,
        matched_by_sku: newMappings,
        pushed_to_stripe: pushed,
        skipped_existing: skipped,
        total_webnari_products: products.length,
      }),
    });

    return json({
      synced: true,
      stripeProductsFound: allStripeProducts.length,
      matchedBySku: newMappings,
      pushedToStripe: pushed,
      skippedExisting: skipped,
    }, 200, corsOrigin);

  } catch (err) {
    console.error('Stripe sync error:', err);

    await sb.insert('sync_log', {
      store_id: storeId,
      provider: 'stripe',
      event_type: 'catalog_sync',
      direction: 'outbound',
      status: 'error',
      details: JSON.stringify({ error: err.message }),
    });

    return json({ error: 'Sync failed', details: err.message }, 500, corsOrigin);
  }
}
