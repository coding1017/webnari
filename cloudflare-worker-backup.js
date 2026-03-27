// ═══════════════════════════════════════════════════════════════════
//  WEBNARI CLOUDFLARE WORKER — Backup & Domain Routing
//  Deploy: Add this to your webnari-tools worker or create a new one
//  KV Namespace: Create "WEBNARI_BACKUPS" in Cloudflare dashboard
//  and bind it to this worker
// ═══════════════════════════════════════════════════════════════════

// Add these routes to your existing worker's fetch handler:

// ── BACKUP ENDPOINTS ────────────────────────────────────
// POST /api/backup — Save a backup to KV
// GET  /api/backup — Retrieve the latest backup
// GET  /api/backup/list — List all backup timestamps

async function handleBackup(request, env) {
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Save backup
  if (request.method === 'POST' && url.pathname === '/api/backup') {
    try {
      const body = await request.json();
      const timestamp = new Date().toISOString();
      const key = 'backup_latest';
      const historyKey = 'backup_' + timestamp.slice(0, 10); // Daily key

      // Save as latest
      await env.WEBNARI_BACKUPS.put(key, JSON.stringify({
        data: body.data,
        timestamp: timestamp,
        size: JSON.stringify(body.data).length
      }));

      // Also save daily snapshot
      await env.WEBNARI_BACKUPS.put(historyKey, JSON.stringify({
        data: body.data,
        timestamp: timestamp
      }));

      // Track backup history (last 30 entries)
      let history = JSON.parse(await env.WEBNARI_BACKUPS.get('backup_history') || '[]');
      history.unshift({ date: timestamp, key: historyKey });
      if (history.length > 30) history = history.slice(0, 30);
      await env.WEBNARI_BACKUPS.put('backup_history', JSON.stringify(history));

      return new Response(JSON.stringify({ success: true, timestamp }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Get latest backup
  if (request.method === 'GET' && url.pathname === '/api/backup') {
    const data = await env.WEBNARI_BACKUPS.get('backup_latest');
    if (!data) {
      return new Response(JSON.stringify({ error: 'No backup found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(data, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // List backups
  if (request.method === 'GET' && url.pathname === '/api/backup/list') {
    const history = await env.WEBNARI_BACKUPS.get('backup_history');
    return new Response(history || '[]', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}


// ── DOMAIN ROUTING ──────────────────────────────────────
// Maps custom domains to Webnari template pages
// Configure in KV or hardcode here

const DOMAIN_ROUTES = {
  // Add client domains here:
  // 'pestprosfl.com': '/pestpro.html',
  // 'sparkelectricco.com': '/voltpro.html',
  // 'gastrosubs.com': '/gastrosubs.html',
};

async function handleDomainRouting(request, env) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Check if this is a custom domain request
  if (hostname !== 'webnari.io' && hostname !== 'www.webnari.io') {
    // Strip www if present
    const cleanHost = hostname.replace(/^www\./, '');

    // Check hardcoded routes
    let templatePath = DOMAIN_ROUTES[cleanHost];

    // Check KV for dynamic routes
    if (!templatePath && env.WEBNARI_BACKUPS) {
      templatePath = await env.WEBNARI_BACKUPS.get('domain_' + cleanHost);
    }

    if (templatePath) {
      // Fetch the template from webnari.io
      const templateUrl = 'https://webnari.io' + templatePath;
      const response = await fetch(templateUrl);
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Served-By': 'Webnari Domain Routing',
          'X-Original-Host': cleanHost,
        }
      });
    }
  }

  return null; // Not a custom domain, let normal routing handle it
}


// ── MAIN WORKER HANDLER ─────────────────────────────────
// Add this to your existing worker's fetch handler:
//
// export default {
//   async fetch(request, env) {
//     const url = new URL(request.url);
//
//     // Domain routing (check first)
//     const domainResponse = await handleDomainRouting(request, env);
//     if (domainResponse) return domainResponse;
//
//     // Backup endpoints
//     if (url.pathname.startsWith('/api/backup')) {
//       return handleBackup(request, env);
//     }
//
//     // ... your existing routes ...
//   }
// };
//
// WRANGLER.TOML — Add KV binding:
// [[kv_namespaces]]
// binding = "WEBNARI_BACKUPS"
// id = "your-kv-namespace-id"
