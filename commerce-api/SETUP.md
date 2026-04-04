# Webnari Commerce API — Setup Guide

## 1. Run the Database Migration

Go to **Supabase Dashboard → SQL Editor** and paste the contents of `schema.sql`. Run it.

This creates: `stores`, `store_tax_rates`, `products`, `variants`, `orders`, `order_items`, `inventory_reservations`, `reviews`, `newsletter_subscribers`, `wishlist_items` — plus RLS policies and helper functions.

It also seeds a `wookwear` store with Florida 7% tax and shipping rules (free over $100, otherwise $8).

## 2. Set Worker Secrets

```bash
cd commerce-api

# Supabase (required)
wrangler secret put SUPABASE_URL        # https://pkcpdihrksxyslkqiwbn.supabase.co
wrangler secret put SUPABASE_SERVICE_KEY # your service_role key

# Admin API key (for protected routes like inventory updates, order management)
wrangler secret put ADMIN_API_KEY        # generate a strong random key

# Stripe — per store (replace WOOKWEAR with store ID uppercase)
wrangler secret put STRIPE_SECRET_KEY_WOOKWEAR
wrangler secret put STRIPE_WEBHOOK_SECRET_WOOKWEAR

# Square — per store (optional)
wrangler secret put SQUARE_ACCESS_TOKEN_WOOKWEAR
wrangler secret put SQUARE_WEBHOOK_SIG_WOOKWEAR
```

## 3. Deploy the Worker

```bash
cd commerce-api
wrangler deploy
```

The worker deploys to `webnari-commerce.workers.dev`. Add a custom route in Cloudflare dashboard if you want `commerce.webnari.io`.

## 4. Set Up Stripe Webhook

In Stripe Dashboard → Developers → Webhooks:
- Endpoint URL: `https://webnari-commerce.<your-subdomain>.workers.dev/api/checkout/webhook/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

## 5. Integrate with Any Template

### Static HTML (drop-in)
```html
<script src="https://webnari.io/commerce-client.js"></script>
<script>
  const shop = new WebnariCommerce('wookwear');

  // Add to cart
  shop.addToCart('product-id', 'variant-id', 1);

  // Checkout
  document.getElementById('checkout-btn').addEventListener('click', async () => {
    await shop.checkout(
      { email: 'customer@example.com', name: 'Jane Doe' },
      'FL'  // shipping state
    );
    // Redirects to Stripe/Square checkout page
  });

  // Handle return from checkout
  const result = shop.handleCheckoutReturn();
  if (result === true) {
    // Show success message — cart was cleared automatically
  }
</script>
```

### Next.js
```js
import WebnariCommerce from '../commerce-client';
const shop = new WebnariCommerce('wookwear', {
  apiBase: 'https://webnari-commerce.workers.dev'
});
```

## 6. Add a New Store

1. Insert into `stores` table in Supabase
2. Add tax rates to `store_tax_rates`
3. Set the store's Stripe/Square secrets: `wrangler secret put STRIPE_SECRET_KEY_NEWSTORE`
4. Use `new WebnariCommerce('newstore')` on the frontend

## API Routes Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | — | Health check |
| GET | `/api/store/config` | — | Public store config |
| POST | `/api/checkout/create` | — | Create checkout session |
| POST | `/api/checkout/webhook/stripe` | Signature | Stripe webhook |
| POST | `/api/checkout/webhook/square` | Signature | Square webhook |
| GET | `/api/orders/:id?email=` | — | Get order (customer) |
| GET | `/api/orders?email=` | — / Admin | List orders |
| PATCH | `/api/orders/:id` | Admin | Update order status/tracking |
| GET | `/api/inventory/:productId` | — | Get stock levels |
| PATCH | `/api/inventory/:productId` | Admin | Update stock |
| GET | `/api/inventory/low-stock` | Admin | Low stock items |
| POST | `/api/shipping/calculate` | — | Calculate shipping cost |
| POST | `/api/tax/calculate` | — | Calculate tax |

Admin routes require `Authorization: Bearer <ADMIN_API_KEY>` header.
