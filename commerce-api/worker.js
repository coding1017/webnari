// ═══════════════════════════════════════════════════════════════
// Webnari Commerce API — Cloudflare Worker
// Multi-tenant e-commerce backend: checkout, payments, inventory,
// orders, shipping, tax, SEO — for all Webnari store templates.
//
// Routes:
//   GET  /api/products                — List all products (public)
//   GET  /api/products/featured       — Featured products (public)
//   GET  /api/products/:id            — Get single product (public)
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
//
//  SEO (no X-Store-ID — resolve via Host / ?store= / header):
//   GET  /robots.txt                  — Dynamic robots.txt
//   GET  /sitemap.xml                 — Sitemap index
//   GET  /sitemap-products.xml        — Product sitemap
//   GET  /sitemap-categories.xml      — Category sitemap
//   GET  /sitemap-blog.xml            — Blog sitemap
//   GET  /sitemap-pages.xml           — Static pages sitemap
//   GET  /sitemap-images.xml          — Image sitemap
//   GET  /api/seo/meta                — Meta tags for any page
//   GET  /api/seo/structured-data     — JSON-LD structured data
//   GET  /api/admin/seo/health        — SEO health audit (admin)
//
//  Webhooks (admin):
//   GET  /api/admin/webhooks           — List webhook endpoints
//   POST /api/admin/webhooks           — Create webhook endpoint
//   GET  /api/admin/webhooks/:id       — Get webhook endpoint
//   PATCH /api/admin/webhooks/:id      — Update webhook endpoint
//   DELETE /api/admin/webhooks/:id     — Delete webhook endpoint
//   GET  /api/admin/webhooks/:id/deliveries — Delivery log
//   POST /api/admin/webhooks/:id/test  — Send test event
//   GET  /api/admin/webhook-events     — List available events
//
//  App Ecosystem (admin):
//   GET  /api/admin/apps               — List apps + install status
//   POST /api/admin/apps/install       — Install an app
//   DELETE /api/admin/apps/:id/uninstall — Uninstall an app
//   PATCH /api/admin/apps/:id/config   — Update app config
//
//  GA4 Integration (admin):
//   POST /api/admin/integrations/ga4/configure   — Connect GA4
//   DELETE /api/admin/integrations/ga4/disconnect — Disconnect GA4
//   POST /api/admin/integrations/ga4/test        — Test GA4 event
//
//  Twilio SMS Integration (admin):
//   POST /api/admin/integrations/twilio/configure   — Connect Twilio
//   DELETE /api/admin/integrations/twilio/disconnect — Disconnect Twilio
//   POST /api/admin/integrations/twilio/test        — Test SMS
//   PATCH /api/admin/integrations/twilio/settings   — Update settings
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

    // Webhooks and invoice pages don't need X-Store-ID (store is in the payload/order)
    const isWebhook = path.includes('/webhook/');
    const isInvoice = path.match(/^\/api\/orders\/[^/]+\/invoice$/);

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

      // ── SEO Routes (no X-Store-ID required — crawlers use Host or ?store=) ──
      if (method === 'GET' && path === '/robots.txt') {
        return await handleRobotsTxt(request, sb);
      }
      if (method === 'GET' && path === '/sitemap.xml') {
        return await handleSitemapIndex(request, sb);
      }
      if (method === 'GET' && path === '/sitemap-products.xml') {
        return await handleProductSitemap(request, sb);
      }
      if (method === 'GET' && path === '/sitemap-categories.xml') {
        return await handleCategorySitemap(request, sb);
      }
      if (method === 'GET' && path === '/sitemap-blog.xml') {
        return await handleBlogSitemap(request, sb);
      }
      if (method === 'GET' && path === '/sitemap-pages.xml') {
        return await handlePagesSitemap(request, sb);
      }
      if (method === 'GET' && path === '/sitemap-images.xml') {
        return await handleImageSitemap(request, sb);
      }

      // All other /api/ routes require X-Store-ID (except webhooks)
      if (!storeId && !isWebhook && !isInvoice && path.startsWith('/api/')) {
        return json({ error: 'Missing X-Store-ID header' }, 400, corsOrigin);
      }

      // Store config
      if (method === 'GET' && path === '/api/store/config') {
        return await handleGetStoreConfig(sb, storeId, corsOrigin);
      }

      // ── Public Product Endpoints ───────────────────────────
      if (method === 'GET' && path === '/api/products/featured') {
        return await handlePublicFeaturedProducts(sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path === '/api/products') {
        return await handlePublicListProducts(sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/products\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handlePublicGetProduct(sb, storeId, productId, corsOrigin);
      }

      // Digital downloads
      if (method === 'GET' && path.match(/^\/api\/download\/[^/]+$/)) {
        const token = path.split('/').pop();
        return await handleDigitalDownload(sb, env, storeId, token, corsOrigin);
      }

      // Product feeds (Google Merchant / Meta)
      if (method === 'GET' && path === '/api/feeds/google-merchant') {
        return await handleGoogleMerchantFeed(sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path === '/api/feeds/meta-catalog') {
        return await handleMetaCatalogFeed(sb, storeId, url, corsOrigin);
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
      if (method === 'POST' && path === '/api/checkout/paypal/capture') {
        return await handlePayPalCapture(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/checkout/webhook/paypal') {
        return await handlePayPalWebhook(request, sb, env, corsOrigin);
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
      if (method === 'POST' && path === '/api/orders') {
        return await handleAdminCreateOrder(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/orders\/[^/]+$/)) {
        const orderId = path.split('/').pop();
        return await handleUpdateOrder(request, sb, env, storeId, orderId, corsOrigin);
      }
      if (method === 'POST' && path.match(/^\/api\/orders\/[^/]+\/label$/)) {
        const orderId = path.split('/')[3];
        return await handlePurchaseLabel(request, sb, env, storeId, orderId, corsOrigin);
      }

      // Fulfillments (split fulfillment)
      if (method === 'GET' && path.match(/^\/api\/orders\/[^/]+\/fulfillments$/)) {
        const orderId = path.split('/')[3];
        return await handleListFulfillments(request, sb, env, storeId, orderId, corsOrigin);
      }
      if (method === 'POST' && path.match(/^\/api\/orders\/[^/]+\/fulfillments$/)) {
        const orderId = path.split('/')[3];
        return await handleCreateFulfillment(request, sb, env, storeId, orderId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/fulfillments\/[^/]+$/)) {
        const fulfillmentId = path.split('/').pop();
        return await handleUpdateFulfillment(request, sb, env, storeId, fulfillmentId, corsOrigin);
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
      if (method === 'POST' && path === '/api/shipping/rates') {
        return await handleShippingRates(request, sb, env, storeId, corsOrigin);
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

      // Admin Tags
      if (method === 'GET' && path === '/api/admin/tags') {
        return await handleAdminListTags(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path.match(/^\/api\/admin\/products\/[^/]+\/tags$/)) {
        const productId = path.split('/')[4];
        return await handleAdminSetProductTags(request, sb, env, storeId, productId, corsOrigin);
      }

      // Admin Staff
      if (method === 'GET' && path === '/api/admin/staff') {
        return await handleAdminListStaff(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/staff') {
        return await handleAdminCreateStaff(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/staff\/[^/]+$/)) {
        const staffId = path.split('/').pop();
        return await handleAdminUpdateStaff(request, sb, env, storeId, staffId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/staff\/[^/]+$/)) {
        const staffId = path.split('/').pop();
        return await handleAdminDeleteStaff(request, sb, env, storeId, staffId, corsOrigin);
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
        if (card.expires_at && new Date(card.expires_at) < new Date()) {
          return json({ error: 'Gift card has expired' }, 400, corsOrigin);
        }
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
      if (method === 'GET' && path === '/api/admin/store') {
        return await handleAdminGetStore(request, sb, env, storeId, corsOrigin);
      }
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

      // ── Tax Rate Bulk Audit (admin) ─────────────────────────
      if (method === 'POST' && path === '/api/admin/tax-audit') {
        return await handleAdminTaxAudit(request, sb, env, storeId, corsOrigin);
      }

      // ── Abandoned Cart ──────────────────────────────────────
      if (method === 'POST' && path === '/api/cart/save') {
        return await handleSaveCart(request, sb, storeId, corsOrigin);
      }

      // ── Customer Auth ───────────────────────────────────────
      if (method === 'POST' && path === '/api/auth/register') {
        return await handleCustomerRegister(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/auth/login') {
        return await handleCustomerLogin(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/auth/forgot-password') {
        return await handleForgotPassword(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/auth/reset-password') {
        return await handleResetPassword(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/auth/verify-email') {
        return await handleVerifyEmail(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/auth/resend-verification') {
        return await handleResendVerification(request, sb, env, storeId, corsOrigin);
      }

      // ── Customer Account (requires auth token) ─────────────
      if (method === 'GET' && path === '/api/account/profile') {
        return await handleGetProfile(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path === '/api/account/profile') {
        return await handleUpdateProfile(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/account/orders') {
        return await handleGetCustomerOrders(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/account/addresses') {
        return await handleGetAddresses(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/account/addresses') {
        return await handleAddAddress(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/account\/addresses\/[^/]+$/)) {
        return await handleDeleteAddress(request, sb, env, storeId, path.split('/').pop(), corsOrigin);
      }

      // ── SEO API (public — for frontend SDK) ──────────────────
      if (method === 'GET' && path === '/api/seo/meta') {
        return await handleSeoMeta(request, sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path === '/api/seo/structured-data') {
        return await handleStructuredData(request, sb, storeId, url, corsOrigin);
      }
      // Admin SEO health audit
      if (method === 'GET' && path === '/api/admin/seo/health') {
        return await handleSeoHealthAudit(request, sb, env, storeId, corsOrigin);
      }

      // ── Webhook Management (admin) ────────────────────────
      if (method === 'GET' && path === '/api/admin/webhooks') {
        return await handleAdminListWebhooks(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/webhooks') {
        return await handleAdminCreateWebhook(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/webhook-events') {
        return await handleAdminListWebhookEvents(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/admin\/webhooks\/[^/]+\/deliveries$/)) {
        const webhookId = path.split('/')[4];
        return await handleAdminWebhookDeliveries(request, sb, env, storeId, webhookId, corsOrigin);
      }
      if (method === 'POST' && path.match(/^\/api\/admin\/webhooks\/[^/]+\/test$/)) {
        const webhookId = path.split('/')[4];
        return await handleAdminTestWebhook(request, sb, env, storeId, webhookId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/admin\/webhooks\/[^/]+$/)) {
        const webhookId = path.split('/').pop();
        return await handleAdminGetWebhook(request, sb, env, storeId, webhookId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/webhooks\/[^/]+$/)) {
        const webhookId = path.split('/').pop();
        return await handleAdminUpdateWebhook(request, sb, env, storeId, webhookId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/webhooks\/[^/]+$/)) {
        const webhookId = path.split('/').pop();
        return await handleAdminDeleteWebhook(request, sb, env, storeId, webhookId, corsOrigin);
      }

      // ── Cart Recovery Stats (admin) ────────────────────────
      if (method === 'GET' && path === '/api/admin/cart-recovery/stats') {
        return await handleCartRecoveryStats(request, sb, env, storeId, corsOrigin);
      }

      // ── App Ecosystem (admin) ─────────────────────────────
      if (method === 'GET' && path === '/api/admin/apps') {
        return await handleAdminListApps(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/apps/install') {
        return await handleAdminInstallApp(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/apps\/[^/]+\/uninstall$/)) {
        const appId = path.split('/')[4];
        return await handleAdminUninstallApp(request, sb, env, storeId, appId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/apps\/[^/]+\/config$/)) {
        const appId = path.split('/')[4];
        return await handleAdminUpdateAppConfig(request, sb, env, storeId, appId, corsOrigin);
      }

      // ── GA4 Integration ───────────────────────────────────
      if (method === 'POST' && path === '/api/admin/integrations/ga4/configure') {
        return await handleGA4Configure(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/ga4/disconnect') {
        return await handleGA4Disconnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/ga4/test') {
        return await handleGA4Test(request, sb, env, storeId, corsOrigin);
      }

      // ── Twilio SMS Integration ────────────────────────────
      if (method === 'POST' && path === '/api/admin/integrations/twilio/configure') {
        return await handleTwilioConfigure(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'DELETE' && path === '/api/admin/integrations/twilio/disconnect') {
        return await handleTwilioDisconnect(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/integrations/twilio/test') {
        return await handleTwilioTest(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'PATCH' && path === '/api/admin/integrations/twilio/settings') {
        return await handleTwilioUpdateSettings(request, sb, env, storeId, corsOrigin);
      }

      // Public discount validation
      if (method === 'POST' && path === '/api/discount/validate') {
        return await handleValidateDiscount(request, sb, storeId, corsOrigin);
      }

      return json({ error: 'Not found' }, 404, corsOrigin);

    } catch (err) {
      console.error('Commerce API error:', err);
      return json({ error: 'Internal server error' }, 500, corsOrigin);
    }
  },

  async scheduled(event, env, ctx) {
    if (event.cron === '0 3 1 * *') {
      ctx.waitUntil(handleTaxRateAuditCron(env));
    } else if (event.cron === '*/5 * * * *') {
      ctx.waitUntil(handleWebhookRetryCron(env));
    } else {
      ctx.waitUntil(handleAbandonedCartCron(env));
    }
  },
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

function xml(content, status = 200, cacheMaxAge = 3600) {
  return new Response(content, {
    status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge * 24}`,
      'X-Robots-Tag': 'noindex',
    },
  });
}

async function resolveStoreFromRequest(request, sb) {
  const url = new URL(request.url);

  // 1. Check Host header — matches store domain
  const host = request.headers.get('Host') || '';
  if (host && !host.includes('webnari') && !host.includes('workers.dev')) {
    const store = await sb.query('stores', {
      filters: { domain: `eq.${host}` },
      select: 'id',
      single: true,
    });
    if (store) return store.id;
  }

  // 2. Check ?store= query param (for testing/crawlers)
  const storeParam = url.searchParams.get('store');
  if (storeParam) return storeParam;

  // 3. Fall back to X-Store-ID header
  const header = request.headers.get('X-Store-ID');
  if (header) return header;

  return null;
}

function escXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// ═══════════════════════════════════════════════════════════════
//  EMAIL — Resend integration for transactional emails
// ═══════════════════════════════════════════════════════════════

async function sendEmail(env, { to, subject, html, replyTo, storeSettings }) {
  // Try per-store Resend key first, fall back to master
  const apiKey = storeSettings?.resend_api_key || env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email to', to);
    return null;
  }
  // Per-store from address, fallback to env, fallback to Webnari default
  const from = storeSettings?.from_email || env.RESEND_FROM || 'Webnari <orders@webnari.io>';
  const body = { from, to: Array.isArray(to) ? to : [to], subject, html };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Resend send failed:', res.status, err);
    return null;
  }
  return await res.json();
}

function fmtCentsEmail(c) {
  return `$${(Math.abs(c || 0) / 100).toFixed(2)}`;
}

function emailShell(storeName, content) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <tr><td style="background:#111827;padding:24px 32px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">${esc(storeName)}</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    ${content}
  </td></tr>
  <tr><td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Powered by Webnari</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildOrderItemsTable(items) {
  const rows = items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">
        ${esc(item.product_name)}${item.variant_name ? `<br><span style="color:#6b7280;font-size:12px;">${esc(item.variant_name)}</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;color:#374151;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;color:#111827;">${fmtCentsEmail(item.price * item.quantity)}</td>
    </tr>`).join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <th style="padding:8px 0;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
      <th style="padding:8px 0;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
      <th style="padding:8px 0;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Total</th>
    </tr>
    ${rows}
  </table>`;
}

function emailOrderConfirmation(storeName, order, items, invoiceUrl) {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const addr = order.shipping_address;
  const shipTo = addr
    ? `${esc(addr.line1 || '')}${addr.line2 ? ', ' + esc(addr.line2) : ''}<br>${esc(addr.city || '')}, ${esc(addr.state || '')} ${esc(addr.zip || '')}`
    : '';

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Order Confirmed</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Thanks for your order! We're getting it ready.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9fafb;border-radius:6px;padding:16px;">
      <tr>
        <td style="padding:8px 16px;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Order</span><br>
          <strong style="font-size:14px;color:#111827;">${esc(order.order_number)}</strong>
        </td>
        <td style="padding:8px 16px;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Date</span><br>
          <strong style="font-size:14px;color:#111827;">${esc(orderDate)}</strong>
        </td>
        <td style="padding:8px 16px;text-align:right;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Total</span><br>
          <strong style="font-size:18px;color:#111827;">${fmtCentsEmail(order.total)}</strong>
        </td>
      </tr>
    </table>

    ${buildOrderItemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
      <tr><td style="padding:4px 0;font-size:14px;color:#374151;">Subtotal</td><td style="text-align:right;font-size:14px;color:#374151;">${fmtCentsEmail(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#374151;">Shipping</td><td style="text-align:right;font-size:14px;color:#374151;">${order.shipping ? fmtCentsEmail(order.shipping) : 'Free'}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#374151;">Tax</td><td style="text-align:right;font-size:14px;color:#374151;">${fmtCentsEmail(order.tax)}</td></tr>
      <tr><td style="padding:8px 0;font-size:16px;font-weight:800;color:#111827;border-top:2px solid #111827;">Total</td><td style="text-align:right;padding:8px 0;font-size:16px;font-weight:800;color:#111827;border-top:2px solid #111827;">${fmtCentsEmail(order.total)}</td></tr>
    </table>

    ${shipTo ? `
    <div style="margin-bottom:24px;">
      <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Shipping To</span>
      <p style="margin:4px 0 0;font-size:14px;color:#374151;">${order.customer_name ? esc(order.customer_name) + '<br>' : ''}${shipTo}</p>
    </div>` : ''}

    ${invoiceUrl ? `<p style="margin:0;"><a href="${esc(invoiceUrl)}" style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">View Invoice</a></p>` : ''}
  `;
  return emailShell(storeName, content);
}

function emailShippingUpdate(storeName, order, trackingNumber, trackingUrl) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Your Order Has Shipped</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Great news! Order <strong>${esc(order.order_number)}</strong> is on its way.</p>

    ${trackingNumber ? `
    <div style="margin-bottom:24px;background:#f9fafb;border-radius:6px;padding:20px;">
      <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Tracking Number</span>
      <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#111827;">${esc(trackingNumber)}</p>
    </div>` : ''}

    ${trackingUrl ? `<p style="margin:0;"><a href="${esc(trackingUrl)}" style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Track Your Package</a></p>` : ''}
  `;
  return emailShell(storeName, content);
}

function emailDelivered(storeName, order) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Your Order Has Been Delivered</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Order <strong>${esc(order.order_number)}</strong> has been delivered. We hope you love it!</p>
    <p style="margin:0;font-size:14px;color:#6b7280;">If you have any questions or concerns, just reply to this email.</p>
  `;
  return emailShell(storeName, content);
}

function emailAbandonedCart(storeName, items, total, shopUrl) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">
        ${esc(item.name || 'Item')}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;color:#374151;">${item.quantity}</td>
    </tr>`).join('');

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">You left something behind!</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Looks like you didn't finish checking out. Your items are still waiting for you.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <th style="padding:8px 0;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
        <th style="padding:8px 0;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
      </tr>
      ${itemRows}
    </table>

    ${total ? `<p style="margin:16px 0;font-size:16px;color:#111827;font-weight:600;">Cart Total: ${fmtCentsEmail(total)}</p>` : ''}

    <p style="margin:24px 0 0;"><a href="${esc(shopUrl)}" style="display:inline-block;padding:14px 28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Complete Your Order</a></p>

    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">If you've already completed your purchase, please ignore this email.</p>
  `;
  return emailShell(storeName, content);
}

async function sendOrderConfirmationEmail(sb, env, storeId, order, items) {
  if (!order.customer_email) return;
  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` }, single: true, select: 'name,settings',
  });
  const storeName = store?.name || 'Store';
  const storeEmail = store?.settings?.email || null;

  // Respect email notification toggles (defaults to true if not set)
  const toggles = store?.settings?.email_notifications || {};
  if (toggles.orderConfirmation === false) return;

  // Build invoice URL
  const secret = env.ADMIN_API_KEY || 'invoice-secret';
  const token = await generateInvoiceToken(order.id, order.customer_email, secret);
  const baseUrl = store?.settings?.domain
    ? `https://${store.settings.domain}`
    : (env.WORKER_URL || 'https://webnari.io/commerce');
  const invoiceUrl = `${baseUrl}/api/orders/${order.id}/invoice?email=${encodeURIComponent(order.customer_email)}&token=${token}`;

  const html = emailOrderConfirmation(storeName, order, items, invoiceUrl);
  await sendEmail(env, {
    to: order.customer_email,
    subject: `Order Confirmed — ${order.order_number}`,
    html,
    replyTo: storeEmail,
    storeSettings: store?.settings,
  });
}

async function sendOrderStatusEmail(sb, env, storeId, order, newStatus, trackingNumber, trackingUrl) {
  if (!order.customer_email) return;
  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` }, single: true, select: 'name,settings',
  });
  const storeName = store?.name || 'Store';
  const storeEmail = store?.settings?.email || null;

  // Respect email notification toggles (defaults to true if not set)
  const toggles = store?.settings?.email_notifications || {};
  if (newStatus === 'shipped' && toggles.shippingUpdate === false) return;
  if (newStatus === 'delivered' && toggles.deliveryConfirmation === false) return;

  let subject, html;
  if (newStatus === 'shipped') {
    subject = `Your Order Has Shipped — ${order.order_number}`;
    html = emailShippingUpdate(storeName, order, trackingNumber, trackingUrl);
  } else if (newStatus === 'delivered') {
    subject = `Your Order Has Been Delivered — ${order.order_number}`;
    html = emailDelivered(storeName, order);
  } else {
    return; // Only send emails for shipped + delivered
  }

  await sendEmail(env, { to: order.customer_email, subject, html, replyTo: storeEmail, storeSettings: store?.settings });
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
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase insert ${table} failed: ${res.status} ${err}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
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

function createSupabaseClient(env) {
  return supabase(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
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

  // Check master admin key (your Webnari admin access) — super admin, all permissions
  if (env.ADMIN_API_KEY && token === env.ADMIN_API_KEY) return true;

  // Check per-store admin key (client-specific access) — full access
  if (storeId) {
    const storeKey = env[`ADMIN_API_KEY_${storeId.toUpperCase().replace(/-/g, '_')}`];
    if (storeKey && token === storeKey) return true;
  }

  // Store the token for async permission checks (staff API keys)
  request._staffToken = token;
  return false;
}

// Check staff API key from store_admins table (async version)
async function requireAdminAsync(request, sb, env, storeId) {
  // First try env-based keys (sync, fast)
  if (requireAdmin(request, env, storeId)) return { role: 'owner', permissions: ['*'] };

  // Then try database-backed staff key
  const token = request._staffToken;
  if (!token) return null;

  try {
    const tokenHash = await sha256(token);
    const admin = await sb.query('store_admins', {
      filters: { store_id: `eq.${storeId}`, api_key_hash: `eq.${tokenHash}` },
      single: true,
      select: 'id,role,permissions,name,email',
    });
    if (admin) return admin;
  } catch (e) { /* store_admins table may not have api_key_hash column yet */ }

  return null;
}

// Permission check — owner gets all, manager checks permissions array
async function requirePermission(request, sb, env, storeId, permission) {
  const admin = await requireAdminAsync(request, sb, env, storeId);
  if (!admin) return false;
  if (admin.role === 'owner' || (admin.permissions && admin.permissions.includes('*'))) return true;
  if (admin.permissions && admin.permissions.includes(permission)) return true;
  return false;
}

const PERMISSION_SCOPES = [
  'products:read', 'products:write',
  'orders:read', 'orders:write', 'orders:refund',
  'discounts:write', 'customers:read',
  'settings:write', 'integrations:write',
  'analytics:read', 'blog:write', 'labels:purchase',
];


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
  const { items, customer, shippingState, successUrl, cancelUrl, provider, discountCode, giftCardCode, fulfillmentType } = body;
  const isPickup = fulfillmentType === 'pickup';

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
      category: product.category || null,
    });

    reservations.push({
      product_id: item.productId,
      variant_id: item.variantId || null,
      quantity: item.quantity,
    });
  }

  // ── 3b. Apply discount code ─────────────────────────────
  let discountAmount = 0;
  let discountId = null;
  let discountLabel = '';
  let freeShipping = false;

  // Helper: apply a validated discount to the cart
  function applyDiscount(discount) {
    discountId = discount.id;
    if (discount.type === 'percentage') {
      discountAmount = Math.round(subtotal * parseFloat(discount.value) / 100);
      discountLabel = `${discount.value}% off (${discount.code})`;
    } else if (discount.type === 'fixed') {
      discountAmount = Math.round(parseFloat(discount.value) * 100);
      if (discountAmount > subtotal) discountAmount = subtotal;
      discountLabel = `$${parseFloat(discount.value).toFixed(2)} off (${discount.code})`;
    } else if (discount.type === 'free_shipping') {
      freeShipping = true;
      discountLabel = `Free shipping (${discount.code})`;
    } else if (discount.type === 'bxgy') {
      const cfg = discount.config || {};
      const buyQty = cfg.buy_min_qty || 2;
      const buyCategory = cfg.buy_category || null;
      const getQty = cfg.get_qty || 1;
      const getCategory = cfg.get_category || null;
      const getPct = cfg.get_discount_percent || 100;

      // Count qualifying "buy" items
      let buyCount = 0;
      for (const li of lineItems) {
        if (!buyCategory || li.category === buyCategory) buyCount += li.quantity;
      }

      if (buyCount >= buyQty) {
        // Find cheapest qualifying "get" items and discount them
        const getItems = [];
        for (const li of lineItems) {
          if (!getCategory || li.category === getCategory) {
            for (let i = 0; i < li.quantity; i++) getItems.push(li.price);
          }
        }
        getItems.sort((a, b) => a - b); // cheapest first
        const toDiscount = Math.min(getQty, getItems.length);
        let bxgyAmount = 0;
        for (let i = 0; i < toDiscount; i++) {
          bxgyAmount += Math.round(getItems[i] * getPct / 100);
        }
        discountAmount = Math.min(bxgyAmount, subtotal);
        const pctLabel = getPct === 100 ? 'Free' : `${getPct}% off`;
        discountLabel = `Buy ${buyQty} Get ${getQty} ${pctLabel} (${discount.code})`;
      }
    }
  }

  // Helper: validate discount eligibility
  function isDiscountValid(discount) {
    const now = new Date();
    if (discount.starts_at && new Date(discount.starts_at) > now) return false;
    if (discount.expires_at && new Date(discount.expires_at) < now) return false;
    if (discount.max_uses && discount.used_count >= discount.max_uses) return false;
    if (discount.min_order && subtotal < discount.min_order) return false;
    return true;
  }

  if (discountCode) {
    try {
      const discount = await sb.query('discounts', {
        filters: { store_id: `eq.${storeId}`, code: `eq.${discountCode.toUpperCase().trim()}`, is_active: 'eq.true' },
        single: true,
      });
      if (discount && isDiscountValid(discount)) applyDiscount(discount);
    } catch (e) {
      // discounts table may not exist — continue without discount
    }
  }

  // Auto-apply: if no manual code used, check for auto-apply discounts
  if (!discountId) {
    try {
      const autoDiscounts = await sb.query('discounts', {
        filters: { store_id: `eq.${storeId}`, auto_apply: 'eq.true', is_active: 'eq.true' },
      });
      // Apply the best (highest discount amount) valid auto-apply discount
      let bestAmount = 0;
      let bestDiscount = null;
      for (const ad of autoDiscounts) {
        if (!isDiscountValid(ad)) continue;
        // Temporarily calculate what this discount would give
        const saved = { discountAmount, discountId, discountLabel, freeShipping };
        discountAmount = 0; discountId = null; discountLabel = ''; freeShipping = false;
        applyDiscount(ad);
        const thisAmount = discountAmount + (freeShipping ? 1 : 0); // freeShipping counts as better than nothing
        if (thisAmount > bestAmount) { bestAmount = thisAmount; bestDiscount = ad; }
        // Restore
        discountAmount = saved.discountAmount; discountId = saved.discountId;
        discountLabel = saved.discountLabel; freeShipping = saved.freeShipping;
      }
      if (bestDiscount) applyDiscount(bestDiscount);
    } catch (e) {
      // auto-apply not available — continue
    }
  }

  const discountedSubtotal = subtotal - discountAmount;

  // ── 4. Calculate shipping (skip for local pickup) ────────
  const shippingCost = (isPickup || freeShipping) ? 0 : calculateShippingFromRules(store.shipping_rules, discountedSubtotal);

  // ── 5. Calculate tax ────────────────────────────────────
  let taxAmount = 0;
  if (shippingState) {
    const taxRate = await sb.query('store_tax_rates', {
      filters: { store_id: `eq.${storeId}`, state: `eq.${shippingState}` },
      single: true,
    });
    if (taxRate) {
      taxAmount = Math.round(discountedSubtotal * parseFloat(taxRate.rate));
    }
  }

  // ── 5b. Apply gift card ─────────────────────────────────
  let giftCardAmount = 0;
  let giftCardId = null;

  if (giftCardCode) {
    try {
      const giftCard = await sb.query('gift_cards', {
        filters: { store_id: `eq.${storeId}`, code: `eq.${giftCardCode.toUpperCase().trim()}`, is_active: 'eq.true' },
        single: true,
      });

      if (giftCard && giftCard.current_balance > 0) {
        // Check expiry
        if (!giftCard.expires_at || new Date(giftCard.expires_at) > new Date()) {
          const preGiftTotal = discountedSubtotal + shippingCost + taxAmount;
          giftCardAmount = Math.min(giftCard.current_balance, preGiftTotal);
          giftCardId = giftCard.id;
        }
      }
    } catch (e) {
      // gift_cards table may not exist — continue without gift card
    }
  }

  const total = discountedSubtotal + shippingCost + taxAmount - giftCardAmount;

  // ── 6. Determine payment provider ───────────────────────
  const paymentProvider = provider || store.payment_provider;

  const checkoutData = {
    lineItems, customer, subtotal: discountedSubtotal, shippingCost, taxAmount, total,
    shippingState, reservations, successUrl, cancelUrl,
    discountAmount, discountId, discountLabel, giftCardAmount, giftCardId,
    fulfillmentType: isPickup ? 'pickup' : 'shipping',
  };

  if (paymentProvider === 'stripe' || paymentProvider === 'both') {
    return await createStripeCheckout(sb, env, storeId, store, checkoutData, corsOrigin);
  }

  if (paymentProvider === 'square') {
    return await createSquareCheckout(sb, env, storeId, store, checkoutData, corsOrigin);
  }

  if (paymentProvider === 'paypal') {
    return await createPayPalCheckout(sb, env, storeId, store, checkoutData, corsOrigin);
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
  if (data.discountId) params.set('metadata[discount_id]', data.discountId);
  if (data.discountAmount) params.set('metadata[discount_amount]', data.discountAmount.toString());
  if (data.discountLabel) params.set('metadata[discount_label]', data.discountLabel);
  if (data.giftCardId) params.set('metadata[gift_card_id]', data.giftCardId);
  if (data.giftCardAmount) params.set('metadata[gift_card_amount]', data.giftCardAmount.toString());
  if (data.fulfillmentType) params.set('metadata[fulfillment_type]', data.fulfillmentType);

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

  // Create Stripe coupon for discount + gift card combined
  const totalReduction = (data.discountAmount || 0) + (data.giftCardAmount || 0);
  if (totalReduction > 0) {
    const couponParts = [];
    if (data.discountLabel) couponParts.push(data.discountLabel);
    if (data.giftCardAmount > 0) couponParts.push(`Gift Card -$${(data.giftCardAmount / 100).toFixed(2)}`);

    const couponParams = new URLSearchParams();
    couponParams.set('amount_off', totalReduction.toString());
    couponParams.set('currency', store.currency);
    couponParams.set('duration', 'once');
    couponParams.set('name', couponParts.join(' + ') || 'Discount');

    const couponRes = await fetch('https://api.stripe.com/v1/coupons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded', ...stripeAccountHeader },
      body: couponParams.toString(),
    });
    const coupon = await couponRes.json();
    if (couponRes.ok) {
      params.set('discounts[0][coupon]', coupon.id);
    }
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
    discount: data.discountAmount || 0,
    discountLabel: data.discountLabel || null,
    giftCard: data.giftCardAmount || 0,
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
    fulfillment_type: session.metadata?.fulfillment_type || 'shipping',
  });

  // Create order items from reservations + line items — generate download tokens for digital products
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

    // Increment discount used_count
    const discountId = session.metadata?.discount_id;
    if (discountId) {
      try {
        const disc = await sb.query('discounts', { filters: { id: `eq.${discountId}` }, single: true });
        if (disc) {
          await sb.update('discounts', { id: `eq.${discountId}` }, { used_count: (disc.used_count || 0) + 1 });
        }
      } catch (e) { /* ignore */ }
    }

    // Deduct gift card balance
    const giftCardId = session.metadata?.gift_card_id;
    const giftCardAmount = parseInt(session.metadata?.gift_card_amount || '0');
    if (giftCardId && giftCardAmount > 0) {
      try {
        const gc = await sb.query('gift_cards', { filters: { id: `eq.${giftCardId}` }, single: true });
        if (gc) {
          const newBalance = Math.max(0, gc.current_balance - giftCardAmount);
          await sb.update('gift_cards', { id: `eq.${giftCardId}` }, {
            current_balance: newBalance,
            is_active: newBalance > 0,
          });
        }
      } catch (e) { /* ignore */ }
    }

    // Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(sb, env, storeId, order, orderItems).catch(err =>
      console.error('Order confirmation email failed:', err)
    );

    // Mark abandoned cart as recovered (non-blocking)
    if (order.customer_email) {
      sb.update('saved_carts', { recovered: true }, {
        store_id: `eq.${storeId}`,
        email: `eq.${order.customer_email}`,
        recovered: 'eq.false',
      }).catch(() => {});
    }

    // Sync order to QuickBooks if connected
    syncOrderToQuickBooks(sb, env, storeId, order, orderItems).catch(err =>
      console.error('QB sync (Stripe) failed:', err)
    );

    // Generate download tokens for digital products
    const allOrderItems = await sb.query('order_items', { filters: { order_id: `eq.${order.id}` } });
    generateDownloadTokens(sb, env, storeId, order, allOrderItems).catch(err => console.error('Download token gen failed:', err));

    // Emit webhook event + dispatch to integrations
    emitEvent(sb, env, storeId, 'order.created', order).catch(err => console.error('Webhook emit error:', err));
    dispatchToIntegrations(sb, env, storeId, 'order.created', order).catch(err => console.error('Integration dispatch error:', err));
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
        ...((data.discountAmount || 0) + (data.giftCardAmount || 0) > 0 ? {
          discounts: [{
            name: [data.discountLabel, data.giftCardAmount > 0 ? `Gift Card -$${(data.giftCardAmount / 100).toFixed(2)}` : ''].filter(Boolean).join(' + ') || 'Discount',
            type: 'FIXED_AMOUNT',
            amount_money: {
              amount: (data.discountAmount || 0) + (data.giftCardAmount || 0),
              currency: store.currency.toUpperCase(),
            },
            scope: 'ORDER',
          }],
        } : {}),
        metadata: {
          store_id: storeId,
          customer_email: data.customer.email,
          customer_name: data.customer.name || '',
          customer_phone: data.customer.phone || '',
          shipping_state: data.shippingState || '',
          ...(data.discountId ? { discount_id: data.discountId } : {}),
          ...(data.discountAmount ? { discount_amount: data.discountAmount.toString() } : {}),
          ...(data.discountLabel ? { discount_label: data.discountLabel } : {}),
          ...(data.giftCardId ? { gift_card_id: data.giftCardId } : {}),
          ...(data.giftCardAmount ? { gift_card_amount: data.giftCardAmount.toString() } : {}),
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
    discount: data.discountAmount || 0,
    discountLabel: data.discountLabel || null,
    giftCard: data.giftCardAmount || 0,
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

        // Increment discount used_count (from Square order metadata)
        const sqMetadata = payment.note ? {} : {}; // Square metadata comes from order
        // Try to get metadata from the Square order
        try {
          const sqOrderRes = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
            headers: {
              'Square-Version': '2024-01-18',
              Authorization: `Bearer ${getStoreSecret(env, store.id, 'SQUARE_ACCESS_TOKEN')}`,
            },
          });
          const sqOrderData = await sqOrderRes.json();
          const sqMeta = sqOrderData.order?.metadata || {};

          if (sqMeta.discount_id) {
            try {
              const disc = await sb.query('discounts', { filters: { id: `eq.${sqMeta.discount_id}` }, single: true });
              if (disc) {
                await sb.update('discounts', { id: `eq.${sqMeta.discount_id}` }, { used_count: (disc.used_count || 0) + 1 });
              }
            } catch (e) { /* ignore */ }
          }

          const sqGiftCardId = sqMeta.gift_card_id;
          const sqGiftCardAmount = parseInt(sqMeta.gift_card_amount || '0');
          if (sqGiftCardId && sqGiftCardAmount > 0) {
            try {
              const gc = await sb.query('gift_cards', { filters: { id: `eq.${sqGiftCardId}` }, single: true });
              if (gc) {
                const newBalance = Math.max(0, gc.current_balance - sqGiftCardAmount);
                await sb.update('gift_cards', { id: `eq.${sqGiftCardId}` }, {
                  current_balance: newBalance,
                  is_active: newBalance > 0,
                });
              }
            } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore — metadata fetch failed */ }

        // Send order confirmation email (non-blocking)
        sendOrderConfirmationEmail(sb, env, store.id, order, orderItems).catch(err =>
          console.error('Order confirmation email (Square) failed:', err)
        );

        // Mark abandoned cart as recovered (non-blocking)
        if (order.customer_email) {
          sb.update('saved_carts', { recovered: true }, {
            store_id: `eq.${store.id}`,
            email: `eq.${order.customer_email}`,
            recovered: 'eq.false',
          }).catch(() => {});
        }

        // Sync order to QuickBooks if connected
        syncOrderToQuickBooks(sb, env, store.id, order, orderItems).catch(err =>
          console.error('QB sync (Square) failed:', err)
        );

        // Generate download tokens for digital products
        generateDownloadTokens(sb, env, store.id, order, orderItems).catch(err => console.error('Download token gen (Square) failed:', err));

        // Emit webhook event + dispatch to integrations
        emitEvent(sb, env, store.id, 'order.created', order).catch(err => console.error('Webhook emit error:', err));
        dispatchToIntegrations(sb, env, store.id, 'order.created', order).catch(err => console.error('Integration dispatch error:', err));
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
//  PAYPAL
// ═══════════════════════════════════════════════════════════════

async function getPayPalAccessToken(clientId, clientSecret, mode) {
  const base = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('PayPal auth failed:', res.status, err);
    return null;
  }
  const data = await res.json();
  return { token: data.access_token, base };
}

async function createPayPalCheckout(sb, env, storeId, store, data, corsOrigin) {
  const settings = store.settings || {};
  const clientId = settings.paypal_client_id;
  const clientSecret = settings.paypal_client_secret;
  const mode = settings.paypal_mode || 'sandbox';

  if (!clientId || !clientSecret) {
    return json({ error: 'PayPal not configured for this store' }, 500, corsOrigin);
  }

  const auth = await getPayPalAccessToken(clientId, clientSecret, mode);
  if (!auth) return json({ error: 'PayPal authentication failed' }, 500, corsOrigin);

  // Create inventory reservations
  const reservationIds = [];
  for (const res of data.reservations) {
    const [r] = await sb.insert('inventory_reservations', {
      store_id: storeId,
      product_id: res.product_id,
      variant_id: res.variant_id,
      quantity: res.quantity,
      status: 'held',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    reservationIds.push(r.id);
  }

  // Build PayPal order
  const purchaseItems = data.lineItems.map(item => ({
    name: item.name.slice(0, 127),
    quantity: String(item.quantity),
    unit_amount: { currency_code: (store.currency || 'usd').toUpperCase(), value: (item.price / 100).toFixed(2) },
  }));

  const orderBody = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: (store.currency || 'usd').toUpperCase(),
        value: (data.total / 100).toFixed(2),
        breakdown: {
          item_total: { currency_code: (store.currency || 'usd').toUpperCase(), value: (data.subtotal / 100).toFixed(2) },
          shipping: { currency_code: (store.currency || 'usd').toUpperCase(), value: (data.shippingCost / 100).toFixed(2) },
          tax_total: { currency_code: (store.currency || 'usd').toUpperCase(), value: (data.taxAmount / 100).toFixed(2) },
          ...(data.discountAmount > 0 ? { discount: { currency_code: (store.currency || 'usd').toUpperCase(), value: (data.discountAmount / 100).toFixed(2) } } : {}),
        },
      },
      items: purchaseItems,
      custom_id: JSON.stringify({
        store_id: storeId,
        reservation_ids: reservationIds,
        discount_id: data.discountId || null,
        discount_amount: data.discountAmount || 0,
        gift_card_id: data.giftCardId || null,
        gift_card_amount: data.giftCardAmount || 0,
      }),
    }],
    application_context: {
      return_url: data.successUrl || `https://${store.domain || 'webnari.io'}?checkout=success`,
      cancel_url: data.cancelUrl || `https://${store.domain || 'webnari.io'}?checkout=cancelled`,
      brand_name: store.name || 'Store',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
    },
  };

  const ppRes = await fetch(`${auth.base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderBody),
  });

  if (!ppRes.ok) {
    const err = await ppRes.text();
    console.error('PayPal create order failed:', ppRes.status, err);
    return json({ error: 'Failed to create PayPal order' }, 500, corsOrigin);
  }

  const ppOrder = await ppRes.json();
  const approveUrl = ppOrder.links?.find(l => l.rel === 'approve')?.href;

  return json({
    checkoutUrl: approveUrl,
    paypalOrderId: ppOrder.id,
    provider: 'paypal',
  }, 200, corsOrigin);
}

async function handlePayPalCapture(request, sb, env, storeId, corsOrigin) {
  const body = await request.json();
  const { paypalOrderId } = body;

  if (!paypalOrderId) return json({ error: 'paypalOrderId required' }, 400, corsOrigin);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` }, single: true,
  });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  const settings = store.settings || {};
  const auth = await getPayPalAccessToken(settings.paypal_client_id, settings.paypal_client_secret, settings.paypal_mode || 'sandbox');
  if (!auth) return json({ error: 'PayPal auth failed' }, 500, corsOrigin);

  const captureRes = await fetch(`${auth.base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!captureRes.ok) {
    const err = await captureRes.text();
    console.error('PayPal capture failed:', captureRes.status, err);
    return json({ error: 'Payment capture failed' }, 500, corsOrigin);
  }

  const capture = await captureRes.json();
  if (capture.status !== 'COMPLETED') {
    return json({ error: `Payment not completed: ${capture.status}` }, 400, corsOrigin);
  }

  // Parse custom_id metadata
  const pu = capture.purchase_units?.[0];
  let meta = {};
  try { meta = JSON.parse(pu?.payments?.captures?.[0]?.custom_id || pu?.custom_id || '{}'); } catch {}

  const payer = capture.payer || {};
  const customerEmail = payer.email_address || '';
  const customerName = payer.name ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() : '';

  // Process reservations → create order
  const reservationIds = meta.reservation_ids || [];
  const reservations = [];
  for (const rid of reservationIds) {
    const r = await sb.query('inventory_reservations', { filters: { id: `eq.${rid}` }, single: true });
    if (r && r.status === 'held') reservations.push(r);
  }

  const orderNumber = await generateOrderNumber(sb, storeId);
  const captureAmount = pu?.payments?.captures?.[0]?.amount;
  const totalCents = Math.round(parseFloat(captureAmount?.value || '0') * 100);

  const [order] = await sb.insert('orders', {
    store_id: storeId,
    order_number: orderNumber,
    payment_provider: 'paypal',
    paypal_order_id: paypalOrderId,
    status: 'confirmed',
    customer_email: customerEmail,
    customer_name: customerName,
    subtotal: totalCents,
    total: totalCents,
    discount_amount: meta.discount_amount || 0,
    discount_label: meta.discount_id ? 'Discount applied' : null,
    gift_card_amount: meta.gift_card_amount || 0,
  });

  // Process line items from reservations
  const orderItems = [];
  for (const res of reservations) {
    const product = await sb.query('products', { filters: { id: `eq.${res.product_id}` }, single: true });
    let price = product?.price || 0;
    let variantName = null;

    if (res.variant_id) {
      const variant = await sb.query('variants', { filters: { id: `eq.${res.variant_id}` }, single: true });
      if (variant) { price = variant.price || price; variantName = variant.name; }
    }

    orderItems.push({
      order_id: order.id,
      store_id: storeId,
      product_id: res.product_id,
      variant_id: res.variant_id,
      product_name: product?.name || 'Unknown',
      variant_name: variantName,
      price,
      quantity: res.quantity,
    });

    // Decrement stock
    if (res.variant_id) {
      const variant = await sb.query('variants', { filters: { id: `eq.${res.variant_id}` }, single: true });
      if (variant) {
        await sb.update('variants', { id: `eq.${res.variant_id}` }, { stock_quantity: Math.max(0, variant.stock_quantity - res.quantity) });
      }
    } else if (product) {
      await sb.update('products', { id: `eq.${res.product_id}` }, { stock_quantity: Math.max(0, product.stock_quantity - res.quantity) });
    }

    await sb.update('inventory_reservations', { id: `eq.${res.id}` }, { status: 'completed' });
  }

  if (orderItems.length > 0) {
    await sb.insert('order_items', orderItems);

    // Discount bookkeeping
    if (meta.discount_id) {
      try {
        const disc = await sb.query('discounts', { filters: { id: `eq.${meta.discount_id}` }, single: true });
        if (disc) await sb.update('discounts', { id: `eq.${meta.discount_id}` }, { used_count: (disc.used_count || 0) + 1 });
      } catch {}
    }

    // Gift card bookkeeping
    if (meta.gift_card_id && meta.gift_card_amount > 0) {
      try {
        const gc = await sb.query('gift_cards', { filters: { id: `eq.${meta.gift_card_id}` }, single: true });
        if (gc) {
          const newBal = Math.max(0, gc.current_balance - meta.gift_card_amount);
          await sb.update('gift_cards', { id: `eq.${meta.gift_card_id}` }, { current_balance: newBal, is_active: newBal > 0 });
        }
      } catch {}
    }

    // Send email, sync QB, emit webhooks, digital downloads (non-blocking)
    sendOrderConfirmationEmail(sb, env, storeId, order, orderItems).catch(err => console.error('Order email (PayPal) failed:', err));
    syncOrderToQuickBooks(sb, env, storeId, order, orderItems).catch(err => console.error('QB sync (PayPal) failed:', err));
    generateDownloadTokens(sb, env, storeId, order, orderItems).catch(err => console.error('Download token gen (PayPal) failed:', err));
    emitEvent(sb, env, storeId, 'order.created', order).catch(err => console.error('Webhook emit error:', err));
    dispatchToIntegrations(sb, env, storeId, 'order.created', order).catch(err => console.error('Integration dispatch error:', err));

    if (customerEmail) {
      sb.update('saved_carts', { recovered: true }, { store_id: `eq.${storeId}`, email: `eq.${customerEmail}`, recovered: 'eq.false' }).catch(() => {});
    }
  }

  return json({ success: true, orderId: order.id, orderNumber }, 200, corsOrigin);
}

async function handlePayPalWebhook(request, sb, env, corsOrigin) {
  // PayPal IPN/webhook — mainly for dispute resolution and refund tracking
  const body = await request.json();
  const eventType = body.event_type;

  if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
    const captureId = body.resource?.id;
    if (captureId) {
      console.log('PayPal refund received for capture:', captureId);
      // Could update order status here if needed
    }
  }

  return json({ received: true }, 200, corsOrigin);
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
  // Preserve /commerce prefix when accessed via webnari.io/commerce/*
  const rawPath = url.pathname;
  const prefix = rawPath.startsWith('/commerce/') ? '/commerce' : '';
  const secret = env.ADMIN_API_KEY || 'invoice-secret';
  const token = await generateInvoiceToken(order.id, order.customer_email || '', secret);
  const invoiceUrl = `${url.origin}${prefix}/api/orders/${order.id}/invoice?email=${encodeURIComponent(order.customer_email || '')}&token=${token}`;

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

// ═══════════════════════════════════════════════════════════════
//  ADMIN — PURCHASE SHIPPING LABEL (Shippo)
// ═══════════════════════════════════════════════════════════════

async function handlePurchaseLabel(request, sb, env, storeId, orderId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { rate_id } = body;
  if (!rate_id) return json({ error: 'rate_id required (from /api/shipping/rates)' }, 400, corsOrigin);

  // Get Shippo API key
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
  const shippoKey = store?.settings?.shippo_api_key || env.SHIPPO_API_KEY;
  if (!shippoKey) return json({ error: 'Shippo API key not configured' }, 501, corsOrigin);

  // Purchase label via Shippo Transaction API
  const txnRes = await fetch('https://api.goshippo.com/transactions/', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${shippoKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rate: rate_id, async: false }),
  });

  if (!txnRes.ok) {
    const err = await txnRes.json();
    return json({ error: 'Label purchase failed', details: err.messages || err }, 500, corsOrigin);
  }

  const txn = await txnRes.json();

  if (txn.status !== 'SUCCESS') {
    return json({ error: 'Label purchase failed', details: txn.messages }, 500, corsOrigin);
  }

  // Update order with tracking + label
  const orderUpdates = {
    tracking_number: txn.tracking_number || null,
    tracking_url: txn.tracking_url_provider || null,
    label_url: txn.label_url || null,
    shippo_transaction_id: txn.object_id || null,
    status: 'shipped',
    updated_at: new Date().toISOString(),
  };

  await sb.update('orders', { id: `eq.${orderId}`, store_id: `eq.${storeId}` }, orderUpdates);

  // Send shipping notification email
  const order = await sb.query('orders', { filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` }, single: true });
  if (order) {
    sendOrderStatusEmail(sb, env, storeId, order, 'shipped', orderUpdates.tracking_number, orderUpdates.tracking_url)
      .catch(err => console.error('Shipping email failed:', err));
    emitEvent(sb, env, storeId, 'order.shipped', order).catch(() => {});
  }

  return json({
    label_url: txn.label_url,
    tracking_number: txn.tracking_number,
    tracking_url: txn.tracking_url_provider,
    transaction_id: txn.object_id,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  FULFILLMENTS (Split Fulfillment)
// ═══════════════════════════════════════════════════════════════

async function handleListFulfillments(request, sb, env, storeId, orderId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const fulfillments = await sb.query('fulfillments', {
    filters: { order_id: `eq.${orderId}`, store_id: `eq.${storeId}` },
    order: 'created_at.asc',
  });

  // Enrich with items
  const enriched = await Promise.all(fulfillments.map(async f => {
    const items = await sb.query('fulfillment_items', { filters: { fulfillment_id: `eq.${f.id}` } });
    return { ...f, items };
  }));

  return json(enriched, 200, corsOrigin);
}

async function handleCreateFulfillment(request, sb, env, storeId, orderId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { items, tracking_number, tracking_url, carrier } = body;
  // items: [{ order_item_id, quantity }]

  if (!items?.length) return json({ error: 'At least one item required' }, 400, corsOrigin);

  // Verify order belongs to store
  const order = await sb.query('orders', { filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` }, single: true });
  if (!order) return json({ error: 'Order not found' }, 404, corsOrigin);

  // Create fulfillment
  const [fulfillment] = await sb.insert('fulfillments', {
    order_id: orderId,
    store_id: storeId,
    tracking_number: tracking_number || null,
    tracking_url: tracking_url || null,
    carrier: carrier || null,
    status: tracking_number ? 'shipped' : 'pending',
    shipped_at: tracking_number ? new Date().toISOString() : null,
  });

  // Create fulfillment items
  for (const item of items) {
    await sb.insert('fulfillment_items', {
      fulfillment_id: fulfillment.id,
      order_item_id: item.order_item_id,
      quantity: item.quantity || 1,
    });
  }

  // Check if all items are now fulfilled — auto-update order status
  const allFulfillments = await sb.query('fulfillments', { filters: { order_id: `eq.${orderId}` } });
  const allFItems = [];
  for (const f of allFulfillments) {
    const fi = await sb.query('fulfillment_items', { filters: { fulfillment_id: `eq.${f.id}` } });
    allFItems.push(...fi);
  }
  const orderItems = await sb.query('order_items', { filters: { order_id: `eq.${orderId}` } });

  // Sum fulfilled quantities per order_item
  const fulfilledMap = {};
  for (const fi of allFItems) {
    fulfilledMap[fi.order_item_id] = (fulfilledMap[fi.order_item_id] || 0) + fi.quantity;
  }
  const allFulfilled = orderItems.every(oi => (fulfilledMap[oi.id] || 0) >= oi.quantity);
  if (allFulfilled && order.status !== 'shipped' && order.status !== 'delivered') {
    await sb.update('orders', { id: `eq.${orderId}` }, { status: 'shipped', updated_at: new Date().toISOString() });
  }

  // Send shipping notification if tracking provided
  if (tracking_number) {
    sendOrderStatusEmail(sb, env, storeId, order, 'shipped', tracking_number, tracking_url).catch(() => {});
    emitEvent(sb, env, storeId, 'order.shipped', { ...order, tracking_number, tracking_url }).catch(() => {});
  }

  return json({ ...fulfillment, items }, 201, corsOrigin);
}

async function handleUpdateFulfillment(request, sb, env, storeId, fulfillmentId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const updates = {};
  if (body.tracking_number !== undefined) updates.tracking_number = body.tracking_number;
  if (body.tracking_url !== undefined) updates.tracking_url = body.tracking_url;
  if (body.carrier !== undefined) updates.carrier = body.carrier;
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (body.status === 'delivered') updates.delivered_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) return json({ error: 'No fields to update' }, 400, corsOrigin);

  await sb.update('fulfillments', { id: `eq.${fulfillmentId}`, store_id: `eq.${storeId}` }, updates);
  return json({ updated: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  DIGITAL DOWNLOADS
// ═══════════════════════════════════════════════════════════════

async function handleDigitalDownload(sb, env, storeId, token, corsOrigin) {
  const dl = await sb.query('download_tokens', {
    filters: { store_id: `eq.${storeId}`, token: `eq.${token}` },
    single: true,
  });

  if (!dl) return json({ error: 'Invalid download link' }, 404, corsOrigin);
  if (dl.expires_at && new Date(dl.expires_at) < new Date()) {
    return json({ error: 'Download link has expired' }, 410, corsOrigin);
  }
  if (dl.downloads_used >= dl.max_downloads) {
    return json({ error: `Download limit reached (${dl.max_downloads} downloads)` }, 403, corsOrigin);
  }

  // Get file URL from product
  const product = await sb.query('products', { filters: { id: `eq.${dl.product_id}` }, single: true, select: 'file_url,name' });
  if (!product?.file_url) return json({ error: 'File not available' }, 404, corsOrigin);

  // Increment download count
  await sb.update('download_tokens', { id: `eq.${dl.id}` }, { downloads_used: dl.downloads_used + 1 });

  // Redirect to the file URL
  return new Response(null, {
    status: 302,
    headers: { Location: product.file_url, 'Cache-Control': 'no-store' },
  });
}

// Generate download tokens for digital products in an order
async function generateDownloadTokens(sb, env, storeId, order, orderItems) {
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true, select: 'name,domain,settings' });
  const domain = store?.domain || store?.settings?.domain || 'webnari.io';
  const storeName = store?.name || 'Store';
  const downloads = [];

  for (const item of orderItems) {
    const product = await sb.query('products', { filters: { id: `eq.${item.product_id}` }, single: true, select: 'product_type,file_url,max_downloads,name' });
    if (!product || product.product_type !== 'digital' || !product.file_url) continue;

    const token = randomToken(32);
    await sb.insert('download_tokens', {
      store_id: storeId,
      order_id: order.id,
      order_item_id: item.id,
      product_id: item.product_id,
      token,
      max_downloads: product.max_downloads || 3,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    downloads.push({
      product_name: product.name,
      download_url: `https://${domain}/api/download/${token}?store=${storeId}`,
    });
  }

  // Send download email if there are digital items
  if (downloads.length > 0 && order.customer_email) {
    const downloadLinks = downloads.map(d =>
      `<li style="margin:0 0 8px;"><strong>${esc(d.product_name)}</strong><br><a href="${esc(d.download_url)}" style="color:#2563EB;">Download</a></li>`
    ).join('');

    sendEmail(env, {
      to: order.customer_email,
      subject: `${storeName} — Your Digital Downloads`,
      html: emailShell(storeName, `
        <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Your Downloads Are Ready</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Order ${esc(order.order_number)} — here are your download links:</p>
        <ul style="margin:0 0 24px;padding-left:20px;">${downloadLinks}</ul>
        <p style="margin:0;font-size:12px;color:#9ca3af;">Each link allows up to 3 downloads and expires in 30 days.</p>
      `),
      storeSettings: store?.settings,
    }).catch(err => console.error('Download email failed:', err));
  }
}


// ═══════════════════════════════════════════════════════════════
//  PRODUCT FEEDS (Google Merchant / Meta)
// ═══════════════════════════════════════════════════════════════

async function handleGoogleMerchantFeed(sb, storeId, url, corsOrigin) {
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);
  const domain = store.domain || store.settings?.domain || 'webnari.io';
  const currency = (store.currency || 'USD').toUpperCase();

  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'sort_order.asc',
    limit: 500,
  });

  // Build each product with images
  const items = await Promise.all(products.map(async p => {
    const images = await sb.query('product_images', { filters: { product_id: `eq.${p.id}` }, order: 'sort_order.asc', limit: 1 });
    const imageUrl = images[0]?.url || '';
    const link = `https://${domain}/products/${p.slug || p.id}`;
    const availability = p.in_stock ? 'in_stock' : 'out_of_stock';
    const condition = 'new';
    const price = `${(p.price / 100).toFixed(2)} ${currency}`;
    const salePrice = p.compare_at_price ? `${(p.price / 100).toFixed(2)} ${currency}` : '';

    return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <title>${esc(p.name)}</title>
      <description>${esc((p.description || p.name).slice(0, 5000))}</description>
      <link>${esc(link)}</link>
      <g:image_link>${esc(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>${salePrice ? `\n      <g:sale_price>${salePrice}</g:sale_price>` : ''}
      <g:condition>${condition}</g:condition>
      <g:brand>${esc(store.name || 'Store')}</g:brand>${p.sku ? `\n      <g:gtin>${esc(p.sku)}</g:gtin>` : ''}${p.category ? `\n      <g:product_type>${esc(p.category)}</g:product_type>` : ''}
    </item>`;
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${esc(store.name || 'Store')}</title>
    <link>https://${esc(domain)}</link>
    <description>${esc(store.seo_description || store.name || 'Products')}</description>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}

async function handleMetaCatalogFeed(sb, storeId, url, corsOrigin) {
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);
  const domain = store.domain || store.settings?.domain || 'webnari.io';
  const currency = (store.currency || 'USD').toUpperCase();

  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'sort_order.asc',
    limit: 500,
  });

  // Meta requires TSV (tab-separated values) format
  const header = 'id\ttitle\tdescription\tavailability\tcondition\tprice\tlink\timage_link\tbrand';
  const rows = await Promise.all(products.map(async p => {
    const images = await sb.query('product_images', { filters: { product_id: `eq.${p.id}` }, order: 'sort_order.asc', limit: 1 });
    const imageUrl = images[0]?.url || '';
    const link = `https://${domain}/products/${p.slug || p.id}`;
    const price = `${(p.price / 100).toFixed(2)} ${currency}`;
    const desc = (p.description || p.name || '').replace(/[\t\n\r]/g, ' ').slice(0, 5000);

    return [p.id, p.name, desc, p.in_stock ? 'in stock' : 'out of stock', 'new', price, link, imageUrl, store.name || 'Store'].join('\t');
  }));

  const tsv = [header, ...rows].join('\n');

  return new Response(tsv, {
    status: 200,
    headers: { 'Content-Type': 'text/tab-separated-values; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — CREATE MANUAL/DRAFT ORDER
// ═══════════════════════════════════════════════════════════════

async function handleAdminCreateOrder(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { customer, items, shipping_address, notes, status } = body;

  if (!customer?.email) return json({ error: 'Customer email required' }, 400, corsOrigin);
  if (!items?.length) return json({ error: 'At least one item required' }, 400, corsOrigin);

  const orderStatus = status === 'confirmed' ? 'confirmed' : 'draft';
  const orderNumber = await generateOrderNumber(sb, storeId);

  // Calculate totals from items
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await sb.query('products', {
      filters: { id: `eq.${item.product_id}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!product) return json({ error: `Product not found: ${item.product_id}` }, 400, corsOrigin);

    let price = item.price_override || product.price;
    let itemName = product.name;
    let variantName = null;

    if (item.variant_id) {
      const variant = await sb.query('variants', {
        filters: { id: `eq.${item.variant_id}`, product_id: `eq.${item.product_id}` },
        single: true,
      });
      if (variant) {
        if (!item.price_override && variant.price) price = variant.price;
        variantName = variant.name;
        itemName = `${product.name} — ${variant.name}`;
      }
    }

    const qty = item.quantity || 1;
    subtotal += price * qty;
    orderItems.push({
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: itemName,
      variant_name: variantName,
      sku: product.sku || null,
      price,
      quantity: qty,
      image_url: product.img || null,
    });
  }

  const shippingCost = body.shipping || 0;
  const taxAmount = body.tax || 0;
  const total = subtotal + shippingCost + taxAmount;

  const [order] = await sb.insert('orders', {
    store_id: storeId,
    order_number: orderNumber,
    payment_provider: null,
    status: orderStatus,
    is_manual: true,
    customer_email: customer.email,
    customer_name: customer.name || null,
    customer_phone: customer.phone || null,
    shipping_address: shipping_address || null,
    subtotal,
    shipping: shippingCost,
    tax: taxAmount,
    total,
    notes: notes || null,
  });

  // Insert order items
  for (const oi of orderItems) {
    await sb.insert('order_items', { order_id: order.id, ...oi });
  }

  // If confirmed immediately, deduct inventory
  if (orderStatus === 'confirmed') {
    for (const oi of orderItems) {
      if (oi.variant_id) {
        const v = await sb.query('variants', { filters: { id: `eq.${oi.variant_id}` }, single: true });
        if (v) await sb.update('variants', { id: `eq.${oi.variant_id}` }, { stock_quantity: Math.max(0, v.stock_quantity - oi.quantity) });
      } else {
        const p = await sb.query('products', { filters: { id: `eq.${oi.product_id}` }, single: true });
        if (p && p.track_inventory) await sb.update('products', { id: `eq.${oi.product_id}` }, { stock_quantity: Math.max(0, p.stock_quantity - oi.quantity) });
      }
    }
    emitEvent(sb, env, storeId, 'order.created', order).catch(() => {});
  }

  return json(order, 201, corsOrigin);
}


async function handleUpdateOrder(request, sb, env, storeId, orderId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  const body = await request.json();
  const allowed = ['status', 'tracking_number', 'tracking_url', 'label_url', 'notes'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  // Handle draft → confirmed transition (deduct inventory + send email)
  if (updates.status === 'confirmed') {
    const order = await sb.query('orders', {
      filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (order && order.status === 'draft') {
      const items = await sb.query('order_items', { filters: { order_id: `eq.${orderId}` } });
      for (const item of items) {
        if (item.variant_id) {
          const v = await sb.query('variants', { filters: { id: `eq.${item.variant_id}` }, single: true });
          if (v) await sb.update('variants', { id: `eq.${item.variant_id}` }, { stock_quantity: Math.max(0, v.stock_quantity - item.quantity) });
        } else {
          const p = await sb.query('products', { filters: { id: `eq.${item.product_id}` }, single: true });
          if (p && p.track_inventory) await sb.update('products', { id: `eq.${item.product_id}` }, { stock_quantity: Math.max(0, p.stock_quantity - item.quantity) });
        }
      }
      // Send confirmation email
      const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
      if (store) {
        sendOrderConfirmationEmail(sb, env, storeId, { ...order, status: 'confirmed' }, store).catch(() => {});
      }
      emitEvent(sb, env, storeId, 'order.created', { ...order, status: 'confirmed' }).catch(() => {});
    }
  }

  // Handle refund (full or partial)
  const isFullRefund = updates.status === 'refunded';
  const isPartialRefund = body.refund_amount && !isFullRefund;

  if (isFullRefund || isPartialRefund) {
    const order = await sb.query('orders', {
      filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!order) return json({ error: 'Order not found' }, 404, corsOrigin);

    // Determine refund amount
    const previouslyRefunded = order.refund_amount || 0;
    const remaining = order.total - previouslyRefunded;
    const refundAmount = isFullRefund ? remaining : Math.min(body.refund_amount, remaining);

    if (refundAmount <= 0) return json({ error: 'Nothing left to refund' }, 400, corsOrigin);

    // Process payment provider refund
    if (order.payment_provider === 'stripe' && order.stripe_payment_intent) {
      const stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
      if (stripeKey) {
        const refundBody = `payment_intent=${order.stripe_payment_intent}&amount=${refundAmount}`;
        const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: refundBody,
        });
        if (!refundRes.ok) {
          const err = await refundRes.json();
          return json({ error: 'Refund failed', details: err.error?.message }, 500, corsOrigin);
        }
      }
    }

    if (order.payment_provider === 'square' && order.square_payment_id) {
      const accessToken = getStoreSecret(env, storeId, 'SQUARE_ACCESS_TOKEN');
      if (accessToken) {
        const refundRes = await fetch('https://connect.squareup.com/v2/refunds', {
          method: 'POST',
          headers: { 'Square-Version': '2024-01-18', Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ idempotency_key: crypto.randomUUID(), payment_id: order.square_payment_id, amount_money: { amount: refundAmount, currency: (order.currency || 'USD').toUpperCase() } }),
        });
        if (!refundRes.ok) {
          const err = await refundRes.json();
          return json({ error: 'Refund failed', details: err.errors?.[0]?.detail }, 500, corsOrigin);
        }
      }
    }

    if (order.payment_provider === 'paypal' && order.paypal_capture_id) {
      const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
      const ppClientId = store?.settings?.paypal_client_id;
      const ppSecret = store?.settings?.paypal_client_secret;
      const ppMode = store?.settings?.paypal_mode || 'sandbox';
      if (ppClientId && ppSecret) {
        const ppBase = ppMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        const authRes = await fetch(`${ppBase}/v1/oauth2/token`, {
          method: 'POST',
          headers: { Authorization: `Basic ${btoa(`${ppClientId}:${ppSecret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials',
        });
        if (authRes.ok) {
          const { access_token } = await authRes.json();
          await fetch(`${ppBase}/v2/payments/captures/${order.paypal_capture_id}/refund`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: { value: (refundAmount / 100).toFixed(2), currency_code: (order.currency || 'USD').toUpperCase() } }),
          });
        }
      }
    }

    // Update cumulative refund amount
    const newRefundTotal = previouslyRefunded + refundAmount;
    updates.refund_amount = newRefundTotal;
    if (newRefundTotal >= order.total) {
      updates.status = 'refunded';
    } else if (!isFullRefund) {
      updates.status = 'partially_refunded';
    }

    // Restore inventory for refunded items
    if (body.refund_items && Array.isArray(body.refund_items)) {
      // Partial: restore specific items
      for (const ri of body.refund_items) {
        const orderItem = await sb.query('order_items', { filters: { id: `eq.${ri.order_item_id}` }, single: true });
        if (!orderItem) continue;
        const refundQty = Math.min(ri.quantity, orderItem.quantity - (orderItem.refunded_quantity || 0));
        if (refundQty <= 0) continue;
        await sb.update('order_items', { id: `eq.${ri.order_item_id}` }, { refunded_quantity: (orderItem.refunded_quantity || 0) + refundQty });
        // Restore stock
        if (orderItem.variant_id) {
          const v = await sb.query('variants', { filters: { id: `eq.${orderItem.variant_id}` }, single: true });
          if (v) await sb.update('variants', { id: `eq.${orderItem.variant_id}` }, { stock_quantity: v.stock_quantity + refundQty });
        } else {
          const p = await sb.query('products', { filters: { id: `eq.${orderItem.product_id}` }, single: true });
          if (p) await sb.update('products', { id: `eq.${orderItem.product_id}` }, { stock_quantity: p.stock_quantity + refundQty });
        }
      }
    } else if (isFullRefund) {
      // Full refund: restore all inventory
      const items = await sb.query('order_items', { filters: { order_id: `eq.${orderId}` } });
      for (const item of items) {
        const restoreQty = item.quantity - (item.refunded_quantity || 0);
        if (restoreQty <= 0) continue;
        await sb.update('order_items', { id: `eq.${item.id}` }, { refunded_quantity: item.quantity });
        if (item.variant_id) {
          const variant = await sb.query('variants', { filters: { id: `eq.${item.variant_id}` }, single: true });
          if (variant) await sb.update('variants', { id: `eq.${item.variant_id}` }, { stock_quantity: variant.stock_quantity + restoreQty });
        } else {
          const product = await sb.query('products', { filters: { id: `eq.${item.product_id}` }, single: true });
          if (product) await sb.update('products', { id: `eq.${item.product_id}` }, { stock_quantity: product.stock_quantity + restoreQty });
        }
      }
    }
  }

  const result = await sb.update('orders',
    { id: `eq.${orderId}`, store_id: `eq.${storeId}` },
    updates
  );

  // Send shipping/delivery email notifications (non-blocking)
  if (updates.status === 'shipped' || updates.status === 'delivered') {
    const updatedOrder = result[0] || await sb.query('orders', {
      filters: { id: `eq.${orderId}`, store_id: `eq.${storeId}` }, single: true,
    });
    if (updatedOrder) {
      sendOrderStatusEmail(
        sb, env, storeId, updatedOrder, updates.status,
        updates.tracking_number || updatedOrder.tracking_number,
        updates.tracking_url || updatedOrder.tracking_url
      ).catch(err => console.error('Order status email failed:', err));
    }
  }

  // Emit webhook events for order updates
  const orderData = result[0] || { id: orderId, ...updates };
  emitEvent(sb, env, storeId, 'order.updated', orderData).catch(err => console.error('Webhook emit error:', err));
  if (updates.status === 'shipped') emitEvent(sb, env, storeId, 'order.shipped', orderData).catch(() => {});
  if (updates.status === 'delivered') emitEvent(sb, env, storeId, 'order.delivered', orderData).catch(() => {});
  if (updates.status === 'cancelled') emitEvent(sb, env, storeId, 'order.cancelled', orderData).catch(() => {});
  if (updates.status === 'refunded') emitEvent(sb, env, storeId, 'order.refunded', orderData).catch(() => {});

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

  // Emit inventory.updated webhook event
  emitEvent(sb, env, storeId, 'inventory.updated', { productId, ...body }).catch(() => {});

  // Check for low stock
  if (body.stockQuantity !== undefined) {
    const product = await sb.query('products', { filters: { id: `eq.${productId}`, store_id: `eq.${storeId}` }, single: true });
    if (product && body.stockQuantity <= (product.low_stock_threshold || 5)) {
      emitEvent(sb, env, storeId, 'inventory.low_stock', { productId, name: product.name, stock_quantity: body.stockQuantity, threshold: product.low_stock_threshold || 5 }).catch(() => {});
      dispatchToIntegrations(sb, env, storeId, 'inventory.low_stock', { productId, name: product.name, stock_quantity: body.stockQuantity }).catch(() => {});
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


// ═══════════════════════════════════════════════════════════
//  SHIPPING RATES — EasyPost carrier-calculated rates
// ═══════════════════════════════════════════════════════════

async function handleShippingRates(request, sb, env, storeId, corsOrigin) {
  // Check per-store Shippo key first, then fall back to env
  const storeForKey = await sb.query('stores', {
    filters: { id: `eq.${storeId}` }, single: true, select: 'settings',
  });
  const apiKey = storeForKey?.settings?.shippo_api_key || env.SHIPPO_API_KEY;
  if (!apiKey) {
    return json({ error: 'Carrier rates not configured' }, 501, corsOrigin);
  }

  const body = await request.json();
  const { toZip, items } = body;
  // items: [{ productId, variantId?, quantity }]

  if (!toZip || !items || !items.length) {
    return json({ error: 'toZip and items required' }, 400, corsOrigin);
  }

  // Get store config (origin address + shipping rules for fallback)
  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    single: true,
    select: 'settings,shipping_rules',
  });
  const settings = store?.settings || {};
  const fromZip = settings.origin_zip || settings.zip || '33444';
  const fromCity = settings.origin_city || settings.city || 'Delray Beach';
  const fromState = settings.origin_state || settings.state || 'FL';

  // Look up product weights/dimensions
  const productIds = [...new Set(items.map(i => i.productId))];
  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}`, id: `in.(${productIds.join(',')})` },
    select: 'id,weight_oz,length_in,width_in,height_in',
  });

  const productMap = {};
  for (const p of products || []) productMap[p.id] = p;

  // Calculate total weight and find largest dimensions
  let totalWeightOz = 0;
  let maxLength = 0, maxWidth = 0, totalHeight = 0;

  for (const item of items) {
    const p = productMap[item.productId];
    const qty = item.quantity || 1;

    // Default: 8oz per item if weight not set
    const weight = parseFloat(p?.weight_oz) || 8;
    totalWeightOz += weight * qty;

    // Track dimensions — pack items stacked (heights add up)
    const l = parseFloat(p?.length_in) || 10;
    const w = parseFloat(p?.width_in) || 8;
    const h = parseFloat(p?.height_in) || 3;
    if (l > maxLength) maxLength = l;
    if (w > maxWidth) maxWidth = w;
    totalHeight += h * qty;
  }

  // Cap total height at a reasonable max
  if (totalHeight > 36) totalHeight = 36;

  // Convert oz to lb for Shippo
  const weightLb = (totalWeightOz / 16).toFixed(2);

  // Call Shippo — create shipment with async: false to get rates immediately
  const shippoRes = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: {
      'Authorization': `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address_from: {
        city: fromCity,
        state: fromState,
        zip: fromZip,
        country: 'US',
      },
      address_to: {
        zip: toZip,
        country: 'US',
      },
      parcels: [{
        length: String(Math.ceil(maxLength)),
        width: String(Math.ceil(maxWidth)),
        height: String(Math.ceil(totalHeight)),
        distance_unit: 'in',
        weight: weightLb,
        mass_unit: 'lb',
      }],
      async: false,
    }),
  });

  if (!shippoRes.ok) {
    const err = await shippoRes.text();
    console.error('Shippo error:', shippoRes.status, err);
    // Fall back to rule-based shipping
    const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
    const fallback = calculateShippingFromRules(store?.shipping_rules || [], subtotal);
    return json({
      rates: [{ carrier: 'Standard', service: 'Flat Rate', rate: fallback, deliveryDays: null }],
      fallback: true,
    }, 200, corsOrigin);
  }

  const shipment = await shippoRes.json();

  // Format rates for the storefront
  const rates = (shipment.rates || [])
    .map(r => ({
      id: r.object_id,
      carrier: r.provider,
      service: r.servicelevel?.name || r.servicelevel?.token || 'Standard',
      rate: Math.round(parseFloat(r.amount) * 100), // convert dollars to cents
      deliveryDays: r.estimated_days || r.duration_terms || null,
    }))
    .sort((a, b) => a.rate - b.rate); // cheapest first

  return json({ rates, shipmentId: shipment.object_id }, 200, corsOrigin);
}

async function handleCalculateTax(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { subtotal, state, zip } = body;  // subtotal in cents, state 2-letter, zip 5-digit

  if (!subtotal) {
    return json({ error: 'subtotal (cents) required' }, 400, corsOrigin);
  }
  if (!zip && !state) {
    return json({ error: 'zip (5-digit) or state (2-letter code) required' }, 400, corsOrigin);
  }

  // ── Priority 1: Zip-code level (municipal accuracy) ──
  // ── Priority 2: State-level sentinel (_FL, _CA, etc.) ──
  // Both wrapped in try-catch: tax_rates table may not exist yet
  try {
    if (zip) {
      const zipRate = await sb.query('tax_rates', {
        filters: { zip: `eq.${zip}` },
        single: true,
      });

      if (zipRate) {
        const rate = parseFloat(zipRate.combined_rate);
        const taxAmount = Math.round(subtotal * rate);
        const county = zipRate.county ? ` (${zipRate.county})` : '';
        return json({
          taxAmount,
          rate,
          stateRate: parseFloat(zipRate.state_rate),
          countyRate: parseFloat(zipRate.county_rate),
          cityRate: parseFloat(zipRate.city_rate),
          specialRate: parseFloat(zipRate.special_rate),
          label: `${zipRate.state} Sales Tax${county}`,
          state: zipRate.state,
          zip,
        }, 200, corsOrigin);
      }
    }

    if (state) {
      const stateRate = await sb.query('tax_rates', {
        filters: { zip: `eq._${state}` },
        single: true,
      });

      if (stateRate) {
        const rate = parseFloat(stateRate.combined_rate);
        const taxAmount = Math.round(subtotal * rate);
        return json({
          taxAmount,
          rate,
          stateRate: parseFloat(stateRate.state_rate),
          countyRate: parseFloat(stateRate.county_rate),
          cityRate: parseFloat(stateRate.city_rate),
          specialRate: parseFloat(stateRate.special_rate),
          label: `${stateRate.state} Sales Tax (state base)`,
          state: stateRate.state,
          zip: zip || null,
        }, 200, corsOrigin);
      }
    }
  } catch (e) {
    console.error('tax_rates lookup failed (table may not exist yet):', e.message);
    // Fall through to legacy store_tax_rates
  }

  // ── Priority 3: Fall back to state-level (legacy store_tax_rates) ──
  const stateCode = state;
  if (stateCode) {
    const taxRate = await sb.query('store_tax_rates', {
      filters: { store_id: `eq.${storeId}`, state: `eq.${stateCode}` },
      single: true,
    });

    if (taxRate) {
      const rate = parseFloat(taxRate.rate);
      const taxAmount = Math.round(subtotal * rate);
      return json({ taxAmount, rate, label: taxRate.label, state: stateCode, zip: zip || null }, 200, corsOrigin);
    }
  }

  // ── No tax data found ──
  return json({ taxAmount: 0, rate: 0, label: 'No tax', state: state || null, zip: zip || null }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  TAX RATE BULK AUDIT (Admin)
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/admin/tax-audit
 * Body: { states: ["TX","CA","NY"] }  — or omit for all states
 * Fetches real combined rates from Avalara for one zip per county,
 * then updates all zips in that county.
 */
async function handleAdminTaxAudit(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  const body = await request.json().catch(() => ({}));
  const targetStates = body.states || null; // null = process all

  // Get all zips grouped by state+county
  let allRates;
  try {
    const filters = {};
    if (targetStates && targetStates.length) {
      filters.state = `in.(${targetStates.join(',')})`;
    }
    allRates = await sb.query('tax_rates', {
      select: 'zip,state,county,combined_rate',
      filters,
      limit: 50000,
    });
  } catch (err) {
    return json({ error: 'Failed to query tax_rates: ' + err.message }, 500, corsOrigin);
  }

  if (!allRates || !allRates.length) {
    return json({ error: 'No tax rates found' }, 404, corsOrigin);
  }

  // Group by state+county, pick one representative zip per county
  const countyMap = {};
  for (const row of allRates) {
    const key = `${row.state}|${row.county || 'unknown'}`;
    if (!countyMap[key]) {
      countyMap[key] = { state: row.state, county: row.county, sampleZip: row.zip, zips: [] };
    }
    countyMap[key].zips.push(row.zip);
  }

  const counties = Object.values(countyMap);
  let checked = 0;
  let updated = 0;
  let errors = 0;
  const updates = [];

  // Process each county — fetch rate for sample zip
  for (const county of counties) {
    // Skip sentinel rows (_FL, _CA, etc.)
    if (county.sampleZip.startsWith('_')) continue;

    try {
      const avalaraRate = await fetchAvalaraRate(county.sampleZip);
      checked++;

      if (avalaraRate === null) continue;

      const newRate = avalaraRate / 100; // Convert 7.5 → 0.075
      const oldRate = parseFloat(
        allRates.find(r => r.zip === county.sampleZip)?.combined_rate || 0
      );

      if (Math.abs(oldRate - newRate) > 0.0001) {
        // Update all zips in this county
        for (const zip of county.zips) {
          if (zip.startsWith('_')) continue;
          await sb.update('tax_rates', { zip: `eq.${zip}` }, {
            combined_rate: newRate,
            source: 'avalara-audit',
            updated_at: new Date().toISOString(),
          });
        }
        updates.push({
          state: county.state,
          county: county.county,
          oldRate,
          newRate,
          zipsUpdated: county.zips.filter(z => !z.startsWith('_')).length,
        });
        updated += county.zips.filter(z => !z.startsWith('_')).length;
      }
    } catch (err) {
      errors++;
      console.warn(`Tax audit error for ${county.state}/${county.county}:`, err.message);
    }
  }

  return json({
    countiesChecked: checked,
    zipsUpdated: updated,
    errors,
    updates,
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
// ═══════════════════════════════════════════════════════════════
//  PUBLIC — PRODUCTS (no auth required, read-only)
// ═══════════════════════════════════════════════════════════════

// Helper: enrich a product row with images, variants, and reviews for public API
async function enrichProductForPublic(sb, product) {
  const [images, variants, reviews, tagRows] = await Promise.all([
    sb.query('product_images', { filters: { product_id: `eq.${product.id}` }, order: 'sort_order.asc' }),
    sb.query('variants', { filters: { product_id: `eq.${product.id}` }, order: 'sort_order.asc' }),
    sb.query('reviews', { filters: { product_id: `eq.${product.id}`, approved: 'eq.true' }, order: 'created_at.desc' }),
    sb.query('product_tags', { filters: { product_id: `eq.${product.id}` }, select: 'tag' }).catch(() => []),
  ]);

  const variantsWithImgs = await Promise.all(variants.map(async v => {
    const vImages = await sb.query('variant_images', {
      filters: { variant_id: `eq.${v.id}` },
      order: 'sort_order.asc',
    });
    return {
      id: v.id,
      name: v.name,
      color: v.color || '',
      price: v.price || product.price,
      inStock: v.in_stock ?? true,
      imgs: vImages.map(i => i.url),
    };
  }));

  const imgUrls = images.map(i => i.url);

  return {
    id: product.slug || product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    badge: product.badge || null,
    inStock: product.in_stock ?? true,
    img: imgUrls[0] || '',
    imgs: imgUrls,
    desc: product.description || '',
    rating: parseFloat(product.rating) || 0,
    reviewCount: reviews.length,
    isCollection: product.is_collection || false,
    reviews: reviews.map(r => ({ name: r.name, text: r.text, rating: r.rating, date: r.created_at?.slice(0, 10) || '' })),
    variants: variantsWithImgs.length > 0 ? variantsWithImgs : undefined,
    tags: tagRows.map(t => t.tag),
  };
}

async function handlePublicListProducts(sb, storeId, url, corsOrigin) {
  const category = url.searchParams.get('category');
  const tag = url.searchParams.get('tag');
  const filters = { store_id: `eq.${storeId}` };
  if (category) filters.category = `eq.${category}`;

  let products = await sb.query('products', {
    filters,
    order: 'sort_order.asc,created_at.desc',
    limit: 100,
  });

  // Filter by tag if requested
  if (tag) {
    try {
      const taggedIds = (await sb.query('product_tags', {
        filters: { store_id: `eq.${storeId}`, tag: `eq.${tag.toLowerCase().trim()}` },
        select: 'product_id',
      })).map(t => t.product_id);
      products = products.filter(p => taggedIds.includes(p.id));
    } catch (e) { /* product_tags may not exist */ }
  }

  const enriched = await Promise.all(products.map(p => enrichProductForPublic(sb, p)));
  return json(enriched, 200, corsOrigin);
}

async function handlePublicGetProduct(sb, storeId, productId, corsOrigin) {
  // Try by ID first, then by slug
  let product = await sb.query('products', {
    filters: { id: `eq.${productId}`, store_id: `eq.${storeId}` },
    single: true,
  });
  if (!product) {
    product = await sb.query('products', {
      filters: { slug: `eq.${productId}`, store_id: `eq.${storeId}` },
      single: true,
    });
  }
  if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

  const enriched = await enrichProductForPublic(sb, product);
  return json(enriched, 200, corsOrigin);
}

async function handlePublicFeaturedProducts(sb, storeId, url, corsOrigin) {
  const limit = parseInt(url.searchParams.get('limit') || '4');
  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'sort_order.asc',
    limit,
  });

  const enriched = await Promise.all(products.map(p => enrichProductForPublic(sb, p)));
  return json(enriched, 200, corsOrigin);
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

  // Emit product.created webhook event
  emitEvent(sb, env, storeId, 'product.created', product).catch(() => {});

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

  // Emit product.updated webhook event
  emitEvent(sb, env, storeId, 'product.updated', { id: productId, ...updates }).catch(() => {});

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Emit product.deleted webhook event before deleting
  emitEvent(sb, env, storeId, 'product.deleted', { id: productId }).catch(() => {});

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
//  ADMIN — TAGS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListTags(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);
  try {
    const tags = await sb.query('product_tags', { filters: { store_id: `eq.${storeId}` }, select: 'tag' });
    const unique = [...new Set(tags.map(t => t.tag))].sort();
    return json(unique, 200, corsOrigin);
  } catch (e) {
    return json([], 200, corsOrigin);
  }
}

async function handleAdminSetProductTags(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const tags = body.tags || [];

  // Verify product belongs to store
  const product = await sb.query('products', { filters: { id: `eq.${productId}`, store_id: `eq.${storeId}` }, single: true });
  if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

  // Delete existing tags
  try { await sb.delete('product_tags', { product_id: `eq.${productId}` }); } catch (e) { /* table may not exist */ }

  // Insert new tags
  if (tags.length > 0) {
    for (const tag of tags) {
      await sb.insert('product_tags', {
        store_id: storeId,
        product_id: productId,
        tag: tag.toLowerCase().trim(),
      });
    }
  }

  return json({ tags }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — STAFF MANAGEMENT (RBAC)
// ═══════════════════════════════════════════════════════════════

async function handleAdminListStaff(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const staff = await sb.query('store_admins', {
    filters: { store_id: `eq.${storeId}` },
    select: 'id,role,permissions,name,email,created_at',
    order: 'created_at.asc',
  });

  return json({ staff, available_permissions: PERMISSION_SCOPES }, 200, corsOrigin);
}

async function handleAdminCreateStaff(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { name, email, role, permissions } = body;

  if (!name || !email) return json({ error: 'Name and email required' }, 400, corsOrigin);

  // Generate a unique API key for this staff member
  const rawKey = `wsk_${storeId}_${randomToken(24)}`;
  const keyHash = await sha256(rawKey);

  const staffRole = role === 'owner' ? 'owner' : 'manager';
  const staffPermissions = staffRole === 'owner' ? ['*'] : (permissions || []);

  const [staffMember] = await sb.insert('store_admins', {
    store_id: storeId,
    user_id: null,
    role: staffRole,
    permissions: staffPermissions,
    api_key_hash: keyHash,
    name,
    email,
  });

  return json({
    id: staffMember.id,
    name,
    email,
    role: staffRole,
    permissions: staffPermissions,
    api_key: rawKey, // Only returned once — admin must save this
  }, 201, corsOrigin);
}

async function handleAdminUpdateStaff(request, sb, env, storeId, staffId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.email !== undefined) updates.email = body.email;
  if (body.role !== undefined) updates.role = body.role;
  if (body.permissions !== undefined) updates.permissions = body.permissions;

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No valid fields to update' }, 400, corsOrigin);
  }

  await sb.update('store_admins', { id: `eq.${staffId}`, store_id: `eq.${storeId}` }, updates);
  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteStaff(request, sb, env, storeId, staffId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('store_admins', { id: `eq.${staffId}`, store_id: `eq.${storeId}` });
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

  // Emit review.approved webhook event
  if (body.approved === true) {
    emitEvent(sb, env, storeId, 'review.approved', { id: reviewId, ...body }).catch(() => {});
  }

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

async function handleAdminGetStore(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    single: true,
  });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  return json(store, 200, corsOrigin);
}

async function handleAdminUpdateStore(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['name', 'domain', 'currency', 'payment_provider', 'shipping_rules', 'settings',
    'seo_title', 'seo_description', 'social_image_url', 'logo_url', 'business_phone', 'business_address', 'social_links', 'business_type'];
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
  if (!body.code && !body.is_automatic) return json({ error: 'Discount code required' }, 400, corsOrigin);

  // Normalize type name from admin UI
  const discountType = (body.type === 'buy_x_get_y') ? 'bxgy' : (body.type || 'percentage');

  // Build BXGY config if applicable
  const config = discountType === 'bxgy' ? {
    buy_min_qty: parseInt(body.buy_min_qty) || 2,
    buy_category: body.buy_category || null,
    get_qty: parseInt(body.get_qty) || 1,
    get_category: body.get_category || null,
    get_discount_percent: parseFloat(body.get_discount_percent) || 100,
  } : (body.config || {});

  const discount = await sb.insert('discounts', {
    store_id: storeId,
    code: body.is_automatic ? `AUTO_${crypto.randomUUID().slice(0, 8).toUpperCase()}` : body.code.toUpperCase().replace(/\s+/g, ''),
    type: discountType,
    value: body.value || 0,
    min_order: body.min_order || body.min_subtotal || 0,
    max_uses: body.max_uses || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
    starts_at: body.starts_at || null,
    expires_at: body.expires_at || null,
    config,
    auto_apply: body.is_automatic || body.auto_apply || false,
  });

  return json(discount, 201, corsOrigin);
}

async function handleAdminUpdateDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['code', 'type', 'value', 'min_order', 'max_uses', 'is_active', 'starts_at', 'expires_at', 'config', 'auto_apply'];
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

  // Emit blog.published webhook event
  if (body.published) {
    emitEvent(sb, env, storeId, 'blog.published', post).catch(() => {});
  }

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

  // Emit blog.published webhook event
  if (updates.published === true) {
    emitEvent(sb, env, storeId, 'blog.published', { id: postId, ...updates }).catch(() => {});
  }

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


// ═══════════════════════════════════════════════════════════
//  ABANDONED CART — Save + Recovery
// ═══════════════════════════════════════════════════════════

async function handleSaveCart(request, sb, storeId, corsOrigin) {
  const data = await request.json();
  const { sessionId, email, items, total } = data;

  if (!sessionId || !items || !items.length) {
    return json({ error: 'sessionId and items required' }, 400, corsOrigin);
  }

  // Upsert by store_id + session_id
  const existing = await sb.query('saved_carts', {
    filters: { store_id: `eq.${storeId}`, session_id: `eq.${sessionId}` },
    single: true,
    select: 'id',
  });

  if (existing) {
    await sb.update('saved_carts', {
      items: JSON.stringify(items),
      total: total || 0,
      email: email || existing.email || null,
      updated_at: new Date().toISOString(),
    }, { id: `eq.${existing.id}` });
  } else {
    await sb.insert('saved_carts', {
      store_id: storeId,
      session_id: sessionId,
      email: email || null,
      items: JSON.stringify(items),
      total: total || 0,
    });
  }

  return json({ saved: true }, 200, corsOrigin);
}

async function handleAbandonedCartCron(env) {
  const sb = createSupabaseClient(env);

  // Find carts: have email, not recovered, no recovery email sent, older than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const carts = await sb.query('saved_carts', {
    filters: {
      email: 'not.is.null',
      recovered: 'eq.false',
      recovery_email_sent_at: 'is.null',
      updated_at: `lt.${oneHourAgo}`,
    },
    select: 'id,store_id,email,items,total',
    limit: 50,  // batch size per cron run
  });

  if (!carts || !carts.length) {
    console.log('Abandoned cart cron: no carts to recover');
    return;
  }

  // Group by store to look up store names once
  const storeIds = [...new Set(carts.map(c => c.store_id))];
  const stores = {};
  for (const sid of storeIds) {
    const store = await sb.query('stores', {
      filters: { id: `eq.${sid}` }, single: true, select: 'name,domain,settings',
    });
    if (store) stores[sid] = store;
  }

  let sent = 0;
  for (const cart of carts) {
    const store = stores[cart.store_id];
    if (!store) continue;

    // Respect email notification toggles
    const toggles = store.settings?.email_notifications || {};
    if (toggles.abandonedCart === false) continue;

    const storeName = store.name || 'Store';
    const domain = store.domain || store.settings?.domain || 'webnari.io';
    const shopUrl = `https://${domain}`;
    const storeEmail = store.settings?.email || null;

    const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    const html = emailAbandonedCart(storeName, items, cart.total, shopUrl);

    await sendEmail(env, {
      to: cart.email,
      subject: `${storeName} — You left items in your cart!`,
      html,
      replyTo: storeEmail,
      storeSettings: store?.settings,
    });

    // Mark as sent
    await sb.update('saved_carts', {
      recovery_email_sent_at: new Date().toISOString(),
    }, { id: `eq.${cart.id}` });

    sent++;
  }

  console.log(`Abandoned cart cron: sent ${sent} recovery emails`);
}

async function handleCartRecoveryStats(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) {
    return json({ error: 'Unauthorized' }, 401, corsOrigin);
  }

  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // All carts for this store
  const allCarts = await sb.query('saved_carts', {
    filters: { store_id: `eq.${storeId}` },
    select: 'id,recovered,recovery_email_sent_at,total,created_at',
  }) || [];

  const totalCarts = allCarts.length;

  // Abandoned in last 24h: created in last 24h and not recovered
  const abandoned24h = allCarts.filter(c =>
    c.created_at >= oneDayAgo && !c.recovered
  ).length;

  // Recovery emails sent in last 24h
  const emailsSent24h = allCarts.filter(c =>
    c.recovery_email_sent_at && c.recovery_email_sent_at >= oneDayAgo
  ).length;

  // Recovery emails sent in last 7 days
  const emailsSent7d = allCarts.filter(c =>
    c.recovery_email_sent_at && c.recovery_email_sent_at >= sevenDaysAgo
  ).length;

  // Total emails ever sent
  const totalEmailsSent = allCarts.filter(c => c.recovery_email_sent_at).length;

  // Recovered all time
  const recoveredTotal = allCarts.filter(c => c.recovered).length;

  // Recovered in last 7 days
  const recovered7d = allCarts.filter(c =>
    c.recovered && c.created_at >= sevenDaysAgo
  ).length;

  // Recovery rate: recovered / total emails sent
  const recoveryRate = totalEmailsSent > 0
    ? Math.round((recoveredTotal / totalEmailsSent) * 10000) / 100
    : 0;

  // Pending recovery: have email, not recovered, no recovery email sent yet
  const pendingRecovery = allCarts.filter(c =>
    !c.recovered && !c.recovery_email_sent_at
  ).length;

  return json({
    totalCarts,
    abandoned24h,
    emailsSent24h,
    emailsSent7d,
    recoveredTotal,
    recovered7d,
    recoveryRate,
    pendingRecovery,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════
//  TAX RATE AUDIT — Monthly spot-check against Avalara
// ═══════════════════════════════════════════════════════════

async function handleTaxRateAuditCron(env) {
  const sb = createSupabaseClient(env);

  // Grab all zip codes from tax_rates, then sample 50 randomly
  let allRates;
  try {
    allRates = await sb.query('tax_rates', { select: 'zip,combined_rate' });
  } catch (err) {
    console.error('Tax audit: failed to query tax_rates table', err.message);
    return;
  }

  if (!allRates || !allRates.length) {
    console.log('Tax audit: no tax rates in database — skipping');
    return;
  }

  // Fisher-Yates shuffle and take first 50
  const shuffled = [...allRates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const sample = shuffled.slice(0, 50);

  let checked = 0;
  let updated = 0;

  for (const row of sample) {
    try {
      const avalaraRate = await fetchAvalaraRate(row.zip);
      checked++;

      if (avalaraRate === null) continue; // couldn't parse, skip

      // Compare with 4 decimal places to avoid float noise
      const dbRate = parseFloat(row.combined_rate);
      const avalaraDecimal = avalaraRate / 100; // Avalara returns 7.0, we store 0.07
      if (Math.abs(dbRate - avalaraDecimal) > 0.0001) {
        await sb.update('tax_rates', { zip: `eq.${row.zip}` }, {
          combined_rate: avalaraDecimal,
          source: 'cron',
          updated_at: new Date().toISOString(),
        });
        console.log(`Tax audit: updated zip ${row.zip} rate ${dbRate} → ${avalaraDecimal}`);
        updated++;
      }
    } catch (err) {
      console.warn(`Tax audit: error checking zip ${row.zip}:`, err.message);
      // Continue to next zip — don't let one failure stop the whole audit
    }
  }

  console.log(`Tax audit complete: checked ${checked}/${sample.length}, updated ${updated}`);
}

async function fetchAvalaraRate(zip) {
  const url = `https://www.avalara.com/taxrates/en/state-rates/zip/${zip}.html`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WebnariCommerceBot/1.0 (tax-rate-audit)' },
  });

  if (!res.ok) {
    console.warn(`Tax audit: Avalara returned ${res.status} for zip ${zip}`);
    return null;
  }

  const html = await res.text();

  // Look for combined rate pattern — Avalara pages show "X.XX%" or "X.XXX%"
  // Common patterns: "Combined Rate" ... "8.875%", or class-based markup
  const patterns = [
    /combined\s*(?:sales\s*)?(?:tax\s*)?rate[^%]*?(\d{1,2}\.\d{1,4})%/i,
    /(\d{1,2}\.\d{1,4})%\s*combined/i,
    /combined[^<]{0,200}?(\d{1,2}\.\d{1,4})\s*%/i,
    /total\s*(?:sales\s*)?(?:tax\s*)?rate[^%]*?(\d{1,2}\.\d{1,4})%/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const rate = parseFloat(match[1]);
      // Sanity check: US combined tax rates are 0-15%
      if (rate >= 0 && rate <= 15) {
        return rate;
      }
    }
  }

  console.warn(`Tax audit: could not parse rate for zip ${zip}`);
  return null;
}


// ═══════════════════════════════════════════════════════════
//  CUSTOMER AUTH — Registration, Login, Password Reset, JWT
// ═══════════════════════════════════════════════════════════

// ── Crypto helpers (Web Crypto API — works in Cloudflare Workers) ──

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const [, iterations, saltHex, hashHex] = stored.split(':');
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: parseInt(iterations), hash: 'SHA-256' },
    keyMaterial, 256
  );
  const computed = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return computed === hashHex;
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(bytes = 32) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const b64url = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = b64url(header);
  const payloadB64 = b64url(payload);
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sigB64}`;
}

async function verifyJWT(token, secret) {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${headerB64}.${payloadB64}`));
    if (!valid) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function authenticateCustomer(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const secret = env.JWT_SECRET || env.ADMIN_API_KEY || 'webnari-jwt-secret';
  return await verifyJWT(token, secret);
}

// ── Auth Handlers ──

async function handleCustomerRegister(request, sb, env, storeId, corsOrigin) {
  const { email, password, name, phone } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password required' }, 400, corsOrigin);
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400, corsOrigin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400, corsOrigin);
  }

  // Check if customer already exists
  const existing = await sb.query('customers', {
    filters: { store_id: `eq.${storeId}`, email: `eq.${email.toLowerCase().trim()}` },
    single: true, select: 'id',
  });
  if (existing) {
    return json({ error: 'An account with this email already exists' }, 409, corsOrigin);
  }

  // Hash password and create customer
  const passwordHash = await hashPassword(password);

  // Generate email verification token
  const verificationRaw = randomToken(32);
  const verificationHash = await sha256(verificationRaw);

  const customer = await sb.insert('customers', {
    store_id: storeId,
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    name: name || null,
    phone: phone || null,
    email_verified: false,
    verification_token: verificationHash,
    verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
  });

  // Send verification email (non-blocking)
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true, select: 'name,domain,settings' });
  const storeName = store?.name || 'Store';
  const domain = store?.domain || store?.settings?.domain || 'webnari.io';
  const verifyUrl = `https://${domain}/verify-email?token=${verificationRaw}&store=${storeId}`;

  sendEmail(env, {
    to: email.toLowerCase().trim(),
    subject: `${storeName} — Verify Your Email`,
    html: emailShell(storeName, `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Verify Your Email</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Thanks for creating an account! Please verify your email address to get started.</p>
      <p style="margin:0 0 24px;"><a href="${esc(verifyUrl)}" style="display:inline-block;padding:14px 28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Verify Email</a></p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
    `),
    storeSettings: store?.settings,
  }).catch(err => console.error('Verification email failed:', err));

  // Emit customer.created webhook event
  emitEvent(sb, env, storeId, 'customer.created', { id: customer.id, email: customer.email, name: customer.name }).catch(() => {});

  // Generate JWT (customer can browse but email_verified=false)
  const secret = env.JWT_SECRET || env.ADMIN_API_KEY || 'webnari-jwt-secret';
  const token = await createJWT({
    sub: customer.id,
    email: customer.email,
    store: storeId,
    email_verified: false,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  }, secret);

  return json({
    token,
    customer: { id: customer.id, email: customer.email, name: customer.name, email_verified: false },
  }, 201, corsOrigin);
}

async function handleCustomerLogin(request, sb, env, storeId, corsOrigin) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password required' }, 400, corsOrigin);
  }

  const customer = await sb.query('customers', {
    filters: { store_id: `eq.${storeId}`, email: `eq.${email.toLowerCase().trim()}` },
    single: true,
    select: 'id,email,name,phone,password_hash,email_verified',
  });

  if (!customer) {
    return json({ error: 'Invalid email or password' }, 401, corsOrigin);
  }

  const valid = await verifyPassword(password, customer.password_hash);
  if (!valid) {
    return json({ error: 'Invalid email or password' }, 401, corsOrigin);
  }

  // Update last login
  sb.update('customers', { id: `eq.${customer.id}` }, { last_login_at: new Date().toISOString() }).catch(() => {});

  // Generate JWT
  const secret = env.JWT_SECRET || env.ADMIN_API_KEY || 'webnari-jwt-secret';
  const token = await createJWT({
    sub: customer.id,
    email: customer.email,
    store: storeId,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  }, secret);

  return json({
    token,
    customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone, email_verified: customer.email_verified ?? true },
  }, 200, corsOrigin);
}

async function handleForgotPassword(request, sb, env, storeId, corsOrigin) {
  const { email } = await request.json();

  // Always return ok to prevent email enumeration
  if (!email) return json({ ok: true }, 200, corsOrigin);

  const customer = await sb.query('customers', {
    filters: { store_id: `eq.${storeId}`, email: `eq.${email.toLowerCase().trim()}` },
    single: true, select: 'id,email',
  });

  if (customer) {
    const token = randomToken(32);
    const tokenHash = await sha256(token);

    await sb.insert('password_reset_tokens', {
      customer_id: customer.id,
      store_id: storeId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    });

    // Get store info for email
    const store = await sb.query('stores', {
      filters: { id: `eq.${storeId}` }, single: true, select: 'name,domain,settings',
    });
    const storeName = store?.name || 'Store';
    const domain = store?.domain || store?.settings?.domain || 'webnari.io';
    const resetUrl = `https://${domain}/reset-password?token=${token}&store=${storeId}`;

    const html = emailShell(storeName, `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Reset Your Password</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">We received a request to reset your password. Click the button below to set a new one.</p>
      <p style="margin:0 0 24px;"><a href="${esc(resetUrl)}" style="display:inline-block;padding:14px 28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Reset Password</a></p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
    `);

    sendEmail(env, {
      to: customer.email,
      subject: `${storeName} — Reset Your Password`,
      html,
      storeSettings: store?.settings,
    }).catch(err => console.error('Password reset email failed:', err));
  }

  return json({ ok: true }, 200, corsOrigin);
}

async function handleResetPassword(request, sb, env, storeId, corsOrigin) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return json({ error: 'Token and new password required' }, 400, corsOrigin);
  }
  if (newPassword.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400, corsOrigin);
  }

  const tokenHash = await sha256(token);
  const resetToken = await sb.query('password_reset_tokens', {
    filters: { token_hash: `eq.${tokenHash}`, store_id: `eq.${storeId}`, used_at: 'is.null' },
    single: true,
    select: 'id,customer_id,expires_at',
  });

  if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
    return json({ error: 'Invalid or expired reset link' }, 400, corsOrigin);
  }

  // Hash new password and update
  const passwordHash = await hashPassword(newPassword);
  await sb.update('customers', { id: `eq.${resetToken.customer_id}` }, { password_hash: passwordHash, updated_at: new Date().toISOString() });

  // Mark token as used
  await sb.update('password_reset_tokens', { id: `eq.${resetToken.id}` }, { used_at: new Date().toISOString() });

  return json({ ok: true }, 200, corsOrigin);
}

// ── Email Verification Handlers ──

async function handleVerifyEmail(request, sb, env, storeId, corsOrigin) {
  const { token } = await request.json();
  if (!token) return json({ error: 'Verification token required' }, 400, corsOrigin);

  const tokenHash = await sha256(token);
  const customer = await sb.query('customers', {
    filters: { store_id: `eq.${storeId}`, verification_token: `eq.${tokenHash}` },
    single: true,
    select: 'id,email,verification_token_expires',
  });

  if (!customer) return json({ error: 'Invalid verification link' }, 400, corsOrigin);
  if (customer.verification_token_expires && new Date(customer.verification_token_expires) < new Date()) {
    return json({ error: 'Verification link has expired. Please request a new one.' }, 400, corsOrigin);
  }

  await sb.update('customers', { id: `eq.${customer.id}` }, {
    email_verified: true,
    verification_token: null,
    verification_token_expires: null,
    updated_at: new Date().toISOString(),
  });

  return json({ ok: true, email: customer.email }, 200, corsOrigin);
}

async function handleResendVerification(request, sb, env, storeId, corsOrigin) {
  const { email } = await request.json();
  if (!email) return json({ ok: true }, 200, corsOrigin); // prevent enumeration

  const customer = await sb.query('customers', {
    filters: { store_id: `eq.${storeId}`, email: `eq.${email.toLowerCase().trim()}` },
    single: true,
    select: 'id,email,email_verified',
  });

  if (customer && !customer.email_verified) {
    const verificationRaw = randomToken(32);
    const verificationHash = await sha256(verificationRaw);

    await sb.update('customers', { id: `eq.${customer.id}` }, {
      verification_token: verificationHash,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true, select: 'name,domain,settings' });
    const storeName = store?.name || 'Store';
    const domain = store?.domain || store?.settings?.domain || 'webnari.io';
    const verifyUrl = `https://${domain}/verify-email?token=${verificationRaw}&store=${storeId}`;

    sendEmail(env, {
      to: customer.email,
      subject: `${storeName} — Verify Your Email`,
      html: emailShell(storeName, `
        <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Verify Your Email</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Click the button below to verify your email address.</p>
        <p style="margin:0 0 24px;"><a href="${esc(verifyUrl)}" style="display:inline-block;padding:14px 28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Verify Email</a></p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires in 24 hours.</p>
      `),
      storeSettings: store?.settings,
    }).catch(err => console.error('Resend verification email failed:', err));
  }

  return json({ ok: true }, 200, corsOrigin);
}


// ── Account Handlers (require JWT) ──

async function handleGetProfile(request, sb, env, storeId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const customer = await sb.query('customers', {
    filters: { id: `eq.${auth.sub}`, store_id: `eq.${storeId}` },
    single: true,
    select: 'id,email,name,phone,created_at',
  });
  if (!customer) return json({ error: 'Customer not found' }, 404, corsOrigin);

  return json({ customer }, 200, corsOrigin);
}

async function handleUpdateProfile(request, sb, env, storeId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const data = await request.json();
  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.phone !== undefined) updates.phone = data.phone;

  // Allow password change if current password provided
  if (data.newPassword && data.currentPassword) {
    const customer = await sb.query('customers', {
      filters: { id: `eq.${auth.sub}` }, single: true, select: 'password_hash',
    });
    const valid = await verifyPassword(data.currentPassword, customer.password_hash);
    if (!valid) return json({ error: 'Current password is incorrect' }, 401, corsOrigin);
    if (data.newPassword.length < 8) return json({ error: 'New password must be at least 8 characters' }, 400, corsOrigin);
    updates.password_hash = await hashPassword(data.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: 'No fields to update' }, 400, corsOrigin);
  }

  updates.updated_at = new Date().toISOString();
  await sb.update('customers', { id: `eq.${auth.sub}`, store_id: `eq.${storeId}` }, updates);

  return json({ ok: true }, 200, corsOrigin);
}

async function handleGetCustomerOrders(request, sb, env, storeId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  try {
    const orders = await sb.query('orders', {
      filters: { store_id: `eq.${storeId}`, customer_email: `eq.${auth.email}` },
      select: 'id,order_number,status,subtotal,shipping,tax,total,created_at,tracking_number,tracking_url',
      order: 'created_at.desc',
      limit: 25,
    });

    return json({ orders: orders || [] }, 200, corsOrigin);
  } catch (err) {
    console.error('Orders query error:', err.message);
    return json({ orders: [], error: err.message }, 200, corsOrigin);
  }
}

async function handleGetAddresses(request, sb, env, storeId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const addresses = await sb.query('customer_addresses', {
    filters: { customer_id: `eq.${auth.sub}`, store_id: `eq.${storeId}` },
    select: 'id,label,name,street1,street2,city,state,zip,country,is_default',
    order: 'is_default.desc,created_at.desc',
  });

  return json({ addresses: addresses || [] }, 200, corsOrigin);
}

async function handleAddAddress(request, sb, env, storeId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const data = await request.json();
  if (!data.street1 || !data.city || !data.state || !data.zip) {
    return json({ error: 'street1, city, state, and zip required' }, 400, corsOrigin);
  }

  // If setting as default, unset other defaults first
  if (data.is_default) {
    await sb.update('customer_addresses', {
      customer_id: `eq.${auth.sub}`, store_id: `eq.${storeId}`,
    }, { is_default: false });
  }

  const address = await sb.insert('customer_addresses', {
    customer_id: auth.sub,
    store_id: storeId,
    label: data.label || 'Home',
    name: data.name || null,
    street1: data.street1,
    street2: data.street2 || null,
    city: data.city,
    state: data.state,
    zip: data.zip,
    country: data.country || 'US',
    is_default: data.is_default || false,
  });

  return json({ address }, 201, corsOrigin);
}

async function handleDeleteAddress(request, sb, env, storeId, addressId, corsOrigin) {
  const auth = await authenticateCustomer(request, env);
  if (!auth || auth.store !== storeId) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('customer_addresses', {
    id: `eq.${addressId}`, customer_id: `eq.${auth.sub}`, store_id: `eq.${storeId}`,
  });

  return json({ ok: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  SEO — ROBOTS.TXT
// ═══════════════════════════════════════════════════════════════

async function handleRobotsTxt(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
    });
  }

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });

  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  const txt = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Disallow admin/API paths',
    'Disallow: /api/',
    'Disallow: /admin/',
    'Disallow: /dashboard',
    '',
    '# Sitemaps',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
    '# Crawl-delay (be polite)',
    'Crawl-delay: 1',
  ].join('\n');

  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  });
}

// ═══════════════════════════════════════════════════════════════
//  SEO — SITEMAP INDEX
// ═══════════════════════════════════════════════════════════════

async function handleSitemapIndex(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;
  const now = new Date().toISOString().split('T')[0];

  const sitemaps = [
    { loc: `${baseUrl}/sitemap-products.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-categories.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-blog.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-pages.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-images.xml`, lastmod: now },
  ];

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return xml(xmlStr, 200, 3600);
}

// ═══════════════════════════════════════════════════════════════
//  SEO — PRODUCT SITEMAP
// ═══════════════════════════════════════════════════════════════

async function handleProductSitemap(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  const products = await sb.query('products', {
    select: 'slug,updated_at,name',
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'updated_at.desc',
    limit: 50000,
  });

  // Get images for all products
  const productIds = products.map(p => p.slug || p.id);

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products.map(p => {
    const slug = p.slug || p.id;
    const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${baseUrl}/products/${encodeURIComponent(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  return xml(xmlStr, 200, 3600);
}

async function handleCategorySitemap(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  const categories = await sb.query('categories', {
    select: 'slug,name',
    filters: { store_id: `eq.${storeId}` },
    order: 'sort_order.asc',
  });

  const now = new Date().toISOString().split('T')[0];

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(c => `  <url>
    <loc>${baseUrl}/collections/${encodeURIComponent(c.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml(xmlStr, 200, 3600);
}

async function handleBlogSitemap(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  const posts = await sb.query('blog_posts', {
    select: 'slug,updated_at,title',
    filters: { store_id: `eq.${storeId}`, published: 'eq.true' },
    order: 'updated_at.desc',
    limit: 50000,
  });

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map(p => {
    const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${baseUrl}/blog/${encodeURIComponent(p.slug || p.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  return xml(xmlStr, 200, 3600);
}

async function handlePagesSitemap(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  // Homepage always included
  const urls = [`  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`];

  // Custom pages
  try {
    const pages = await sb.query('store_pages', {
      select: 'slug,updated_at',
      filters: { store_id: `eq.${storeId}`, published: 'eq.true' },
      order: 'sort_order.asc',
    });
    for (const p of pages) {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      urls.push(`  <url>
    <loc>${baseUrl}/${encodeURIComponent(p.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  } catch (e) {
    // store_pages table may not exist yet
  }

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return xml(xmlStr, 200, 3600);
}

// ═══════════════════════════════════════════════════════════════
//  SEO — IMAGE SITEMAP
// ═══════════════════════════════════════════════════════════════

async function handleImageSitemap(request, sb) {
  const storeId = await resolveStoreFromRequest(request, sb);
  if (!storeId) return xml('<error>Store not found</error>', 404);

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    select: 'domain',
    single: true,
  });
  const domain = store?.domain || request.headers.get('Host') || 'localhost';
  const baseUrl = `https://${domain}`;

  // Get all products with images
  const products = await sb.query('products', {
    select: 'id,slug,name',
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'updated_at.desc',
    limit: 5000,
  });

  // Batch-fetch all product images
  const entries = [];
  for (const p of products) {
    const images = await sb.query('product_images', {
      select: 'url,alt',
      filters: { product_id: `eq.${p.id}` },
      order: 'sort_order.asc',
      limit: 10,
    });
    if (images.length > 0) {
      const slug = p.slug || p.id;
      entries.push({ slug, name: p.name, images });
    }
  }

  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(e => `  <url>
    <loc>${baseUrl}/products/${encodeURIComponent(e.slug)}</loc>
${e.images.map(img => `    <image:image>
      <image:loc>${escXml(img.url)}</image:loc>
      <image:title>${escXml(e.name)}</image:title>
${img.alt ? `      <image:caption>${escXml(img.alt)}</image:caption>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

  return xml(xmlStr, 200, 3600);
}

// ═══════════════════════════════════════════════════════════════
//  SEO — META TAG GENERATION API
// ═══════════════════════════════════════════════════════════════

async function handleSeoMeta(request, sb, storeId, url, corsOrigin) {
  const pageType = url.searchParams.get('type') || 'home'; // home, product, category, blog, page
  const slug = url.searchParams.get('slug');

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    single: true,
  });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  const domain = store.domain || `${storeId}.webnari.io`;
  const baseUrl = `https://${domain}`;
  const storeName = store.name;
  const defaultImage = store.social_image_url || store.logo_url || '';

  let meta = {};

  if (pageType === 'home') {
    meta = {
      title: store.seo_title || `${storeName} — Official Store`,
      description: store.seo_description || `Shop ${storeName}. Free shipping on qualifying orders.`,
      canonical: baseUrl + '/',
      og: {
        type: 'website',
        title: store.seo_title || storeName,
        description: store.seo_description || `Shop ${storeName}`,
        url: baseUrl + '/',
        image: defaultImage,
        site_name: storeName,
      },
      twitter: {
        card: 'summary_large_image',
        title: store.seo_title || storeName,
        description: store.seo_description || `Shop ${storeName}`,
        image: defaultImage,
      },
    };
  } else if (pageType === 'product' && slug) {
    let product = await sb.query('products', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!product) {
      product = await sb.query('products', {
        filters: { id: `eq.${slug}`, store_id: `eq.${storeId}` },
        single: true,
      });
    }
    if (!product) return json({ error: 'Product not found' }, 404, corsOrigin);

    const images = await sb.query('product_images', {
      filters: { product_id: `eq.${product.id}` },
      order: 'sort_order.asc',
      limit: 1,
    });
    const productImage = images[0]?.url || defaultImage;
    const price = (product.price / 100).toFixed(2);

    meta = {
      title: product.meta_title || `${product.name} — ${storeName}`,
      description: product.meta_description || product.description?.slice(0, 160) || `Buy ${product.name} at ${storeName}`,
      canonical: `${baseUrl}/products/${product.slug || product.id}`,
      og: {
        type: 'og:product',
        title: product.meta_title || product.name,
        description: product.meta_description || product.description?.slice(0, 160) || '',
        url: `${baseUrl}/products/${product.slug || product.id}`,
        image: productImage,
        site_name: storeName,
        'product:price:amount': price,
        'product:price:currency': (store.currency || 'usd').toUpperCase(),
        'product:availability': product.in_stock ? 'instock' : 'out of stock',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.meta_title || product.name,
        description: product.meta_description || product.description?.slice(0, 160) || '',
        image: productImage,
      },
    };
  } else if (pageType === 'category' && slug) {
    const category = await sb.query('categories', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!category) return json({ error: 'Category not found' }, 404, corsOrigin);

    meta = {
      title: category.meta_title || `${category.name} — ${storeName}`,
      description: category.meta_description || `Browse ${category.name} at ${storeName}`,
      canonical: `${baseUrl}/collections/${category.slug}`,
      og: {
        type: 'website',
        title: category.meta_title || category.name,
        description: category.meta_description || `Browse ${category.name}`,
        url: `${baseUrl}/collections/${category.slug}`,
        image: category.image_url || defaultImage,
        site_name: storeName,
      },
      twitter: {
        card: 'summary_large_image',
        title: category.meta_title || category.name,
        description: category.meta_description || `Browse ${category.name}`,
        image: category.image_url || defaultImage,
      },
    };
  } else if (pageType === 'blog' && slug) {
    const post = await sb.query('blog_posts', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}`, published: 'eq.true' },
      single: true,
    });
    if (!post) return json({ error: 'Post not found' }, 404, corsOrigin);

    meta = {
      title: post.meta_title || `${post.title} — ${storeName} Blog`,
      description: post.meta_description || post.excerpt?.slice(0, 160) || '',
      canonical: `${baseUrl}/blog/${post.slug || post.id}`,
      og: {
        type: 'article',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt?.slice(0, 160) || '',
        url: `${baseUrl}/blog/${post.slug || post.id}`,
        image: post.image_url || defaultImage,
        site_name: storeName,
        'article:published_time': post.created_at,
        'article:modified_time': post.updated_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt?.slice(0, 160) || '',
        image: post.image_url || defaultImage,
      },
    };
  } else if (pageType === 'page' && slug) {
    try {
      const page = await sb.query('store_pages', {
        filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}`, published: 'eq.true' },
        single: true,
      });
      if (!page) return json({ error: 'Page not found' }, 404, corsOrigin);

      meta = {
        title: page.meta_title || `${page.title} — ${storeName}`,
        description: page.meta_description || '',
        canonical: `${baseUrl}/${page.slug}`,
        og: {
          type: 'website',
          title: page.meta_title || page.title,
          description: page.meta_description || '',
          url: `${baseUrl}/${page.slug}`,
          image: page.image_url || defaultImage,
          site_name: storeName,
        },
        twitter: {
          card: 'summary_large_image',
          title: page.meta_title || page.title,
          description: page.meta_description || '',
          image: page.image_url || defaultImage,
        },
      };
    } catch (e) {
      return json({ error: 'Pages not available' }, 404, corsOrigin);
    }
  }

  return json(meta, 200, corsOrigin);
}

// ═══════════════════════════════════════════════════════════════
//  SEO — JSON-LD STRUCTURED DATA
// ═══════════════════════════════════════════════════════════════

async function handleStructuredData(request, sb, storeId, url, corsOrigin) {
  const pageType = url.searchParams.get('type') || 'home';
  const slug = url.searchParams.get('slug');

  const store = await sb.query('stores', {
    filters: { id: `eq.${storeId}` },
    single: true,
  });
  if (!store) return json({ error: 'Store not found' }, 404, corsOrigin);

  const domain = store.domain || `${storeId}.webnari.io`;
  const baseUrl = `https://${domain}`;
  const storeName = store.name;

  const schemas = [];

  // Always include Organization/Store schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': store.business_type || 'Store',
    name: storeName,
    url: baseUrl,
  };
  if (store.logo_url) orgSchema.logo = store.logo_url;
  if (store.business_phone) orgSchema.telephone = store.business_phone;
  if (store.social_image_url) orgSchema.image = store.social_image_url;
  if (store.business_address) {
    const addr = store.business_address;
    orgSchema.address = {
      '@type': 'PostalAddress',
      streetAddress: addr.street || '',
      addressLocality: addr.city || '',
      addressRegion: addr.state || '',
      postalCode: addr.zip || '',
      addressCountry: addr.country || 'US',
    };
  }
  if (store.social_links) {
    const links = store.social_links;
    orgSchema.sameAs = [links.instagram, links.facebook, links.twitter, links.tiktok, links.youtube].filter(Boolean);
  }
  if (store.business_hours && Array.isArray(store.business_hours)) {
    orgSchema.openingHoursSpecification = store.business_hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      opens: h.open,
      closes: h.close,
    }));
  }
  schemas.push(orgSchema);

  // Website SearchAction schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  if (pageType === 'home') {
    // BreadcrumbList for home
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      }],
    });
  }

  if (pageType === 'product' && slug) {
    let product = await sb.query('products', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (!product) {
      product = await sb.query('products', {
        filters: { id: `eq.${slug}`, store_id: `eq.${storeId}` },
        single: true,
      });
    }
    if (product) {
      const images = await sb.query('product_images', {
        filters: { product_id: `eq.${product.id}` },
        order: 'sort_order.asc',
      });
      const reviews = await sb.query('reviews', {
        filters: { product_id: `eq.${product.id}`, approved: 'eq.true' },
      });

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || '',
        url: `${baseUrl}/products/${product.slug || product.id}`,
        image: images.map(i => i.url),
        sku: product.sku || product.id,
        brand: { '@type': 'Brand', name: storeName },
        offers: {
          '@type': 'Offer',
          price: (product.price / 100).toFixed(2),
          priceCurrency: (store.currency || 'usd').toUpperCase(),
          availability: product.in_stock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `${baseUrl}/products/${product.slug || product.id}`,
          seller: { '@type': 'Organization', name: storeName },
        },
      };

      if (product.compare_at_price) {
        productSchema.offers.priceValidUntil = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
      }

      // Aggregate rating
      if (reviews.length > 0) {
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        productSchema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: avg.toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        };
        productSchema.review = reviews.slice(0, 5).map(r => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.name },
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          reviewBody: r.text,
          datePublished: r.created_at?.split('T')[0] || '',
        }));
      }

      schemas.push(productSchema);

      // Breadcrumb for product
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        ],
      };
      if (product.category) {
        breadcrumb.itemListElement.push({
          '@type': 'ListItem', position: 2, name: product.category,
          item: `${baseUrl}/collections/${encodeURIComponent(product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
        });
        breadcrumb.itemListElement.push({
          '@type': 'ListItem', position: 3, name: product.name,
        });
      } else {
        breadcrumb.itemListElement.push({
          '@type': 'ListItem', position: 2, name: product.name,
        });
      }
      schemas.push(breadcrumb);
    }
  }

  if (pageType === 'category' && slug) {
    const category = await sb.query('categories', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}` },
      single: true,
    });
    if (category) {
      const products = await sb.query('products', {
        select: 'name,slug,price',
        filters: { store_id: `eq.${storeId}`, category: `eq.${category.slug}`, in_stock: 'eq.true' },
        order: 'sort_order.asc',
        limit: 50,
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description || category.meta_description || `Browse ${category.name}`,
        url: `${baseUrl}/collections/${category.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${baseUrl}/products/${p.slug || p.id}`,
            name: p.name,
          })),
        },
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: category.name },
        ],
      });
    }
  }

  if (pageType === 'blog' && slug) {
    const post = await sb.query('blog_posts', {
      filters: { slug: `eq.${slug}`, store_id: `eq.${storeId}`, published: 'eq.true' },
      single: true,
    });
    if (post) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || '',
        datePublished: post.created_at,
        dateModified: post.updated_at,
        author: { '@type': 'Organization', name: storeName },
        publisher: {
          '@type': 'Organization',
          name: storeName,
          logo: store.logo_url ? { '@type': 'ImageObject', url: store.logo_url } : undefined,
        },
        image: post.image_url || store.social_image_url || '',
        url: `${baseUrl}/blog/${post.slug || post.id}`,
        mainEntityOfPage: `${baseUrl}/blog/${post.slug || post.id}`,
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      });
    }
  }

  if (pageType === 'faq') {
    try {
      const faqs = await sb.query('store_faqs', {
        filters: { store_id: `eq.${storeId}`, published: 'eq.true' },
        order: 'sort_order.asc',
      });
      if (faqs.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        });
      }
    } catch (e) {
      // store_faqs table may not exist yet
    }
  }

  // Cache meta + structured data for 5 minutes
  return new Response(JSON.stringify(schemas), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      ...corsHeaders(corsOrigin),
    },
  });
}

