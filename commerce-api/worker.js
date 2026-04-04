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
    // Strip /commerce prefix if routed via webnari.io/commerce/*
    let path = url.pathname;
    if (path.startsWith('/commerce/')) {
      path = path.replace('/commerce', '');
    }
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

      // All other /api/ routes require X-Store-ID (except webhooks)
      if (!storeId && !isWebhook && path.startsWith('/api/')) {
        return json({ error: 'Missing X-Store-ID header' }, 400, corsOrigin);
      }

      // Store config
      if (method === 'GET' && path === '/api/store/config') {
        return await handleGetStoreConfig(sb, storeId, corsOrigin);
      }

      // ── Public Product Endpoints (storefront) ─────────
      if (method === 'GET' && path === '/api/products') {
        return await handlePublicListProducts(sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path === '/api/products/featured') {
        return await handlePublicFeaturedProducts(sb, storeId, url, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/products\/[^/]+$/)) {
        const productId = path.split('/').pop();
        return await handlePublicGetProduct(sb, storeId, productId, corsOrigin);
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
      if (method === 'GET' && path.match(/^\/api\/orders\/[^/]+$/)) {
        const orderId = path.split('/').pop();
        return await handleGetOrder(request, sb, storeId, orderId, corsOrigin);
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

      // Analytics
      if (method === 'GET' && path === '/api/admin/analytics') {
        return await handleAdminAnalytics(request, sb, env, storeId, url, corsOrigin);
      }

      // Admin Products
      if (method === 'GET' && path === '/api/admin/products/export') {
        return await handleAdminExportProducts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/products/import') {
        return await handleAdminImportProducts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/products') {
        return await handleAdminListProducts(request, sb, env, storeId, url, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/products') {
        return await handleAdminCreateProduct(request, sb, env, storeId, corsOrigin);
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

      // Admin Discounts
      if (method === 'GET' && path === '/api/admin/discounts') {
        return await handleAdminListDiscounts(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/admin/discounts') {
        return await handleAdminCreateDiscount(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path.match(/^\/api\/admin\/discounts\/[^/]+$/)) {
        const discountId = path.split('/').pop();
        return await handleAdminGetDiscount(request, sb, env, storeId, discountId, corsOrigin);
      }
      if (method === 'PATCH' && path.match(/^\/api\/admin\/discounts\/[^/]+$/)) {
        const discountId = path.split('/').pop();
        return await handleAdminUpdateDiscount(request, sb, env, storeId, discountId, corsOrigin);
      }
      if (method === 'DELETE' && path.match(/^\/api\/admin\/discounts\/[^/]+$/)) {
        const discountId = path.split('/').pop();
        return await handleAdminDeleteDiscount(request, sb, env, storeId, discountId, corsOrigin);
      }

      // Public discount endpoints
      if (method === 'POST' && path === '/api/discount/validate') {
        return await handleValidateDiscount(request, sb, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/discount/auto-apply') {
        return await handleAutoApplyDiscount(request, sb, storeId, corsOrigin);
      }

      // Abandoned cart
      if (method === 'POST' && path === '/api/cart/save') {
        return await handleSaveCart(request, sb, storeId, corsOrigin);
      }
      if (method === 'POST' && path === '/api/cart/send-reminders') {
        return await handleSendCartReminders(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/abandoned-carts') {
        return await handleAdminListAbandonedCarts(request, sb, env, storeId, corsOrigin);
      }

      // Admin Subscribers
      if (method === 'GET' && path === '/api/admin/subscribers') {
        return await handleAdminListSubscribers(request, sb, env, storeId, corsOrigin);
      }
      if (method === 'GET' && path === '/api/admin/subscribers/export') {
        return await handleAdminExportSubscribers(request, sb, env, storeId, corsOrigin);
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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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

// Admin auth check — expects Authorization: Bearer <admin-key>
function requireAdmin(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const adminKey = env.ADMIN_API_KEY;
  return adminKey && token === adminKey;
}


// ═══════════════════════════════════════════════════════════════
//  EMAIL SYSTEM
// ═══════════════════════════════════════════════════════════════

async function sendEmail(env, storeId, { to, subject, html }) {
  const apiKey = getStoreSecret(env, storeId, 'RESEND_API_KEY') || env.RESEND_API_KEY;
  if (!apiKey) return null; // Silently skip if not configured

  const fromEmail = getStoreSecret(env, storeId, 'EMAIL_FROM') || env.EMAIL_FROM || 'Webnari <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: fromEmail, to, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) console.error('Resend error:', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Email send failed:', err);
    return null;
  }
}

function emailHeader(storeName) {
  return `
    <div style="background:linear-gradient(135deg,#B8892A,#D4A63A);padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.02em;">${storeName}</h1>
    </div>`;
}

function emailFooter() {
  return `
    <div style="padding:24px 32px;text-align:center;border-top:1px solid #E4DDD3;">
      <p style="margin:0;color:#B0A8AD;font-size:11px;font-family:'Helvetica Neue',Arial,sans-serif;">
        Powered by <a href="https://webnari.io" style="color:#B8892A;text-decoration:none;font-weight:600;">Webnari</a>
      </p>
    </div>`;
}

function formatCentsEmail(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function buildOrderConfirmationHTML(storeName, order, items) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#3D3540;">
        ${item.product_name}${item.variant_name ? ` <span style="color:#7A7078;">— ${item.variant_name}</span>` : ''}
        <span style="color:#7A7078;"> x${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#1A1518;">
        ${formatCentsEmail(item.price * item.quantity)}
      </td>
    </tr>`).join('');

  const address = order.shipping_address;
  const addressHTML = address ? `
    <div style="margin-top:24px;padding:16px 20px;background:#FAF7F2;border-radius:8px;border:1px solid #E4DDD3;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;font-family:'Helvetica Neue',Arial,sans-serif;">Ship To</p>
      <p style="margin:0;font-size:14px;color:#1A1518;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.5;">
        ${order.customer_name || ''}<br>
        ${address.line1}${address.line2 ? '<br>' + address.line2 : ''}<br>
        ${address.city}, ${address.state} ${address.zip}
      </p>
    </div>` : '';

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#F2F0EC;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      ${emailHeader(storeName)}
      <div style="padding:32px;">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1A1518;">Order Confirmed</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#7A7078;">Thank you for your purchase, ${order.customer_name || 'there'}!</p>

        <div style="padding:12px 16px;background:#FAF7F2;border-radius:8px;border:1px solid #E4DDD3;margin-bottom:24px;">
          <p style="margin:0;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;">Order Number</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#B8892A;font-family:monospace;letter-spacing:0.03em;">${order.order_number}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;border-bottom:2px solid #E4DDD3;font-size:11px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;font-family:'Helvetica Neue',Arial,sans-serif;">Item</th>
              <th style="text-align:right;padding:8px 0;border-bottom:2px solid #E4DDD3;font-size:11px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;font-family:'Helvetica Neue',Arial,sans-serif;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:2px solid #E4DDD3;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#7A7078;font-family:'Helvetica Neue',Arial,sans-serif;">Subtotal</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#3D3540;font-family:'Helvetica Neue',Arial,sans-serif;">${formatCentsEmail(order.subtotal)}</td>
            </tr>
            ${order.discount_amount > 0 ? `<tr>
              <td style="padding:4px 0;font-size:13px;color:#3D9A5F;font-family:'Helvetica Neue',Arial,sans-serif;">Discount${order.discount_code ? ' (' + order.discount_code + ')' : ''}</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#3D9A5F;font-family:'Helvetica Neue',Arial,sans-serif;">-${formatCentsEmail(order.discount_amount)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#7A7078;font-family:'Helvetica Neue',Arial,sans-serif;">Shipping</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#3D3540;font-family:'Helvetica Neue',Arial,sans-serif;">${order.shipping > 0 ? formatCentsEmail(order.shipping) : 'Free'}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#7A7078;font-family:'Helvetica Neue',Arial,sans-serif;">Tax</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#3D3540;font-family:'Helvetica Neue',Arial,sans-serif;">${formatCentsEmail(order.tax)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1A1518;border-top:2px solid #E4DDD3;font-family:'Helvetica Neue',Arial,sans-serif;">Total</td>
              <td style="padding:12px 0 0;text-align:right;font-size:16px;font-weight:700;color:#1A1518;border-top:2px solid #E4DDD3;font-family:'Helvetica Neue',Arial,sans-serif;">${formatCentsEmail(order.total)}</td>
            </tr>
          </table>
        </div>

        ${addressHTML}
      </div>
      ${emailFooter()}
    </div>
  </body></html>`;
}

function buildShippingNotificationHTML(storeName, order) {
  const trackingHTML = order.tracking_url
    ? `<a href="${order.tracking_url}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:linear-gradient(135deg,#B8892A,#D4A63A);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;font-family:'Helvetica Neue',Arial,sans-serif;">Track Your Package</a>`
    : '';

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#F2F0EC;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      ${emailHeader(storeName)}
      <div style="padding:32px;">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1A1518;">Your Order Has Shipped!</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#7A7078;">Great news — your order is on its way.</p>

        <div style="padding:16px 20px;background:#FAF7F2;border-radius:8px;border:1px solid #E4DDD3;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;">Order</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;font-weight:700;color:#B8892A;font-family:monospace;">${order.order_number}</td>
            </tr>
            ${order.tracking_number ? `<tr>
              <td style="padding:4px 0;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;">Tracking #</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;color:#1A1518;font-family:monospace;">${order.tracking_number}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="text-align:center;">${trackingHTML}</div>
      </div>
      ${emailFooter()}
    </div>
  </body></html>`;
}

function buildRefundConfirmationHTML(storeName, order) {
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#F2F0EC;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      ${emailHeader(storeName)}
      <div style="padding:32px;">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1A1518;">Refund Processed</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#7A7078;">Your refund has been processed. Please allow 5-10 business days for the funds to appear.</p>

        <div style="padding:16px 20px;background:#FAF7F2;border-radius:8px;border:1px solid #E4DDD3;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;">Order</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;font-weight:700;color:#B8892A;font-family:monospace;">${order.order_number}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:12px;font-weight:700;color:#7A7078;text-transform:uppercase;letter-spacing:0.06em;">Refund Amount</td>
              <td style="padding:4px 0;text-align:right;font-size:16px;font-weight:700;color:#1A1518;">${formatCentsEmail(order.total)}</td>
            </tr>
          </table>
        </div>
      </div>
      ${emailFooter()}
    </div>
  </body></html>`;
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
  const { items, customer, shippingState, successUrl, cancelUrl, provider, discountCode, discountCodes } = body;
  // Support both single discountCode and array discountCodes
  const manualCodes = discountCodes || (discountCode ? [discountCode] : []);

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

  // ── 4. Apply discounts (manual codes + automatic) ────────
  let totalDiscountAmount = 0;
  const appliedDiscounts = [];
  let hasFreeshipping = false;
  let runningSubtotal = subtotal;

  // 4a. Check automatic discounts first
  const autoDiscounts = await findAutoDiscounts(sb, storeId, subtotal, customer.email, lineItems);
  for (const auto of autoDiscounts) {
    appliedDiscounts.push(auto);
    totalDiscountAmount += auto.amountOff;
    runningSubtotal -= auto.amountOff;
    if (auto.discount.type === 'free_shipping') hasFreeshipping = true;
  }

  // 4b. Apply manual discount codes (max 2)
  for (const code of manualCodes.slice(0, 2)) {
    const result = await validateDiscountCode(sb, storeId, code, runningSubtotal, customer.email, lineItems);
    if (!result.valid) {
      return json({ error: result.reason }, 400, corsOrigin);
    }
    // Check stackable
    if (!result.discount.stackable && (appliedDiscounts.length > 0)) {
      return json({ error: `Code "${code}" cannot be combined with other discounts` }, 400, corsOrigin);
    }
    if (appliedDiscounts.some(d => !d.discount.stackable)) {
      return json({ error: 'A non-stackable discount is already applied' }, 400, corsOrigin);
    }
    appliedDiscounts.push(result);
    totalDiscountAmount += result.amountOff;
    runningSubtotal -= result.amountOff;
    if (result.discount.type === 'free_shipping') hasFreeshipping = true;
  }

  // Ensure discount doesn't exceed subtotal
  totalDiscountAmount = Math.min(totalDiscountAmount, subtotal);
  const discountedSubtotal = subtotal - totalDiscountAmount;

  // ── 5. Calculate shipping ───────────────────────────────
  let shippingCost = calculateShippingFromRules(store.shipping_rules, discountedSubtotal);

  // Free shipping discount overrides
  if (hasFreeshipping) {
    shippingCost = 0;
  }

  // ── 6. Calculate tax ────────────────────────────────────
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

  const total = discountedSubtotal + shippingCost + taxAmount;

  // ── 6. Determine payment provider ───────────────────────
  const paymentProvider = provider || store.payment_provider;

  if (paymentProvider === 'stripe' || paymentProvider === 'both') {
    return await createStripeCheckout(sb, env, storeId, store, {
      lineItems, customer, subtotal: discountedSubtotal, shippingCost, taxAmount, total,
      shippingState, reservations, successUrl, cancelUrl,
      discountCode: appliedDiscounts.map(d => d.discount.code).join('+') || null,
      discountAmount: totalDiscountAmount,
    }, corsOrigin);
  }

  if (paymentProvider === 'square') {
    return await createSquareCheckout(sb, env, storeId, store, {
      lineItems, customer, subtotal: discountedSubtotal, shippingCost, taxAmount, total,
      shippingState, reservations, successUrl, cancelUrl,
      discountCode: appliedDiscounts.map(d => d.discount.code).join('+') || null,
      discountAmount: totalDiscountAmount,
    }, corsOrigin);
  }

  return json({ error: `Unsupported payment provider: ${paymentProvider}` }, 400, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  STRIPE
// ═══════════════════════════════════════════════════════════════

async function createStripeCheckout(sb, env, storeId, store, data, corsOrigin) {
  const stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
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

  // Create Stripe Checkout Session
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
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

  // Verify webhook signature
  const webhookSecret = getStoreSecret(env, storeId, 'STRIPE_WEBHOOK_SECRET');
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

  // Get line items from Stripe
  const stripeKey = getStoreSecret(env, storeId, 'STRIPE_SECRET_KEY');
  const liRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
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

      // Mark reservation completed
      await sb.update('inventory_reservations',
        { id: `eq.${res.id}` },
        { status: 'completed' }
      );
    }

    await sb.insert('order_items', orderItems);

    // Send order confirmation email
    if (order.customer_email) {
      const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
      const storeName = store?.name || storeId;
      sendEmail(env, storeId, {
        to: order.customer_email,
        subject: `Order Confirmed — #${order.order_number}`,
        html: buildOrderConfirmationHTML(storeName, order, orderItems),
      }).catch(err => console.error('Order confirmation email failed:', err));
    }
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

async function handleGetOrder(request, sb, storeId, orderId, corsOrigin) {
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

  return json({ ...order, items }, 200, corsOrigin);
}

async function handleListOrders(request, sb, env, storeId, url, corsOrigin) {
  const email = url.searchParams.get('email');
  const status = url.searchParams.get('status');
  const limit = url.searchParams.get('limit') || '50';
  const isAdmin = requireAdmin(request, env);

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
  if (!requireAdmin(request, env)) {
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

  // Send status change emails
  const updatedOrder = await sb.query('orders', { filters: { id: `eq.${orderId}` }, single: true });
  if (updatedOrder?.customer_email) {
    const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
    const storeName = store?.name || storeId;

    if (updates.status === 'shipped') {
      sendEmail(env, storeId, {
        to: updatedOrder.customer_email,
        subject: `Your Order Has Shipped — #${updatedOrder.order_number}`,
        html: buildShippingNotificationHTML(storeName, updatedOrder),
      }).catch(err => console.error('Shipping email failed:', err));
    }

    if (updates.status === 'refunded') {
      sendEmail(env, storeId, {
        to: updatedOrder.customer_email,
        subject: `Refund Processed — #${updatedOrder.order_number}`,
        html: buildRefundConfirmationHTML(storeName, updatedOrder),
      }).catch(err => console.error('Refund email failed:', err));
    }
  }

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
  if (!requireAdmin(request, env)) {
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
  if (!requireAdmin(request, env)) {
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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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

  return json(product, 201, corsOrigin);
}

async function handleAdminUpdateProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { images, ...productData } = body;

  // Update product fields
  const allowed = ['name', 'slug', 'category', 'description', 'price', 'compare_at_price',
    'badge', 'in_stock', 'track_inventory', 'stock_quantity', 'low_stock_threshold',
    'is_collection', 'rating', 'stripe_price_id', 'square_catalog_id', 'sort_order'];
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

  // Replace variants if provided
  const { variants } = body;
  if (variants !== undefined) {
    // Delete existing variants (cascade deletes variant_images)
    await sb.delete('variants', { product_id: `eq.${productId}` });
    if (variants?.length) {
      for (let i = 0; i < variants.length; i++) {
        const { images: vImages, ...vData } = variants[i];
        const [variant] = await sb.insert('variants', {
          product_id: productId,
          name: vData.name || '',
          color: vData.color || null,
          price: vData.price || null,
          in_stock: vData.in_stock !== undefined ? vData.in_stock : true,
          stock_quantity: vData.stock_quantity || 0,
          sku: vData.sku || null,
          size: vData.size || null,
          sort_order: i,
        });
        if (vImages?.length) {
          await sb.insert('variant_images', vImages.map((img, j) => ({
            variant_id: variant.id,
            url: typeof img === 'string' ? img : img.url,
            sort_order: j,
          })));
        }
      }
    }
  }

  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteProduct(request, sb, env, storeId, productId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  // Cascading delete handles images, variants, variant_images, reviews
  await sb.delete('products', { id: `eq.${productId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — VARIANTS
// ═══════════════════════════════════════════════════════════════

async function handleAdminCreateVariant(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('variants', { id: `eq.${variantId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — REVIEWS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListReviews(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('reviews', { id: `eq.${reviewId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListSubscribers(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const subscribers = await sb.query('newsletter_subscribers', {
    filters: { store_id: `eq.${storeId}` },
    order: 'subscribed_at.desc',
  });

  return json(subscribers, 200, corsOrigin);
}

async function handleAdminExportSubscribers(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('store_tax_rates', { id: `eq.${rateId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — CATEGORIES
// ═══════════════════════════════════════════════════════════════

async function handleAdminListCategories(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('categories', { id: `eq.${catId}`, store_id: `eq.${storeId}` });

  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  PUBLIC — STOREFRONT PRODUCT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

async function handlePublicListProducts(sb, storeId, url, corsOrigin) {
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort');
  const limit = url.searchParams.get('limit') || '100';
  const inStockOnly = url.searchParams.get('in_stock') === 'true';

  const filters = { store_id: `eq.${storeId}` };
  if (category) filters.category = `eq.${category}`;
  if (search) filters.name = `ilike.*${search}*`;
  if (inStockOnly) filters.in_stock = 'eq.true';

  let order = 'sort_order.asc,created_at.desc';
  if (sort === 'price-asc') order = 'price.asc';
  if (sort === 'price-desc') order = 'price.desc';
  if (sort === 'rating') order = 'rating.desc.nullslast';
  if (sort === 'newest') order = 'created_at.desc';

  const products = await sb.query('products', { filters, order, limit: parseInt(limit) });
  if (!products.length) return json([], 200, corsOrigin);

  // Batch fetch all images and variants for all products at once (2 queries total)
  const productIds = products.map(p => p.id);
  const idsFilter = `in.(${productIds.join(',')})`;

  const [allImages, allVariants] = await Promise.all([
    sb.query('product_images', { filters: { product_id: idsFilter }, order: 'sort_order.asc' }),
    sb.query('variants', { filters: { product_id: idsFilter }, order: 'sort_order.asc' }),
  ]);

  // Group by product_id
  const imagesByProduct = {};
  for (const img of allImages) {
    if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
    imagesByProduct[img.product_id].push(img.url);
  }

  const variantsByProduct = {};
  for (const v of allVariants) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
    variantsByProduct[v.product_id].push({
      id: v.id, name: v.name, color: v.color, size: v.size,
      sku: v.sku, price: v.price, inStock: v.in_stock,
      stockQuantity: v.stock_quantity, imgs: [],
    });
  }

  const enriched = products.map(p => {
    const imgs = imagesByProduct[p.id] || [];
    const variants = variantsByProduct[p.id] || [];
    return {
      id: p.id, name: p.name, slug: p.slug, category: p.category,
      price: p.price, compareAtPrice: p.compare_at_price, badge: p.badge,
      inStock: p.in_stock, stockQuantity: p.stock_quantity,
      desc: p.description,
      img: imgs[0] || null, imgs,
      rating: Number(p.rating) || 0, reviewCount: 0, reviews: [],
      isCollection: variants.length > 0, variants,
    };
  });

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

  const [images, variants, reviews] = await Promise.all([
    sb.query('product_images', { filters: { product_id: `eq.${product.id}` }, order: 'sort_order.asc' }),
    sb.query('variants', { filters: { product_id: `eq.${product.id}` }, order: 'sort_order.asc' }),
    sb.query('reviews', { filters: { product_id: `eq.${product.id}`, approved: 'eq.true' }, order: 'created_at.desc' }),
  ]);

  const variantsWithImages = await Promise.all(variants.map(async v => {
    const vImages = await sb.query('variant_images', {
      filters: { variant_id: `eq.${v.id}` },
      order: 'sort_order.asc',
    });
    return {
      id: v.id,
      name: v.name,
      color: v.color,
      size: v.size,
      sku: v.sku,
      price: v.price,
      inStock: v.in_stock,
      stockQuantity: v.stock_quantity,
      imgs: vImages.map(i => i.url),
    };
  }));

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount * 10) / 10
    : 0;

  return json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compare_at_price,
    badge: product.badge,
    inStock: product.in_stock,
    stockQuantity: product.stock_quantity,
    trackInventory: product.track_inventory,
    desc: product.description,
    img: images[0]?.url || null,
    imgs: images.map(i => i.url),
    rating: avgRating,
    reviewCount,
    reviews: reviews.map(r => ({ name: r.name, text: r.text, rating: r.rating, date: r.created_at })),
    isCollection: variants.length > 0,
    variants: variantsWithImages,
  }, 200, corsOrigin);
}

async function handlePublicFeaturedProducts(sb, storeId, url, corsOrigin) {
  const limit = url.searchParams.get('limit') || '8';

  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}`, in_stock: 'eq.true' },
    order: 'sort_order.asc,created_at.desc',
    limit: parseInt(limit),
  });

  const enriched = await Promise.all(products.map(async p => {
    const images = await sb.query('product_images', {
      filters: { product_id: `eq.${p.id}` },
      order: 'sort_order.asc',
      limit: 1,
    });
    const variants = await sb.query('variants', {
      select: 'id',
      filters: { product_id: `eq.${p.id}` },
    });

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      badge: p.badge,
      inStock: p.in_stock,
      img: images[0]?.url || null,
      rating: p.rating || 0,
      reviewCount: 0,
      isCollection: variants.length > 0,
      variantCount: variants.length,
    };
  }));

  return json(enriched, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  DISCOUNT VALIDATION (shared logic)
// ═══════════════════════════════════════════════════════════════

async function validateDiscountRecord(discount, sb, subtotal, customerEmail, lineItems) {
  // Shared validation for both code-based and automatic discounts
  if (!discount.is_active) return { valid: false, reason: 'This discount is no longer active' };

  const now = new Date();
  if (discount.starts_at && new Date(discount.starts_at) > now) {
    return { valid: false, reason: 'This discount is not yet active' };
  }
  if (discount.expires_at && new Date(discount.expires_at) < now) {
    return { valid: false, reason: 'This discount has expired' };
  }
  if (discount.max_uses !== null && discount.uses_count >= discount.max_uses) {
    return { valid: false, reason: 'This discount has been fully redeemed' };
  }
  if (discount.max_uses_per_customer !== null && customerEmail) {
    const usage = await sb.query('discount_usage', {
      filters: { discount_id: `eq.${discount.id}`, customer_email: `eq.${customerEmail}` },
    });
    if (usage.length >= discount.max_uses_per_customer) {
      return { valid: false, reason: 'You have already used this discount' };
    }
  }
  if (discount.min_subtotal !== null && subtotal < discount.min_subtotal) {
    const minDollars = (discount.min_subtotal / 100).toFixed(2);
    return { valid: false, reason: `Minimum purchase of $${minDollars} required` };
  }

  let amountOff = 0;
  const value = parseFloat(discount.value);

  if (discount.type === 'percentage') {
    amountOff = Math.round(subtotal * value / 100);
  } else if (discount.type === 'fixed') {
    amountOff = Math.min(Math.round(value), subtotal);
  } else if (discount.type === 'free_shipping') {
    amountOff = 0; // Handled in shipping calc
  } else if (discount.type === 'buy_x_get_y' && lineItems) {
    // Buy-X-Get-Y logic
    const buyQty = discount.buy_min_qty || 1;
    const getQty = discount.get_qty || 1;
    const getPercent = parseFloat(discount.get_discount_percent || 100);
    const buyCategory = discount.buy_category;
    const getCategory = discount.get_category || buyCategory;

    // Count qualifying "buy" items
    let qualifyingBuyItems = [];
    let qualifyingGetItems = [];

    for (const item of lineItems) {
      const matchesBuy = !buyCategory || item.category === buyCategory;
      const matchesGet = !getCategory || item.category === getCategory;

      if (matchesBuy) {
        for (let i = 0; i < item.quantity; i++) {
          qualifyingBuyItems.push(item.price);
        }
      }
      if (matchesGet) {
        for (let i = 0; i < item.quantity; i++) {
          qualifyingGetItems.push(item.price);
        }
      }
    }

    if (qualifyingBuyItems.length < buyQty) {
      return { valid: false, reason: `Add ${buyQty} qualifying items to use this discount` };
    }

    // Sort get items by price ascending (discount the cheapest)
    qualifyingGetItems.sort((a, b) => a - b);
    const itemsToDiscount = qualifyingGetItems.slice(0, getQty);

    for (const price of itemsToDiscount) {
      amountOff += Math.round(price * getPercent / 100);
    }
  }

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value,
      stackable: discount.stackable,
      is_automatic: discount.is_automatic,
    },
    amountOff,
  };
}

async function validateDiscountCode(sb, storeId, code, subtotal, customerEmail, lineItems) {
  const discount = await sb.query('discount_codes', {
    filters: { store_id: `eq.${storeId}`, code: `eq.${code.toUpperCase().trim()}` },
    single: true,
  });
  if (!discount) return { valid: false, reason: 'Invalid discount code' };
  return validateDiscountRecord(discount, sb, subtotal, customerEmail, lineItems);
}

async function findAutoDiscounts(sb, storeId, subtotal, customerEmail, lineItems) {
  // Find all active automatic discounts for this store
  const autos = await sb.query('discount_codes', {
    filters: { store_id: `eq.${storeId}`, is_automatic: 'eq.true', is_active: 'eq.true' },
  });

  const results = [];
  for (const discount of autos) {
    const result = await validateDiscountRecord(discount, sb, subtotal, customerEmail, lineItems);
    if (result.valid) results.push(result);
  }

  // Sort by amountOff descending (best deal first)
  results.sort((a, b) => b.amountOff - a.amountOff);
  return results;
}


// ═══════════════════════════════════════════════════════════════
//  PUBLIC — DISCOUNT VALIDATION ENDPOINT
// ═══════════════════════════════════════════════════════════════

async function handleValidateDiscount(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { code, subtotal, customerEmail } = body;
  if (!code) return json({ error: 'Discount code required' }, 400, corsOrigin);
  if (subtotal === undefined) return json({ error: 'Subtotal required' }, 400, corsOrigin);

  const result = await validateDiscountCode(sb, storeId, code, subtotal, customerEmail, null);
  if (!result.valid) {
    return json({ valid: false, reason: result.reason }, 200, corsOrigin);
  }

  return json({
    valid: true,
    code: result.discount.code,
    type: result.discount.type,
    value: result.discount.value,
    amountOff: result.amountOff,
    description: result.discount.type === 'percentage'
      ? `${result.discount.value}% off`
      : result.discount.type === 'fixed'
        ? `$${(result.discount.value / 100).toFixed(2)} off`
        : 'Free shipping',
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — DISCOUNTS
// ═══════════════════════════════════════════════════════════════

async function handleAdminListDiscounts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const discounts = await sb.query('discount_codes', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.desc',
  });

  const now = new Date();
  const enriched = discounts.map(d => {
    let status = 'active';
    if (!d.is_active) status = 'paused';
    else if (d.expires_at && new Date(d.expires_at) < now) status = 'expired';
    else if (d.starts_at && new Date(d.starts_at) > now) status = 'scheduled';
    else if (d.max_uses !== null && d.uses_count >= d.max_uses) status = 'exhausted';
    return { ...d, status };
  });

  return json(enriched, 200, corsOrigin);
}

async function handleAdminCreateDiscount(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  if (!body.type) return json({ error: 'Type is required' }, 400, corsOrigin);
  const isAutomatic = body.is_automatic || false;
  if (!isAutomatic && !body.code) return json({ error: 'Code is required for non-automatic discounts' }, 400, corsOrigin);

  const code = body.code ? body.code.toUpperCase().trim().replace(/\s+/g, '') : `AUTO_${Date.now()}`;
  const validTypes = ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'];
  if (!validTypes.includes(body.type)) return json({ error: 'Invalid discount type' }, 400, corsOrigin);

  // Check for duplicate code (only for non-automatic)
  if (!isAutomatic) {
    const existing = await sb.query('discount_codes', {
      filters: { store_id: `eq.${storeId}`, code: `eq.${code}` },
      single: true,
    });
    if (existing) return json({ error: `Discount code "${code}" already exists` }, 400, corsOrigin);
  }

  const [discount] = await sb.insert('discount_codes', {
    store_id: storeId,
    code,
    type: body.type,
    value: body.value || 0,
    min_subtotal: body.min_subtotal || null,
    max_uses: body.max_uses || null,
    max_uses_per_customer: body.max_uses_per_customer ?? 1,
    category_restriction: body.category_restriction || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
    is_automatic: isAutomatic,
    stackable: body.stackable !== undefined ? body.stackable : true,
    starts_at: body.starts_at || null,
    expires_at: body.expires_at || null,
    buy_min_qty: body.buy_min_qty || null,
    buy_category: body.buy_category || null,
    buy_product_id: body.buy_product_id || null,
    get_qty: body.get_qty || 1,
    get_category: body.get_category || null,
    get_product_id: body.get_product_id || null,
    get_discount_percent: body.get_discount_percent || 100,
  });

  return json(discount, 201, corsOrigin);
}

async function handleAdminGetDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const discount = await sb.query('discount_codes', {
    filters: { id: `eq.${discountId}`, store_id: `eq.${storeId}` },
    single: true,
  });
  if (!discount) return json({ error: 'Discount not found' }, 404, corsOrigin);

  const usage = await sb.query('discount_usage', {
    filters: { discount_id: `eq.${discountId}` },
    order: 'created_at.desc',
    limit: 50,
  });

  return json({ ...discount, usage }, 200, corsOrigin);
}

async function handleAdminUpdateDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const allowed = ['code', 'type', 'value', 'min_subtotal', 'max_uses', 'max_uses_per_customer',
    'category_restriction', 'is_active', 'is_automatic', 'stackable', 'starts_at', 'expires_at',
    'buy_min_qty', 'buy_category', 'buy_product_id', 'get_qty', 'get_category', 'get_product_id', 'get_discount_percent'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = key === 'code' ? body[key].toUpperCase().trim() : body[key];
    }
  }
  if (Object.keys(updates).length === 0) return json({ error: 'No valid fields' }, 400, corsOrigin);

  await sb.update('discount_codes', { id: `eq.${discountId}`, store_id: `eq.${storeId}` }, updates);
  return json({ updated: true }, 200, corsOrigin);
}

async function handleAdminDeleteDiscount(request, sb, env, storeId, discountId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  await sb.delete('discount_codes', { id: `eq.${discountId}`, store_id: `eq.${storeId}` });
  return json({ deleted: true }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  PUBLIC — AUTO-APPLY DISCOUNT ENDPOINT
// ═══════════════════════════════════════════════════════════════

async function handleAutoApplyDiscount(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { subtotal, customerEmail, items } = body;

  if (subtotal === undefined) return json({ error: 'Subtotal required' }, 400, corsOrigin);

  const lineItems = items || [];
  const results = await findAutoDiscounts(sb, storeId, subtotal, customerEmail, lineItems);

  if (results.length === 0) {
    return json({ applied: false, discounts: [] }, 200, corsOrigin);
  }

  return json({
    applied: true,
    discounts: results.map(r => ({
      code: r.discount.code || '(automatic)',
      type: r.discount.type,
      value: r.discount.value,
      amountOff: r.amountOff,
      description: r.discount.type === 'percentage'
        ? `${r.discount.value}% off (automatic)`
        : r.discount.type === 'fixed'
          ? `$${(r.discount.value / 100).toFixed(2)} off (automatic)`
          : r.discount.type === 'free_shipping'
            ? 'Free shipping (automatic)'
            : r.discount.type === 'buy_x_get_y'
              ? 'Buy & save (automatic)'
              : 'Discount applied',
    })),
    totalSaved: results.reduce((sum, r) => sum + r.amountOff, 0),
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ABANDONED CART SYSTEM
// ═══════════════════════════════════════════════════════════════

async function handleSaveCart(request, sb, storeId, corsOrigin) {
  const body = await request.json();
  const { sessionId, email, items, total } = body;

  if (!sessionId) return json({ error: 'sessionId required' }, 400, corsOrigin);
  if (!items?.length) {
    // Empty cart — delete any existing record
    await sb.delete('abandoned_carts', { store_id: `eq.${storeId}`, session_id: `eq.${sessionId}` });
    return json({ saved: true }, 200, corsOrigin);
  }

  // Upsert cart
  const existing = await sb.query('abandoned_carts', {
    filters: { store_id: `eq.${storeId}`, session_id: `eq.${sessionId}` },
    single: true,
  });

  if (existing) {
    await sb.update('abandoned_carts',
      { id: `eq.${existing.id}` },
      {
        customer_email: email || existing.customer_email,
        cart_items: items,
        cart_total: total || 0,
        updated_at: new Date().toISOString(),
      }
    );
  } else {
    await sb.insert('abandoned_carts', {
      store_id: storeId,
      session_id: sessionId,
      customer_email: email || null,
      cart_items: items,
      cart_total: total || 0,
    });
  }

  return json({ saved: true }, 200, corsOrigin);
}

async function handleSendCartReminders(request, sb, env, storeId, corsOrigin) {
  // This can be called by a cron job or manually from admin
  // Find carts older than 1 hour with an email, not yet reminded, not recovered

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const carts = await sb.query('abandoned_carts', {
    filters: {
      store_id: `eq.${storeId}`,
      reminder_sent: 'eq.false',
      recovered: 'eq.false',
      updated_at: `lt.${oneHourAgo}`,
    },
  });

  // Filter to ones with emails
  const cartsWithEmail = carts.filter(c => c.customer_email);

  const store = await sb.query('stores', { filters: { id: `eq.${storeId}` }, single: true });
  const storeName = store?.name || storeId;
  const domain = store?.domain || 'webnari.io';
  let sent = 0;

  for (const cart of cartsWithEmail) {
    const items = cart.cart_items || [];
    if (items.length === 0) continue;

    await sendEmail(env, storeId, {
      to: cart.customer_email,
      subject: `You left something behind! — ${storeName}`,
      html: buildAbandonedCartHTML(storeName, domain, items, cart.cart_total),
    }).catch(() => {});

    await sb.update('abandoned_carts',
      { id: `eq.${cart.id}` },
      { reminder_sent: true, reminder_sent_at: new Date().toISOString() }
    );
    sent++;
  }

  return json({ sent, total: cartsWithEmail.length }, 200, corsOrigin);
}

async function handleAdminListAbandonedCarts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const carts = await sb.query('abandoned_carts', {
    filters: { store_id: `eq.${storeId}` },
    order: 'updated_at.desc',
    limit: 50,
  });

  return json(carts, 200, corsOrigin);
}

function buildAbandonedCartHTML(storeName, domain, items, total) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#3D3540;">
        ${item.name || item.productName || 'Item'}
        ${item.quantity > 1 ? `<span style="color:#7A7078;"> x${item.quantity}</span>` : ''}
      </td>
    </tr>`).join('');

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#F2F0EC;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg,#B8892A,#D4A63A);padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${storeName}</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1A1518;">You left something behind!</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#7A7078;line-height:1.6;">
          Looks like you were checking out some great items. They're still waiting for you — but they won't last forever!
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tbody>${itemRows}</tbody>
        </table>

        ${total > 0 ? `<p style="margin:0 0 24px;font-size:16px;font-weight:700;color:#1A1518;">Cart Total: $${(total / 100).toFixed(2)}</p>` : ''}

        <div style="text-align:center;">
          <a href="https://${domain}/shop" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#B8892A,#D4A63A);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
            Complete Your Order
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;text-align:center;border-top:1px solid #E4DDD3;">
        <p style="margin:0;color:#B0A8AD;font-size:11px;">
          Powered by <a href="https://webnari.io" style="color:#B8892A;text-decoration:none;font-weight:600;">Webnari</a>
        </p>
      </div>
    </div>
  </body></html>`;
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — ANALYTICS
// ═══════════════════════════════════════════════════════════════

async function handleAdminAnalytics(request, sb, env, storeId, url, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const range = url.searchParams.get('range') || '30d';

  // Calculate date ranges
  const now = new Date();
  let daysBack = 30;
  if (range === '7d') daysBack = 7;
  else if (range === '90d') daysBack = 90;
  else if (range === 'all') daysBack = 365 * 5;

  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const prevStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // Fetch all orders for this store
  const allOrders = await sb.query('orders', {
    filters: { store_id: `eq.${storeId}` },
    order: 'created_at.asc',
  });

  // Filter by date ranges
  const currentOrders = allOrders.filter(o => new Date(o.created_at) >= startDate);
  const previousOrders = allOrders.filter(o => {
    const d = new Date(o.created_at);
    return d >= prevStartDate && d < startDate;
  });

  // Valid orders (not cancelled/refunded)
  const validCurrent = currentOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
  const validPrevious = previousOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');

  // Revenue
  const currentRevenue = validCurrent.reduce((sum, o) => sum + (o.total || 0), 0);
  const previousRevenue = validPrevious.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueChange = previousRevenue > 0 ? Math.round((currentRevenue - previousRevenue) / previousRevenue * 1000) / 10 : 0;

  // Orders count
  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const ordersChange = previousOrderCount > 0 ? Math.round((currentOrderCount - previousOrderCount) / previousOrderCount * 1000) / 10 : 0;

  // Customers
  const currentEmails = new Set(currentOrders.map(o => o.customer_email).filter(Boolean));
  const allTimeEmails = new Set(allOrders.filter(o => new Date(o.created_at) < startDate).map(o => o.customer_email).filter(Boolean));
  const newCustomers = [...currentEmails].filter(e => !allTimeEmails.has(e)).length;
  const returningCustomers = currentEmails.size - newCustomers;

  // Avg order value
  const avgOrderValue = validCurrent.length > 0 ? Math.round(currentRevenue / validCurrent.length) : 0;

  // Revenue by day
  const revenueByDay = {};
  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = { date: key, revenue: 0, orders: 0 };
  }
  for (const order of validCurrent) {
    const key = order.created_at.slice(0, 10);
    if (revenueByDay[key]) {
      revenueByDay[key].revenue += order.total || 0;
      revenueByDay[key].orders += 1;
    }
  }

  // Status breakdown
  const statusBreakdown = {};
  for (const order of currentOrders) {
    statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
  }

  // Top products
  const productRevenue = {};
  // Fetch order items for current orders
  for (const order of validCurrent) {
    const items = await sb.query('order_items', { filters: { order_id: `eq.${order.id}` } });
    for (const item of items) {
      const key = item.product_name;
      if (!productRevenue[key]) productRevenue[key] = { name: key, revenue: 0, quantity: 0 };
      productRevenue[key].revenue += (item.price || 0) * (item.quantity || 1);
      productRevenue[key].quantity += item.quantity || 1;
    }
  }
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return json({
    range,
    revenue: { total: currentRevenue, previous: previousRevenue, change: revenueChange },
    orders: { total: currentOrderCount, previous: previousOrderCount, change: ordersChange },
    customers: { total: currentEmails.size, new: newCustomers, returning: returningCustomers },
    avgOrderValue,
    revenueByDay: Object.values(revenueByDay),
    statusBreakdown,
    topProducts,
  }, 200, corsOrigin);
}


// ═══════════════════════════════════════════════════════════════
//  ADMIN — CSV PRODUCT EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════════

async function handleAdminExportProducts(request, sb, env, storeId, corsOrigin) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const products = await sb.query('products', {
    filters: { store_id: `eq.${storeId}` },
    order: 'sort_order.asc,created_at.desc',
  });

  // Get images and variants for each product
  const rows = [];
  for (const p of products) {
    const images = await sb.query('product_images', {
      filters: { product_id: `eq.${p.id}` },
      order: 'sort_order.asc',
    });
    const variants = await sb.query('variants', {
      filters: { product_id: `eq.${p.id}` },
      order: 'sort_order.asc',
    });

    if (variants.length === 0) {
      // Product without variants — one row
      rows.push({
        id: p.id,
        name: p.name,
        slug: p.slug || '',
        category: p.category || '',
        price: (p.price / 100).toFixed(2),
        compare_at_price: p.compare_at_price ? (p.compare_at_price / 100).toFixed(2) : '',
        description: (p.description || '').replace(/"/g, '""'),
        badge: p.badge || '',
        in_stock: p.in_stock ? 'yes' : 'no',
        stock_quantity: p.stock_quantity,
        low_stock_threshold: p.low_stock_threshold,
        track_inventory: p.track_inventory ? 'yes' : 'no',
        variant_name: '',
        variant_sku: '',
        variant_color: '',
        variant_size: '',
        variant_price: '',
        variant_stock: '',
        image_urls: images.map(i => i.url).join('|'),
      });
    } else {
      // Product with variants — one row per variant
      for (const v of variants) {
        rows.push({
          id: p.id,
          name: p.name,
          slug: p.slug || '',
          category: p.category || '',
          price: (p.price / 100).toFixed(2),
          compare_at_price: p.compare_at_price ? (p.compare_at_price / 100).toFixed(2) : '',
          description: (p.description || '').replace(/"/g, '""'),
          badge: p.badge || '',
          in_stock: p.in_stock ? 'yes' : 'no',
          stock_quantity: p.stock_quantity,
          low_stock_threshold: p.low_stock_threshold,
          track_inventory: p.track_inventory ? 'yes' : 'no',
          variant_name: v.name,
          variant_sku: v.sku || '',
          variant_color: v.color || '',
          variant_size: v.size || '',
          variant_price: v.price ? (v.price / 100).toFixed(2) : '',
          variant_stock: v.stock_quantity,
          image_urls: images.map(i => i.url).join('|'),
        });
      }
    }
  }

  const headers = ['id','name','slug','category','price','compare_at_price','description','badge','in_stock','stock_quantity','low_stock_threshold','track_inventory','variant_name','variant_sku','variant_color','variant_size','variant_price','variant_stock','image_urls'];
  const csvHeader = headers.join(',');
  const csvRows = rows.map(r => headers.map(h => {
    const val = String(r[h] ?? '');
    return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
  }).join(','));

  const csv = [csvHeader, ...csvRows].join('\n');

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
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, corsOrigin);

  const body = await request.json();
  const { rows } = body; // Array of objects with CSV column names

  if (!rows?.length) return json({ error: 'No rows to import' }, 400, corsOrigin);

  let created = 0;
  let updated = 0;
  let errors = [];

  // Group rows by product (id or name+slug combo)
  const productGroups = {};
  for (const row of rows) {
    const key = row.id || row.slug || row.name;
    if (!key) { errors.push('Row missing name/slug/id'); continue; }
    if (!productGroups[key]) productGroups[key] = { product: row, variants: [] };
    if (row.variant_name) {
      productGroups[key].variants.push(row);
    }
  }

  for (const [key, group] of Object.entries(productGroups)) {
    const row = group.product;
    const price = Math.round(parseFloat(row.price || '0') * 100);
    const compareAtPrice = row.compare_at_price ? Math.round(parseFloat(row.compare_at_price) * 100) : null;

    const productData = {
      store_id: storeId,
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: row.category || null,
      price,
      compare_at_price: compareAtPrice,
      description: row.description || null,
      badge: row.badge || null,
      in_stock: row.in_stock !== 'no',
      stock_quantity: parseInt(row.stock_quantity) || 0,
      low_stock_threshold: parseInt(row.low_stock_threshold) || 5,
      track_inventory: row.track_inventory !== 'no',
    };

    try {
      // Check if product exists (by id or slug)
      let existing = null;
      if (row.id) {
        existing = await sb.query('products', {
          filters: { id: `eq.${row.id}`, store_id: `eq.${storeId}` },
          single: true,
        });
      }
      if (!existing && row.slug) {
        existing = await sb.query('products', {
          filters: { slug: `eq.${productData.slug}`, store_id: `eq.${storeId}` },
          single: true,
        });
      }

      let productId;
      if (existing) {
        // Update existing
        await sb.update('products', { id: `eq.${existing.id}` }, productData);
        productId = existing.id;
        updated++;
      } else {
        // Create new
        const [newProduct] = await sb.insert('products', productData);
        productId = newProduct.id;
        created++;
      }

      // Handle images
      if (row.image_urls) {
        await sb.delete('product_images', { product_id: `eq.${productId}` });
        const urls = row.image_urls.split('|').filter(Boolean);
        if (urls.length > 0) {
          await sb.insert('product_images', urls.map((url, i) => ({
            product_id: productId,
            url: url.trim(),
            sort_order: i,
          })));
        }
      }

      // Handle variants
      if (group.variants.length > 0) {
        await sb.delete('variants', { product_id: `eq.${productId}` });
        for (let i = 0; i < group.variants.length; i++) {
          const v = group.variants[i];
          await sb.insert('variants', {
            product_id: productId,
            name: v.variant_name,
            sku: v.variant_sku || null,
            color: v.variant_color || null,
            size: v.variant_size || null,
            price: v.variant_price ? Math.round(parseFloat(v.variant_price) * 100) : null,
            stock_quantity: parseInt(v.variant_stock) || 0,
            in_stock: parseInt(v.variant_stock) > 0,
            sort_order: i,
          });
        }
      }
    } catch (err) {
      errors.push(`Failed to import "${row.name}": ${err.message}`);
    }
  }

  return json({ created, updated, errors: errors.slice(0, 10), total: Object.keys(productGroups).length }, 200, corsOrigin);
}
