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
    const path = url.pathname;
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

      // Admin Products
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