// ═══════════════════════════════════════════════════════════════
//  SEO — ADMIN HEALTH AUDIT
// ═══════════════════════════════════════════════════════════════

async function handleSeoHealthAudit(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const [store, products, categories, blogPosts] = await Promise.all([
    sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true }),
    sb.query('products', { filters: { store_id: `eq.${storeId}` } }),
    sb.query('categories', { filters: { store_id: `eq.${storeId}` } }),
    sb.query('blog_posts', { filters: { store_id: `eq.${storeId}` } }),
  ]);

  const issues = [];
  const warnings = [];
  let score = 100;

  // Store-level checks
  if (!store.seo_title) { issues.push('Missing store SEO title (homepage)'); score -= 5; }
  if (!store.seo_description) { issues.push('Missing store SEO description (homepage)'); score -= 5; }
  if (!store.logo_url) { warnings.push('No logo URL set — affects structured data'); score -= 3; }
  if (!store.social_image_url) { warnings.push('No social/OG image — link previews will be blank'); score -= 3; }
  if (!store.business_phone) { warnings.push('No business phone — reduces local SEO trust'); score -= 2; }
  if (!store.business_address) { warnings.push('No business address — hurts local search visibility'); score -= 2; }
  if (!store.social_links || Object.keys(store.social_links || {}).length === 0) {
    warnings.push('No social links — missed schema.org sameAs signals');
    score -= 2;
  }

  // Product-level checks
  let productsWithoutMeta = 0;
  let productsWithoutSlug = 0;
  let productsWithoutDesc = 0;
  let productsWithoutImages = 0;

  for (const p of products) {
    if (!p.meta_title && !p.meta_description) productsWithoutMeta++;
    if (!p.slug) productsWithoutSlug++;
    if (!p.description) productsWithoutDesc++;
  }

  // Check for products without images (batch check)
  const productImagesCount = {};
  for (const p of products) {
    const imgs = await sb.query('product_images', {
      select: 'id',
      filters: { product_id: `eq.${p.id}` },
      limit: 1,
    });
    if (imgs.length === 0) productsWithoutImages++;
  }

  if (productsWithoutMeta > 0) {
    issues.push(`${productsWithoutMeta}/${products.length} products missing meta title/description`);
    score -= Math.min(15, productsWithoutMeta * 2);
  }
  if (productsWithoutSlug > 0) {
    issues.push(`${productsWithoutSlug}/${products.length} products missing URL slug`);
    score -= Math.min(10, productsWithoutSlug * 2);
  }
  if (productsWithoutDesc > 0) {
    warnings.push(`${productsWithoutDesc}/${products.length} products missing description`);
    score -= Math.min(10, productsWithoutDesc);
  }
  if (productsWithoutImages > 0) {
    warnings.push(`${productsWithoutImages}/${products.length} products have no images`);
    score -= Math.min(10, productsWithoutImages);
  }

  // Category checks
  const catsWithoutMeta = categories.filter(c => !c.meta_title && !c.meta_description).length;
  if (catsWithoutMeta > 0) {
    warnings.push(`${catsWithoutMeta}/${categories.length} categories missing meta title/description`);
    score -= Math.min(5, catsWithoutMeta);
  }

  // Blog checks
  const postsWithoutMeta = blogPosts.filter(p => !p.meta_title && !p.meta_description).length;
  if (postsWithoutMeta > 0) {
    warnings.push(`${postsWithoutMeta}/${blogPosts.length} blog posts missing meta title/description`);
    score -= Math.min(5, postsWithoutMeta);
  }

  score = Math.max(0, score);

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  return json({
    score,
    grade,
    issues,
    warnings,
    summary: {
      totalProducts: products.length,
      productsWithMeta: products.length - productsWithoutMeta,
      productsWithSlug: products.length - productsWithoutSlug,
      productsWithImages: products.length - productsWithoutImages,
      totalCategories: categories.length,
      categoriesWithMeta: categories.length - catsWithoutMeta,
      totalBlogPosts: blogPosts.length,
      blogPostsWithMeta: blogPosts.length - postsWithoutMeta,
      hasStoreTitle: !!store.seo_title,
      hasStoreDescription: !!store.seo_description,
      hasLogo: !!store.logo_url,
      hasSocialImage: !!store.social_image_url,
      hasBusinessInfo: !!(store.business_phone && store.business_address),
    },
    sitemaps: {
      index: '/sitemap.xml',
      products: '/sitemap-products.xml',
      categories: '/sitemap-categories.xml',
      blog: '/sitemap-blog.xml',
      pages: '/sitemap-pages.xml',
      images: '/sitemap-images.xml',
    },
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  WEBHOOK ENGINE — Core event emission & delivery
// ═══════════════════════════════════════════════════════════════

async function emitEvent(sb, env, storeId, eventType, data) {
  try {
    // Query all active webhook endpoints for this store
    const endpoints = await sb.query('webhook_endpoints', {
      filters: { store_id: `eq.${storeId}`, is_active: 'eq.true' },
    });

    // Filter endpoints that subscribe to this event or wildcard
    const matching = endpoints.filter(ep =>
      ep.events.includes('*') || ep.events.includes(eventType)
    );

    if (matching.length === 0) return;

    // Build event payload envelope
    const eventPayload = {
      id: 'evt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      type: eventType,
      store_id: storeId,
      created_at: new Date().toISOString(),
      data,
    };

    // Deliver to all matching endpoints concurrently
    await Promise.allSettled(
      matching.map(ep => deliverWebhook(sb, ep, eventPayload))
    );
  } catch (err) {
    console.error('emitEvent error:', err);
  }
}

async function deliverWebhook(sb, endpoint, eventPayload) {
  const body = JSON.stringify(eventPayload);
  const timestamp = Math.floor(Date.now() / 1000);
  const startTime = Date.now();
  let responseStatus = null;
  let responseBody = null;
  let error = null;

  try {
    // Sign the payload with HMAC-SHA256
    const signature = await signWebhookPayload(endpoint.secret, timestamp, body);

    // Deliver with 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webnari-Webhooks/1.0',
        'X-Webnari-Event': eventPayload.type,
        'X-Webnari-Delivery': eventPayload.id,
        'X-Webnari-Signature': `t=${timestamp},v1=${signature}`,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    responseStatus = res.status;
    responseBody = (await res.text()).slice(0, 4096);

    // Log successful delivery
    await sb.insert('webhook_deliveries', {
      webhook_id: endpoint.id,
      store_id: endpoint.store_id,
      event_type: eventPayload.type,
      payload: eventPayload,
      response_status: responseStatus,
      response_body: responseBody,
      response_ms: Date.now() - startTime,
      attempt: 1,
      status: responseStatus >= 200 && responseStatus < 300 ? 'success' : 'retrying',
      next_retry_at: responseStatus >= 200 && responseStatus < 300 ? null : new Date(Date.now() + 60000).toISOString(),
      error: responseStatus >= 200 && responseStatus < 300 ? null : `HTTP ${responseStatus}`,
    });

  } catch (err) {
    error = err.name === 'AbortError' ? 'Timeout (10s)' : err.message;

    // Log failed delivery — schedule retry
    await sb.insert('webhook_deliveries', {
      webhook_id: endpoint.id,
      store_id: endpoint.store_id,
      event_type: eventPayload.type,
      payload: eventPayload,
      response_status: null,
      response_body: null,
      response_ms: Date.now() - startTime,
      attempt: 1,
      status: 'retrying',
      next_retry_at: new Date(Date.now() + 60000).toISOString(),
      error,
    });
  }
}

async function signWebhookPayload(secret, timestamp, body) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`));
  return Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateWebhookSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'whsec_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}


// ═══════════════════════════════════════════════════════════════
//  WEBHOOK RETRY CRON (every 5 minutes)
// ═══════════════════════════════════════════════════════════════

async function handleWebhookRetryCron(env) {
  const sb = createSupabaseClient(env);

  try {
    // Find deliveries due for retry
    const pending = await sb.query('webhook_deliveries', {
      filters: { status: 'eq.retrying', next_retry_at: `lte.${new Date().toISOString()}` },
      order: 'next_retry_at.asc',
      limit: 50,
    });

    if (pending.length === 0) return;

    for (const delivery of pending) {
      // Get the endpoint
      const endpoint = await sb.query('webhook_endpoints', {
        filters: { id: `eq.${delivery.webhook_id}`, is_active: 'eq.true' },
        single: true,
      });

      // If endpoint was deleted or deactivated, mark as failed
      if (!endpoint) {
        await sb.update('webhook_deliveries', { id: `eq.${delivery.id}` }, {
          status: 'failed',
          error: 'Endpoint deleted or deactivated',
          next_retry_at: null,
        });
        continue;
      }

      const newAttempt = delivery.attempt + 1;
      const body = JSON.stringify(delivery.payload);
      const timestamp = Math.floor(Date.now() / 1000);
      const startTime = Date.now();

      try {
        const signature = await signWebhookPayload(endpoint.secret, timestamp, body);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Webnari-Webhooks/1.0',
            'X-Webnari-Event': delivery.event_type,
            'X-Webnari-Delivery': delivery.payload?.id || delivery.id,
            'X-Webnari-Signature': `t=${timestamp},v1=${signature}`,
            'X-Webnari-Retry': String(newAttempt),
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseStatus = res.status;
        const responseBody = (await res.text()).slice(0, 4096);
        const isSuccess = responseStatus >= 200 && responseStatus < 300;

        // Calculate next retry with exponential backoff: 1m, 5m, 30m
        const backoffMs = newAttempt === 2 ? 300000 : 1800000;

        await sb.update('webhook_deliveries', { id: `eq.${delivery.id}` }, {
          response_status: responseStatus,
          response_body: responseBody,
          response_ms: Date.now() - startTime,
          attempt: newAttempt,
          status: isSuccess ? 'success' : (newAttempt >= 3 ? 'failed' : 'retrying'),
          next_retry_at: isSuccess || newAttempt >= 3 ? null : new Date(Date.now() + backoffMs).toISOString(),
          error: isSuccess ? null : `HTTP ${responseStatus}`,
        });
      } catch (err) {
        const backoffMs = newAttempt === 2 ? 300000 : 1800000;

        await sb.update('webhook_deliveries', { id: `eq.${delivery.id}` }, {
          response_ms: Date.now() - startTime,
          attempt: newAttempt,
          status: newAttempt >= 3 ? 'failed' : 'retrying',
          next_retry_at: newAttempt >= 3 ? null : new Date(Date.now() + backoffMs).toISOString(),
          error: err.name === 'AbortError' ? 'Timeout (10s)' : err.message,
        });
      }
    }
  } catch (err) {
    console.error('Webhook retry cron error:', err);
  }
}


// ═══════════════════════════════════════════════════════════════
//  WEBHOOK ADMIN CRUD
// ═══════════════════════════════════════════════════════════════

async function handleAdminListWebhooks(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const endpoints = await sb.query('webhook_endpoints', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  // Get recent delivery stats for each endpoint
  const result = [];
  for (const ep of endpoints) {
    const deliveries = await sb.query('webhook_deliveries', {
      select: 'status',
      filters: { webhook_id: `eq.${ep.id}` },
      order: 'created_at.desc',
      limit: 20,
    });

    const stats = { total: deliveries.length, success: 0, failed: 0, retrying: 0 };
    for (const d of deliveries) {
      if (d.status === 'success') stats.success++;
      else if (d.status === 'failed') stats.failed++;
      else if (d.status === 'retrying') stats.retrying++;
    }

    result.push({
      ...ep,
      secret: ep.secret.slice(0, 10) + '...',  // mask secret
      recentDeliveryStats: stats,
    });
  }

  return json(result, 200, corsOrigin);
}

async function handleAdminCreateWebhook(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.url) return json({ error: 'Webhook URL required' }, 400, corsOrigin);
  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return json({ error: 'At least one event is required' }, 400, corsOrigin);
  }

  // Validate URL
  try { new URL(body.url); } catch { return json({ error: 'Invalid URL' }, 400, corsOrigin); }

  // Must be HTTPS
  if (!body.url.startsWith('https://')) {
    return json({ error: 'Webhook URL must use HTTPS' }, 400, corsOrigin);
  }

  const secret = generateWebhookSecret();

  const endpoint = await sb.insert('webhook_endpoints', {
    store_id: storeId,
    url: body.url,
    secret,
    events: body.events,
    description: body.description || null,
    is_active: true,
  });

  return json({
    ...endpoint,
    secret,  // show full secret only on creation
  }, 201, corsOrigin);
}

async function handleAdminGetWebhook(request, sb, env, storeId, webhookId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const endpoint = await sb.query('webhook_endpoints', {
    filters: { id: `eq.${webhookId}`, store_id: `eq.${storeId}` },
    single: true,
  });

  if (!endpoint) return json({ error: 'Webhook not found' }, 404, corsOrigin);

  return json({
    ...endpoint,
    secret: endpoint.secret.slice(0, 10) + '...',
  }, 200, corsOrigin);
}

async function handleAdminUpdateWebhook(request, sb, env, storeId, webhookId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['url', 'events', 'description', 'is_active'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (updates.url) {
    try { new URL(updates.url); } catch { return json({ error: 'Invalid URL' }, 400, corsOrigin); }
    if (!updates.url.startsWith('https://')) return json({ error: 'Must use HTTPS' }, 400, corsOrigin);
  }

  if (Object.keys(updates).length === 0) return json({ error: 'No valid fields' }, 400, corsOrigin);

  await sb.update('webhook_endpoints', { id: `eq.${webhookId}`, store_id: `eq.${storeId}` }, updates);

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteWebhook(request, sb, env, storeId, webhookId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('webhook_endpoints', { id: `eq.${webhookId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}

async function handleAdminWebhookDeliveries(request, sb, env, storeId, webhookId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const deliveries = await sb.query('webhook_deliveries', {
    filters: { webhook_id: `eq.${webhookId}`, store_id: `eq.${storeId}` },
    order: 'created_at.desc',
    limit: Math.min(limit, 100),
  });

  return json(deliveries, 200, corsOrigin);
}

async function handleAdminTestWebhook(request, sb, env, storeId, webhookId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const endpoint = await sb.query('webhook_endpoints', {
    filters: { id: `eq.${webhookId}`, store_id: `eq.${storeId}` },
    single: true,
  });

  if (!endpoint) return json({ error: 'Webhook not found' }, 404, corsOrigin);

  const testPayload = {
    id: 'evt_test_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    type: 'webhook.test',
    store_id: storeId,
    created_at: new Date().toISOString(),
    data: {
      message: 'This is a test webhook delivery from Webnari',
      timestamp: new Date().toISOString(),
    },
  };

  // Deliver synchronously so we can return the result
  const body = JSON.stringify(testPayload);
  const timestamp = Math.floor(Date.now() / 1000);
  const startTime = Date.now();

  try {
    const signature = await signWebhookPayload(endpoint.secret, timestamp, body);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webnari-Webhooks/1.0',
        'X-Webnari-Event': 'webhook.test',
        'X-Webnari-Delivery': testPayload.id,
        'X-Webnari-Signature': `t=${timestamp},v1=${signature}`,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseStatus = res.status;
    const responseBody = (await res.text()).slice(0, 4096);
    const latency = Date.now() - startTime;

    // Log the test delivery
    await sb.insert('webhook_deliveries', {
      webhook_id: endpoint.id,
      store_id: storeId,
      event_type: 'webhook.test',
      payload: testPayload,
      response_status: responseStatus,
      response_body: responseBody,
      response_ms: latency,
      attempt: 1,
      status: responseStatus >= 200 && responseStatus < 300 ? 'success' : 'failed',
    });

    return json({
      success: responseStatus >= 200 && responseStatus < 300,
      status: responseStatus,
      latency_ms: latency,
      response_preview: responseBody.slice(0, 200),
    }, 200, corsOrigin);
  } catch (err) {
    return json({
      success: false,
      error: err.name === 'AbortError' ? 'Timeout (10s)' : err.message,
      latency_ms: Date.now() - startTime,
    }, 200, corsOrigin);
  }
}

async function handleAdminListWebhookEvents(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  return json({
    events: [
      { type: 'order.created', description: 'Fired when a new order is placed' },
      { type: 'order.updated', description: 'Fired when order details change' },
      { type: 'order.shipped', description: 'Fired when order is marked as shipped' },
      { type: 'order.delivered', description: 'Fired when order is marked as delivered' },
      { type: 'order.cancelled', description: 'Fired when order is cancelled' },
      { type: 'order.refunded', description: 'Fired when order is refunded' },
      { type: 'product.created', description: 'Fired when a new product is added' },
      { type: 'product.updated', description: 'Fired when a product is modified' },
      { type: 'product.deleted', description: 'Fired when a product is removed' },
      { type: 'inventory.updated', description: 'Fired when stock levels change' },
      { type: 'inventory.low_stock', description: 'Fired when stock drops below threshold' },
      { type: 'customer.created', description: 'Fired when a new customer registers' },
      { type: 'customer.updated', description: 'Fired when customer profile changes' },
      { type: 'review.submitted', description: 'Fired when a review is submitted' },
      { type: 'review.approved', description: 'Fired when a review is approved' },
      { type: 'blog.published', description: 'Fired when a blog post is published' },
      { type: 'cart.abandoned', description: 'Fired when a cart is detected as abandoned' },
      { type: 'webhook.test', description: 'Test event for verifying webhook delivery' },
    ],
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  APP ECOSYSTEM — Admin Management
// ═══════════════════════════════════════════════════════════════

async function handleAdminListApps(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Get all published apps
  const apps = await sb.query('apps', {
    filters: { is_published: 'eq.true' },
    order: 'name.asc',
  });

  // Get this store's installations
  const installations = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}` },
  });

  const installMap = {};
  for (const inst of installations) {
    installMap[inst.app_id] = inst;
  }

  // Also check legacy store_integrations for Square/QB/Stripe
  let legacyIntegrations = [];
  try {
    legacyIntegrations = await sb.query('store_integrations', {
      filters: { store_id: `eq.${storeId}` },
    });
  } catch (e) {
    // store_integrations table may not exist
  }

  const legacyMap = {};
  for (const li of legacyIntegrations) {
    legacyMap[li.provider] = li;
  }

  return json(apps.map(app => ({
    ...app,
    installed: !!installMap[app.id] || !!legacyMap[app.id],
    installation: installMap[app.id] ? {
      id: installMap[app.id].id,
      status: installMap[app.id].status,
      installed_at: installMap[app.id].installed_at,
      config: installMap[app.id].config,
    } : legacyMap[app.id] ? {
      id: legacyMap[app.id].id,
      status: 'active',
      installed_at: legacyMap[app.id].created_at,
      legacy: true,
    } : null,
  })), 200, corsOrigin);
}

async function handleAdminInstallApp(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.app_id) return json({ error: 'app_id required' }, 400, corsOrigin);

  // Check app exists
  const app = await sb.query('apps', {
    filters: { id: `eq.${body.app_id}`, is_published: 'eq.true' },
    single: true,
  });
  if (!app) return json({ error: 'App not found' }, 404, corsOrigin);

  // Check not already installed
  const existing = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: `eq.${body.app_id}` },
    single: true,
  });
  if (existing && existing.status === 'active') {
    return json({ error: 'App already installed' }, 400, corsOrigin);
  }

  if (existing) {
    // Re-activate
    await sb.update('app_installations', { id: `eq.${existing.id}` }, {
      status: 'active',
      config: body.config || existing.config,
    });
    return json({ ...existing, status: 'active' }, 200, corsOrigin);
  }

  const installation = await sb.insert('app_installations', {
    store_id: storeId,
    app_id: body.app_id,
    status: 'active',
    scopes: app.required_scopes || [],
    config: body.config || {},
  });

  // Emit app.installed event
  emitEvent(sb, env, storeId, 'app.installed', { app_id: body.app_id, app_name: app.name }).catch(() => {});

  return json(installation, 201, corsOrigin);
}

async function handleAdminUninstallApp(request, sb, env, storeId, appId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.update('app_installations', {
    store_id: `eq.${storeId}`, app_id: `eq.${appId}`,
  }, { status: 'uninstalled' });

  // Emit app.uninstalled event
  emitEvent(sb, env, storeId, 'app.uninstalled', { app_id: appId }).catch(() => {});

  return json({ uninstalled: true }, 200, corsOrigin);
}

async function handleAdminUpdateAppConfig(request, sb, env, storeId, appId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.config) return json({ error: 'config object required' }, 400, corsOrigin);

  const installation = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: `eq.${appId}`, status: 'eq.active' },
    single: true,
  });
  if (!installation) return json({ error: 'App not installed' }, 404, corsOrigin);

  // Merge config (don't replace, merge)
  const merged = { ...installation.config, ...body.config };

  await sb.update('app_installations', { id: `eq.${installation.id}` }, { config: merged });

  return json({ config: merged }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  GA4 INTEGRATION — Server-side e-commerce tracking
// ═══════════════════════════════════════════════════════════════

async function handleGA4Configure(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.measurement_id || !body.api_secret) {
    return json({ error: 'measurement_id and api_secret required' }, 400, corsOrigin);
  }

  // Validate measurement_id format
  if (!/^G-[A-Z0-9]+$/.test(body.measurement_id)) {
    return json({ error: 'Invalid measurement_id format (expected G-XXXXXXXX)' }, 400, corsOrigin);
  }

  // Install or update the GA4 app
  const existing = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: 'eq.ga4' },
    single: true,
  });

  const config = {
    measurement_id: body.measurement_id,
    api_secret: body.api_secret,
  };

  if (existing) {
    await sb.update('app_installations', { id: `eq.${existing.id}` }, {
      status: 'active',
      config,
    });
  } else {
    await sb.insert('app_installations', {
      store_id: storeId,
      app_id: 'ga4',
      status: 'active',
      scopes: ['orders:read'],
      config,
    });
  }

  return json({ connected: true, measurement_id: body.measurement_id }, 200, corsOrigin);
}

async function handleGA4Disconnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.update('app_installations', {
    store_id: `eq.${storeId}`, app_id: 'eq.ga4',
  }, { status: 'uninstalled', config: {} });

  return json({ disconnected: true }, 200, corsOrigin);
}

async function handleGA4Test(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const installation = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: 'eq.ga4', status: 'eq.active' },
    single: true,
  });

  if (!installation) return json({ error: 'GA4 not configured' }, 400, corsOrigin);

  const { measurement_id, api_secret } = installation.config;

  // Send a test event to GA4
  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'webnari_test_' + storeId,
        events: [{
          name: 'test_event',
          params: { source: 'webnari', store_id: storeId },
        }],
      }),
    }
  );

  return json({
    success: res.status === 204 || res.status === 200,
    status: res.status,
    message: res.status === 204 ? 'Test event sent to GA4 successfully' : `GA4 responded with ${res.status}`,
  }, 200, corsOrigin);
}

// Fire GA4 purchase event (called from emitEvent pipeline)
async function sendGA4PurchaseEvent(sb, storeId, order) {
  try {
    const installation = await sb.query('app_installations', {
      filters: { store_id: `eq.${storeId}`, app_id: 'eq.ga4', status: 'eq.active' },
      single: true,
    });

    if (!installation) return;

    const { measurement_id, api_secret } = installation.config;
    if (!measurement_id || !api_secret) return;

    // Get order items
    const items = await sb.query('order_items', {
      filters: { order_id: `eq.${order.id}` },
    });

    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: order.customer_email || 'anonymous',
          events: [{
            name: 'purchase',
            params: {
              transaction_id: order.order_number || order.id,
              value: (order.total || 0) / 100,
              currency: 'USD',
              shipping: (order.shipping || 0) / 100,
              tax: (order.tax || 0) / 100,
              items: items.map(i => ({
                item_id: i.product_id,
                item_name: i.product_name,
                quantity: i.quantity,
                price: (i.price || 0) / 100,
              })),
            },
          }],
        }),
      }
    );
  } catch (err) {
    console.error('GA4 purchase event error:', err);
  }
}


// ═══════════════════════════════════════════════════════════════
//  TWILIO SMS INTEGRATION
// ═══════════════════════════════════════════════════════════════

async function handleTwilioConfigure(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.account_sid || !body.auth_token || !body.from_number || !body.owner_phone) {
    return json({ error: 'account_sid, auth_token, from_number, and owner_phone required' }, 400, corsOrigin);
  }

  const config = {
    account_sid: body.account_sid,
    auth_token: body.auth_token,
    from_number: body.from_number,
    owner_phone: body.owner_phone,
    notify_events: body.notify_events || ['order.created', 'inventory.low_stock'],
  };

  const existing = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: 'eq.twilio-sms' },
    single: true,
  });

  if (existing) {
    await sb.update('app_installations', { id: `eq.${existing.id}` }, {
      status: 'active',
      config,
    });
  } else {
    await sb.insert('app_installations', {
      store_id: storeId,
      app_id: 'twilio-sms',
      status: 'active',
      scopes: ['orders:read', 'inventory:read', 'reviews:read'],
      config,
    });
  }

  return json({ connected: true }, 200, corsOrigin);
}

async function handleTwilioDisconnect(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.update('app_installations', {
    store_id: `eq.${storeId}`, app_id: 'eq.twilio-sms',
  }, { status: 'uninstalled', config: {} });

  return json({ disconnected: true }, 200, corsOrigin);
}

async function handleTwilioTest(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const installation = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: 'eq.twilio-sms', status: 'eq.active' },
    single: true,
  });
  if (!installation) return json({ error: 'Twilio not configured' }, 400, corsOrigin);

  const { account_sid, auth_token, from_number, owner_phone } = installation.config;

  const result = await sendTwilioSMS(account_sid, auth_token, from_number, owner_phone,
    `[Webnari] Test notification from your store. SMS alerts are working!`
  );

  return json(result, 200, corsOrigin);
}

async function handleTwilioUpdateSettings(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env, storeId)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const installation = await sb.query('app_installations', {
    filters: { store_id: `eq.${storeId}`, app_id: 'eq.twilio-sms', status: 'eq.active' },
    single: true,
  });
  if (!installation) return json({ error: 'Twilio not configured' }, 400, corsOrigin);

  const config = { ...installation.config };
  if (body.notify_events) config.notify_events = body.notify_events;
  if (body.owner_phone) config.owner_phone = body.owner_phone;

  await sb.update('app_installations', { id: `eq.${installation.id}` }, { config });

  return json({ config }, 200, corsOrigin);
}

async function sendTwilioSMS(accountSid, authToken, from, to, body) {
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
      }
    );

    const data = await res.json();

    if (res.ok) {
      return { success: true, sid: data.sid, status: data.status };
    } else {
      return { success: false, error: data.message || `Twilio error ${res.status}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Send SMS notification for an event (called from integration dispatch)
async function sendTwilioEventNotification(sb, storeId, eventType, data) {
  try {
    const installation = await sb.query('app_installations', {
      filters: { store_id: `eq.${storeId}`, app_id: 'eq.twilio-sms', status: 'eq.active' },
      single: true,
    });

    if (!installation) return;

    const config = installation.config;
    if (!config.notify_events?.includes(eventType)) return;

    let message = '';
    if (eventType === 'order.created') {
      const total = ((data.total || 0) / 100).toFixed(2);
      message = `New order! #${data.order_number || 'N/A'} — $${total} from ${data.customer_email || 'unknown'}`;
    } else if (eventType === 'inventory.low_stock') {
      message = `Low stock alert: ${data.name || 'Unknown product'} — ${data.stock_quantity || 0} left`;
    } else if (eventType === 'review.submitted') {
      message = `New ${data.rating}-star review from ${data.name || 'anonymous'}`;
    } else {
      message = `Store event: ${eventType}`;
    }

    await sendTwilioSMS(config.account_sid, config.auth_token, config.from_number, config.owner_phone, `[Webnari] ${message}`);
  } catch (err) {
    console.error('Twilio notification error:', err);
  }
}


// ═══════════════════════════════════════════════════════════════
//  INTEGRATION DISPATCH — Route events to first-party integrations
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  DISCOUNT VALIDATION (Public)
// ═══════════════════════════════════════════════════════════════

async function handleValidateDiscount(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { code, subtotal } = body;
  if (!code) return json({ error: 'Discount code required' }, 400, corsOrigin);

  const discount = await sb.query('discounts', {
    filters: { store_id: `eq.${storeId}`, code: `eq.${code.toUpperCase().trim()}`, is_active: 'eq.true' },
    single: true,
  });

  if (!discount) return json({ error: 'Invalid discount code' }, 400, corsOrigin);

  // Check expiry
  const now = new Date();
  if (discount.starts_at && new Date(discount.starts_at) > now) {
    return json({ error: 'This discount is not yet active' }, 400, corsOrigin);
  }
  if (discount.expires_at && new Date(discount.expires_at) < now) {
    return json({ error: 'This discount has expired' }, 400, corsOrigin);
  }

  // Check max uses
  if (discount.max_uses && discount.used_count >= discount.max_uses) {
    return json({ error: 'This discount has reached its usage limit' }, 400, corsOrigin);
  }

  // Check minimum order
  if (discount.min_order && subtotal < discount.min_order) {
    const minDisplay = (discount.min_order / 100).toFixed(2);
    return json({ error: `Minimum order of $${minDisplay} required for this discount` }, 400, corsOrigin);
  }

  // Calculate discount amount
  let discountAmount = 0;
  let label = '';

  if (discount.type === 'percentage') {
    discountAmount = Math.round((subtotal || 0) * parseFloat(discount.value) / 100);
    label = `${discount.value}% off`;
  } else if (discount.type === 'fixed') {
    discountAmount = Math.round(parseFloat(discount.value) * 100); // value is in dollars, convert to cents
    if (discountAmount > (subtotal || 0)) discountAmount = subtotal || 0; // Can't discount more than subtotal
    label = `$${parseFloat(discount.value).toFixed(2)} off`;
  } else if (discount.type === 'free_shipping') {
    discountAmount = 0; // Applied to shipping, not subtotal
    label = 'Free shipping';
  } else if (discount.type === 'bxgy') {
    const cfg = discount.config || {};
    const buyQty = cfg.buy_min_qty || 2;
    const getQty = cfg.get_qty || 1;
    const getPct = cfg.get_discount_percent || 100;
    const pctLabel = getPct === 100 ? 'Free' : `${getPct}% off`;
    label = `Buy ${buyQty} Get ${getQty} ${pctLabel}`;
    // Exact discount calculated at checkout when cart items are known
    discountAmount = 0;
  }

  return json({
    valid: true,
    code: discount.code,
    type: discount.type,
    value: parseFloat(discount.value),
    discountAmount,
    label,
    id: discount.id,
    ...(discount.type === 'bxgy' ? { config: discount.config } : {}),
  }, 200, corsOrigin);
}


async function dispatchToIntegrations(sb, env, storeId, eventType, data) {
  try {
    // GA4: send purchase event on order.created
    if (eventType === 'order.created') {
      sendGA4PurchaseEvent(sb, storeId, data).catch(err =>
        console.error('GA4 dispatch error:', err)
      );
    }

    // Twilio: send SMS for configured events
    sendTwilioEventNotification(sb, storeId, eventType, data).catch(err =>
      console.error('Twilio dispatch error:', err)
    );

    // Mailchimp: sync customer on order.created
    if (eventType === 'order.created' && data.customer_email) {
      syncCustomerToMailchimp(sb, storeId, data).catch(err =>
        console.error('Mailchimp sync error:', err)
      );
    }

    // Klaviyo: track event on order.created
    if (eventType === 'order.created' && data.customer_email) {
      trackKlaviyoEvent(sb, storeId, eventType, data).catch(err =>
        console.error('Klaviyo track error:', err)
      );
    }
  } catch (err) {
    console.error('Integration dispatch error:', err);
  }
}

async function syncCustomerToMailchimp(sb, storeId, order) {
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true, select: 'settings' });
  const settings = store?.settings || {};
  const apiKey = settings.mailchimp_api_key;
  if (!apiKey) return;

  // Extract datacenter from API key (format: key-dc)
  const dc = apiKey.split('-').pop() || 'us1';
  const listId = settings.mailchimp_list_id;
  if (!listId) return;

  const nameParts = (order.customer_name || '').split(' ');
  const body = {
    email_address: order.customer_email,
    status_if_new: 'subscribed',
    merge_fields: {
      FNAME: nameParts[0] || '',
      LNAME: nameParts.slice(1).join(' ') || '',
    },
    tags: ['customer'],
  };

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${order.customer_email}`, {
    method: 'PUT',
    headers: {
      'Authorization': `apikey ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Mailchimp sync failed:', res.status, err);
  }
}

async function trackKlaviyoEvent(sb, storeId, eventType, order) {
  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true, select: 'settings,name' });
  const settings = store?.settings || {};
  const apiKey = settings.klaviyo_api_key;
  if (!apiKey) return;

  const eventName = eventType === 'order.created' ? 'Placed Order' : eventType;
  const body = {
    data: {
      type: 'event',
      attributes: {
        metric: { data: { type: 'metric', attributes: { name: eventName } } },
        profile: {
          data: {
            type: 'profile',
            attributes: {
              email: order.customer_email,
              first_name: (order.customer_name || '').split(' ')[0] || undefined,
              last_name: (order.customer_name || '').split(' ').slice(1).join(' ') || undefined,
            },
          },
        },
        properties: {
          OrderId: order.id,
          OrderNumber: order.order_number,
          Value: (order.total || 0) / 100,
          Currency: 'USD',
          StoreName: store?.name || 'Store',
        },
        value: (order.total || 0) / 100,
        time: new Date().toISOString(),
      },
    },
  };

  const res = await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      'revision': '2024-02-15',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Klaviyo track failed:', res.status, err);
  }
}
